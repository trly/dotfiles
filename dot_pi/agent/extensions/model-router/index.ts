/**
 * model-router — dynamic model selection based on prompt intent.
 *
 * Before each agent turn, the incoming prompt is classified into a routing
 * tier by a cheap classifier model, and the session model is switched to the
 * tier's configured model. The switch happens before the first LLM call of
 * the turn, so the whole turn runs on the selected model.
 *
 * Edit the ROUTER_CONFIG table below to change tiers, models, or the
 * classifier. Reload with /reload after editing.
 */
import { uuidv7 } from "@earendil-works/pi-ai";
import {
	type ExtensionAPI,
	type ExtensionContext,
	type ReadonlyFooterDataProvider,
	type Theme,
} from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { isAbsolute, relative, resolve, sep } from "node:path";

type ModelRef = { provider: string; id: string };

type Tier = {
	key: string;
	description: string;
	model: ModelRef;
	/** Optional thinking level to set when this tier is selected. */
	thinkingLevel?: "off" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";
};

const ROUTER_CONFIG = {
	/** Model used for intent classification. Keep it cheap and fast. */
	classifier: { provider: "opencode-go", id: "glm-5.3-flash" } as ModelRef,

	/**
	 * Routing tiers, cheapest first. The classifier picks one key.
	 * Tier choices informed by GSO (software-optimization) and Aider polyglot
	 * benchmark findings; see the conversation that configured this.
	 */
	tiers: [
		{
			key: "trivial",
			description:
				"Quick questions, factual answers, tiny single-line edits, formatting, " +
				"simple lookups, typos, renames, comments, anything with no real complexity.",
			model: { provider: "opencode-go", id: "glm-5.3-flash" },
		},
		{
			key: "normal",
			description:
				"Everyday coding: implementing features, multi-step edits, refactors of a few files, " +
				"routine debugging, running tests, normal explanation work.",
			model: { provider: "opencode-go", id: "glm-5.3-flash" },
			thinkingLevel: "max",
		},
		{
			key: "heavy",
			description:
				"Hard high-level work: architecture and design, large multi-file refactors, deep analysis, " +
				"complex planning, gnarly debugging in high-level code, subtle concurrency/perf issues " +
				"that do NOT primarily involve low-level languages.",
			model: { provider: "openai-codex", id: "gpt-5.6-terra" },
			thinkingLevel: "xhigh",
		},
		{
			key: "systems",
			description:
				"Low-level systems work: anything primarily involving C, C++, Rust, Cython, SIMD/AVX/SSE " +
				"intrinsics, memory layout and alignment, unsafe code, FFI bindings, or native build " +
				"systems. Prefer systems over heavy whenever the core changes touch native or " +
				"low-level code, even if the surrounding repo is mostly Python.",
			model: { provider: "openai-codex", id: "gpt-6-astra" },
			thinkingLevel: "xhigh",
		},
	] as Tier[],

	/** Classification call timeout in ms; falls back to "normal" on timeout. */
	timeoutMs: 10_000,
} as const;

const DEFAULT_TIER_KEY = "normal";

const CONTINUATION_RE =
	/^(continue|go on|keep going|ok(ay)?|yes|yeah|yep|sure|do it|proceed|next|again|thanks|thank you|tysm|nice|great|good|lgtm|ship it|looks good|try again|retry)\b[.!]?\s*$/i;

const STATUS_ID = "model-router";

/** Providers billed through a subscription rather than per-token ("(sub)" in footer). */
const SUBSCRIPTION_PROVIDERS = new Set(["kimi-coding", "opencode-go", "opencode"]);

const formatTokens = (count: number): string => {
	if (count < 1000) return count.toString();
	if (count < 10_000) return `${(count / 1000).toFixed(1)}k`;
	if (count < 1_000_000) return `${Math.round(count / 1000)}k`;
	if (count < 10_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
	return `${Math.round(count / 1_000_000)}M`;
};

const formatCwdForFooter = (cwd: string, home: string): string => {
	const resolvedCwd = resolve(cwd);
	const resolvedHome = resolve(home);
	const rel = relative(resolvedHome, resolvedCwd);
	const insideHome = rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
	if (!insideHome) return resolvedCwd;
	return rel === "" ? "~" : `~${sep}${rel}`;
};

const sanitizeStatusText = (text: string): string =>
	text.replace(/[\r\n\t]/g, " ").replace(/ +/g, " ").trim();

const DEBUG = process.env.ROUTER_DEBUG === "1";
const debugLog = (...parts: unknown[]): void => {
	if (DEBUG) {
		console.error("[model-router]", ...parts);
	}
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const findTier = (key: string): Tier | undefined =>
	ROUTER_CONFIG.tiers.find((tier) => tier.key === key);

const tierLabel = (tier: Tier): string => `${tier.model.provider}/${tier.model.id}`;

const resolveTierModel = (
	tier: Tier,
	ctx: ExtensionContext,
): { tier: Tier; model: ReturnType<ExtensionContext["modelRegistry"]["find"]> | undefined } => {
	// Fall back through progressively cheaper tiers when auth is missing.
	const ordered = [tier, ...ROUTER_CONFIG.tiers.slice().reverse().filter((t) => t.key !== tier.key)];
	for (const candidate of ordered) {
		const model = ctx.modelRegistry.find(candidate.model.provider, candidate.model.id);
		if (model && ctx.modelRegistry.hasConfiguredAuth(model)) {
			return { tier: candidate, model };
		}
	}
	return { tier, model: undefined };
};

const recentUserText = (
	ctx: ExtensionContext,
	maxMessages: number,
	maxCharsPerMessage: number,
	excludeText: string,
): string[] => {
	const texts: string[] = [];
	const branch = ctx.sessionManager.getBranch();
	for (let i = branch.length - 1; i >= 0 && texts.length < maxMessages; i--) {
		const entry = branch[i];
		if (entry.type !== "message" || entry.message.role !== "user") continue;
		const content = entry.message.content;
		const text =
			typeof content === "string"
				? content
				: Array.isArray(content)
					? content
							.filter((part): part is { type: "text"; text: string } => part.type === "text")
							.map((part) => part.text)
							.join("\n")
					: "";
		const trimmed = text.trim();
		if (trimmed.length === 0 || trimmed === excludeText) continue;
		texts.unshift(
			trimmed.length > maxCharsPerMessage
				? `${trimmed.slice(0, maxCharsPerMessage)}…`
				: trimmed,
		);
	}
	return texts;
};

/**
 * Nested model calls made through ctx.modelRegistry bypass the agent's stream
 * wrapper, which is where pi injects opencode session headers. Mirror that
 * behavior here so opencode-hosted models accept nested calls.
 */
const nestedCallHeaders = (model: { provider: string; baseUrl?: string }): Record<string, string> => {
	let host = "";
	try {
		host = model.baseUrl ? new URL(model.baseUrl).hostname : "";
	} catch {
		host = "";
	}
	const isOpencode =
		model.provider === "opencode" ||
		model.provider === "opencode-go" ||
		host === "opencode.ai" ||
		host.endsWith(".opencode.ai");
	if (!isOpencode) {
		return {};
	}
	return { "x-opencode-session": uuidv7(), "x-opencode-client": "pi" };
};

const classify = async (
	prompt: string,
	previousUserText: string,
	ctx: ExtensionContext,
): Promise<Tier> => {
	const tierList = ROUTER_CONFIG.tiers.map((tier) => `- ${tier.key}: ${tier.description}`).join("\n");
	const contextBlock =
		previousUserText.length > 0
			? `\n<recent_context>\n${previousUserText}\n</recent_context>\n`
			: "";

	const classifierMessage = [
		"You are the intent classifier for a coding agent's model router.",
		"Classify the user's next request into exactly one routing tier.",
		"",
		"Routing tiers:",
		tierList,
		contextBlock,
		"Guidelines:",
		"- Judge the complexity of the REASONING the request needs, not the length of the reply it asks for.",
		"- A request for a brief answer about a complex topic still belongs to the tier of the topic's complexity.",
		"- Short replies like \"continue\" or \"yes\" usually belong to the tier of the work they continue.",
		"- When unsure between two tiers, pick the cheaper one.",
		"",
		`<user_request>\n${prompt.slice(0, 6000)}\n</user_request>`,
		"",
		"Respond with ONLY the tier key and nothing else.",
	].join("\n");

	const tierKeys = ROUTER_CONFIG.tiers.map((tier) => tier.key);

	const timeoutController = new AbortController();
	const timeout = setTimeout(() => timeoutController.abort(), ROUTER_CONFIG.timeoutMs);
	try {
		const classifier = ctx.modelRegistry.find(
			ROUTER_CONFIG.classifier.provider,
			ROUTER_CONFIG.classifier.id,
		);
		if (!classifier || !ctx.modelRegistry.hasConfiguredAuth(classifier)) {
			return findTier(DEFAULT_TIER_KEY) as Tier;
		}

		const response = await ctx.modelRegistry.complete(
			classifier,
			{
				messages: [
					{
						role: "user" as const,
						content: [{ type: "text" as const, text: classifierMessage }],
						timestamp: Date.now(),
					},
				],
			},
			{
				cacheRetention: "none",
				sessionId: uuidv7(),
				signal: timeoutController.signal,
				transformHeaders: (headers) => ({
					...headers,
					...nestedCallHeaders(classifier),
				}),
			},
		);

		const text = response.content
			.filter((c): c is { type: "text"; text: string } => c.type === "text")
			.map((c) => c.text)
			.join(" ")
			.toLowerCase();

		debugLog(
			"blocks:",
			JSON.stringify(response.content.map((c) => ({ type: c.type, text: "text" in c ? (c as { text: string }).text.slice(0, 100) : undefined }))),
			"stopReason:",
			response.stopReason,
			"error:",
			response.errorMessage,
			"diagnostics:",
			JSON.stringify(response.diagnostics ?? null),
		);

		const matched = tierKeys.find((key) => new RegExp(`\\b${key}\\b`).test(text));
		debugLog("classifier reply:", JSON.stringify(text.slice(0, 200)), "→", matched ?? DEFAULT_TIER_KEY);
		return (matched ? findTier(matched) : findTier(DEFAULT_TIER_KEY)) as Tier;
	} catch {
		return findTier(DEFAULT_TIER_KEY) as Tier;
	} finally {
		clearTimeout(timeout);
	}
};

const applyTier = async (
	tier: Tier,
	ctx: ExtensionContext,
	pi: ExtensionAPI,
): Promise<boolean> => {
	const { tier: effectiveTier, model } = resolveTierModel(tier, ctx);
	if (!model) {
		ctx.ui.notify(`model-router: no auth for ${tierLabel(tier)}`, "warning");
		return false;
	}

	const current = ctx.model;
	const currentKey = current ? `${current.provider}/${current.id}` : "";
	const targetKey = tierLabel(effectiveTier);

	if (currentKey !== targetKey) {
		const success = await pi.setModel(model);
		if (!success) {
			ctx.ui.notify(`model-router: could not switch to ${targetKey}`, "warning");
			return false;
		}
	}

	if (effectiveTier.thinkingLevel && pi.getThinkingLevel() !== effectiveTier.thinkingLevel) {
		pi.setThinkingLevel(effectiveTier.thinkingLevel);
	}

	ctx.ui.setStatus(
		STATUS_ID,
		`router: ${effectiveTier.key} → ${effectiveTier.model.id}`,
	);
	routerStatusText = `${effectiveTier.key} → ${effectiveTier.model.id}`;
	return true;
};

/** Right-aligned footer text shown under the model indicator (custom footer). */
let routerStatusText = "auto";

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

const renderRouterFooter = (
	ctx: ExtensionContext,
	pi: ExtensionAPI,
	theme: Theme,
	footerData: ReadonlyFooterDataProvider,
	routerText: string,
	width: number,
): string[] => {
	// Usage totals — mirrors pi's default footer accounting.
	const totals = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cost: 0 };
	let latestCacheHitRate: number | undefined;
	for (const entry of ctx.sessionManager.getEntries()) {
		if (entry.type === "message") {
			const message = entry.message;
			if (message.role === "assistant") {
				const usage = message.usage;
				totals.input += usage.input;
				totals.output += usage.output;
				totals.cacheRead += usage.cacheRead;
				totals.cacheWrite += usage.cacheWrite;
				totals.cost += usage.cost.total;
				const promptTokens = usage.input + usage.cacheRead + usage.cacheWrite;
				if (promptTokens > 0) {
					latestCacheHitRate = (usage.cacheRead / promptTokens) * 100;
				}
			} else if (message.role === "toolResult" && message.usage) {
				totals.input += message.usage.input;
				totals.output += message.usage.output;
				totals.cacheRead += message.usage.cacheRead;
				totals.cacheWrite += message.usage.cacheWrite;
				totals.cost += message.usage.cost.total;
			}
		} else if (
			(entry.type === "branch_summary" || entry.type === "compaction") &&
			"usage" in entry &&
			entry.usage
		) {
			const usage = entry.usage as { input: number; output: number; cacheRead: number; cacheWrite: number; cost: { total: number } };
			totals.input += usage.input;
			totals.output += usage.output;
			totals.cacheRead += usage.cacheRead;
			totals.cacheWrite += usage.cacheWrite;
			totals.cost += usage.cost.total;
		}
	}

	// Line 1: cwd (branch) • session name
	let pwd = formatCwdForFooter(ctx.cwd, process.env.HOME || process.env.USERPROFILE || ".");
	const branch = footerData.getGitBranch();
	if (branch) {
		pwd = `${pwd} (${branch})`;
	}
	const sessionName = pi.getSessionName();
	if (sessionName) {
		pwd = `${pwd} • ${sessionName}`;
	}

	// Line 2: stats (left) + model indicator (right)
	const statsParts: string[] = [];
	if (totals.input) statsParts.push(`↑${formatTokens(totals.input)}`);
	if (totals.output) statsParts.push(`↓${formatTokens(totals.output)}`);
	if (totals.cacheRead) statsParts.push(`R${formatTokens(totals.cacheRead)}`);
	if (totals.cacheWrite) statsParts.push(`W${formatTokens(totals.cacheWrite)}`);
	if ((totals.cacheRead > 0 || totals.cacheWrite > 0) && latestCacheHitRate !== undefined) {
		statsParts.push(`CH${latestCacheHitRate.toFixed(1)}%`);
	}
	const usingSubscription = ctx.model
		? SUBSCRIPTION_PROVIDERS.has(ctx.model.provider)
		: false;
	if (totals.cost || usingSubscription) {
		statsParts.push(`$${totals.cost.toFixed(3)}${usingSubscription ? " (sub)" : ""}`);
	}

	const contextUsage = ctx.getContextUsage();
	const contextWindow = contextUsage?.contextWindow ?? ctx.model?.contextWindow ?? 0;
	const contextPercentValue = contextUsage?.percent ?? 0;
	const contextPercentDisplay =
		contextUsage?.percent == null
			? `?/${formatTokens(contextWindow)} (auto)`
			: `${contextPercentValue.toFixed(1)}%/${formatTokens(contextWindow)} (auto)`;
	const contextPercentStr =
		contextPercentValue > 90
			? theme.fg("error", contextPercentDisplay)
			: contextPercentValue > 70
				? theme.fg("warning", contextPercentDisplay)
				: contextPercentDisplay;
	statsParts.push(contextPercentStr);

	let statsLeft = statsParts.join(" ");
	let statsLeftWidth = visibleWidth(statsLeft);
	if (statsLeftWidth > width) {
		statsLeft = truncateToWidth(statsLeft, width, "...");
		statsLeftWidth = visibleWidth(statsLeft);
	}

	const modelName = ctx.model?.id || "no-model";
	let rightSide = modelName;
	if (ctx.model?.reasoning) {
		const thinkingLevel = ctx.thinkingLevel;
		rightSide = thinkingLevel === "off" ? `${modelName} • thinking off` : `${modelName} • ${thinkingLevel}`;
	}
	if (footerData.getAvailableProviderCount() > 1 && ctx.model) {
		const withProvider = `(${ctx.model.provider}) ${rightSide}`;
		if (statsLeftWidth + 2 + visibleWidth(withProvider) <= width) {
			rightSide = withProvider;
		}
	}
	const rightSideWidth = visibleWidth(rightSide);
	let statsLine: string;
	if (statsLeftWidth + 2 + rightSideWidth <= width) {
		const pad = " ".repeat(width - statsLeftWidth - rightSideWidth);
		statsLine = theme.fg("dim", statsLeft) + theme.fg("dim", pad + rightSide);
	} else {
		const availableForRight = width - statsLeftWidth - 2;
		if (availableForRight > 0) {
			const truncatedRight = truncateToWidth(rightSide, availableForRight, "");
			const truncatedRightWidth = visibleWidth(truncatedRight);
			const pad = " ".repeat(Math.max(0, width - statsLeftWidth - truncatedRightWidth));
			statsLine = theme.fg("dim", statsLeft) + theme.fg("dim", pad + truncatedRight);
		} else {
			statsLine = theme.fg("dim", statsLeft);
		}
	}

	// Line 3: other extensions' statuses (left) + router text (right, under model)
	const otherStatuses = Array.from(footerData.getExtensionStatuses().entries())
		.filter(([key]) => key !== STATUS_ID)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([, text]) => sanitizeStatusText(text))
		.filter((text) => text.length > 0)
		.join(" ");
	const routerLabel = theme.fg("dim", "router: ");
	const routerValue = theme.fg("accent", routerText);
	const routerRight = routerLabel + routerValue;
	const leftWidth = visibleWidth(otherStatuses);
	const rightWidth = visibleWidth(routerRight);
	let thirdLine: string;
	if (leftWidth + 2 + rightWidth <= width) {
		const pad3 = " ".repeat(width - leftWidth - rightWidth);
		thirdLine = (leftWidth > 0 ? otherStatuses : "") + pad3 + routerRight;
	} else {
		const availableForRouter = Math.max(0, width - leftWidth - 2);
		thirdLine =
			(leftWidth > 0 ? otherStatuses + "  " : "") +
			truncateToWidth(routerRight, availableForRouter, "...");
	}

	return [truncateToWidth(theme.fg("dim", pwd), width, theme.fg("dim", "...")), statsLine, thirdLine];
};

// ---------------------------------------------------------------------------
// Extension
// ---------------------------------------------------------------------------

export default function (pi: ExtensionAPI) {
	let enabled = true;
	let lastTierKey: string | undefined;
	let busy = false;

	const installRouterFooter = (ctx: ExtensionContext): void => {
		if (ctx.mode !== "tui") return;
		ctx.ui.setFooter((tui, theme, footerData) => {
			const unsubscribe = footerData.onBranchChange(() => tui.requestRender());
			return {
				dispose: unsubscribe,
				invalidate() {},
				render(width: number): string[] {
					return renderRouterFooter(ctx, pi, theme, footerData, routerStatusText, width);
				},
			};
		});
	};

	pi.on("session_start", async (_event, ctx) => {
		lastTierKey = undefined;
		routerStatusText = "auto";
		if (ctx.hasUI) {
			ctx.ui.setStatus(STATUS_ID, "router: auto");
		}
		installRouterFooter(ctx);
	});

	pi.on("session_shutdown", async (_event, ctx) => {
		if (ctx.mode === "tui") {
			ctx.ui.setFooter(undefined);
		}
	});

	pi.on("before_agent_start", async (event, ctx) => {
		if (!enabled || busy) return;
		const prompt = event.prompt.trim();
		if (prompt.length === 0) return;

		// Continuation-style prompts keep the tier of the work they continue.
		const isContinuation = prompt.split(/\s+/).length <= 4 && CONTINUATION_RE.test(prompt);
		if (isContinuation && lastTierKey) {
			const tier = findTier(lastTierKey);
			if (tier) {
				await applyTier(tier, ctx, pi);
				return;
			}
		}

		// Skip mid-run steering/follow-up prompts: switching models mid-run
		// would fragment the turn and invalidate prompt cache.
		if (!ctx.isIdle()) return;

		busy = true;
		try {
			const previousUserText = recentUserText(ctx, 2, 500, prompt).join("\n\n");
			const tier = await classify(prompt, previousUserText, ctx);
			debugLog("routed", JSON.stringify(prompt.slice(0, 80)), "→", tier.key, tierLabel(tier));
			await applyTier(tier, ctx, pi);
			lastTierKey = tier.key;
		} finally {
			busy = false;
		}
	});

	pi.registerCommand("router", {
		description: "Show or toggle the intent-based model router",
		getArgumentCompletions: (prefix: string) => {
			const items = [
				{ value: "status", label: "status", description: "Show routing table and state" },
				{ value: "on", label: "on", description: "Enable automatic routing" },
				{ value: "off", label: "off", description: "Disable automatic routing" },
			].filter((item) => item.value.startsWith(prefix));
			return items.length > 0 ? items : null;
		},
		handler: async (args, ctx) => {
			const arg = args.trim().toLowerCase();
			if (arg === "off") {
				enabled = false;
				routerStatusText = "off";
				ctx.ui.setStatus(STATUS_ID, "router: off");
				ctx.ui.notify("model-router disabled", "info");
				return;
			}
			if (arg === "on") {
				enabled = true;
				routerStatusText = "auto";
				ctx.ui.setStatus(STATUS_ID, "router: auto");
				ctx.ui.notify("model-router enabled", "info");
				return;
			}

			// status (default)
			const tierLines = ROUTER_CONFIG.tiers.map(
				(tier) =>
					`  ${tier.key.padEnd(8)} → ${tierLabel(tier)}${tier.thinkingLevel ? ` (thinking: ${tier.thinkingLevel})` : ""}`,
			);
			const currentModel = ctx.model;
			const lines = [
				`model-router: ${enabled ? "enabled" : "disabled"}`,
				`classifier:   ${ROUTER_CONFIG.classifier.provider}/${ROUTER_CONFIG.classifier.id}`,
				`last tier:    ${lastTierKey ?? "(none yet)"}`,
				`active model: ${currentModel ? `${currentModel.provider}/${currentModel.id}` : "(none)"}`,
				"",
				"Routing table:",
				...tierLines,
			];
			ctx.ui.notify(lines.join("\n"), "info");
		},
	});
}

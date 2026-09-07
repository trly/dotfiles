/**
 * Ask-the-user-questions tool, modeled on opencode's `question` tool
 * (github.com/anomalyco/opencode: packages/opencode/src/tool/question.txt + question.ts).
 *
 * Lets the agent stop and ask the user 1-4 structured questions while it works
 * instead of guessing: short header, options with descriptions, recommended
 * option first, optional multi-select, and an automatic "Type your own answer"
 * escape hatch.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
	Editor,
	type EditorTheme,
	Key,
	matchesKey,
	Text,
	visibleWidth,
	wrapTextWithAnsi,
} from "@earendil-works/pi-tui";
import { Type } from "typebox";

interface Option {
	label: string;
	description?: string;
}

interface Question {
	question: string;
	header: string;
	options: Option[];
	multiple?: boolean;
	custom?: boolean;
}

interface QuestionDetails {
	questions: Array<{ header: string; question: string; answers: string[] }>;
}

type DisplayOption = Option & { isOther?: boolean };

const OptionSchema = Type.Object({
	label: Type.String({
		description:
			'Display text (1-5 words, concise). If you recommend this option, make it the first option and add "(Recommended)" at the end of the label.',
	}),
	description: Type.String({ description: "Short explanation of the choice" }),
});

const QuestionSchema = Type.Object({
	question: Type.String({ description: "The complete question to ask the user" }),
	header: Type.String({ description: "Very short label for the question (max 30 chars)" }),
	options: Type.Array(OptionSchema, {
		description:
			'Available choices (2-4). Don\'t include "Other" or catch-all options; a "Type your own answer" option is added automatically.',
	}),
	multiple: Type.Optional(
		Type.Boolean({ description: "Allow selecting more than one option (default: false)" }),
	),
	custom: Type.Optional(
		Type.Boolean({ description: "Allow typing a custom answer instead of picking an option (default: true)" }),
	),
});

const toolDescription = `Ask the user one or more questions during execution and wait for their answers. This allows you to:
1. Gather user preferences or requirements
2. Clarify ambiguous instructions
3. Get decisions on implementation choices as you work
4. Offer choices to the user about what direction to take

Always prefer this tool over guessing: stop and ask whenever you are unsure how to proceed or there is an issue with what the user has asked for or designed.

Usage notes:
- Ask 1-4 questions in one call; each question has its own options and the user can navigate back and forth between them
- When \`custom\` is enabled (default), a "Type your own answer" option is added automatically; don't include "Other" or catch-all options
- If you recommend a specific option, make it the first option in the list and add "(Recommended)" at the end of the label`;

export default function question(pi: ExtensionAPI) {
	pi.registerTool({
		name: "question",
		label: "Question",
		description: toolDescription,
		promptGuidelines: [
			"Use question to stop and ask the user whenever you are unsure how to proceed, when an instruction is ambiguous, or when there is an issue with what the user has asked for or designed, instead of guessing or silently picking an interpretation.",
		],
		parameters: Type.Object({
			questions: Type.Array(QuestionSchema, { description: "Questions to ask the user" }),
		}),
		executionMode: "sequential",

		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const questions = params.questions;

			if (!Array.isArray(questions) || questions.length === 0) {
				return {
					content: [{ type: "text", text: "Error: no questions provided" }],
					details: { questions: [] } as QuestionDetails,
				};
			}

			if (ctx.mode !== "tui") {
				return {
					content: [{ type: "text", text: "Error: UI not available (running in non-interactive mode)" }],
					details: { questions: questions.map((q) => ({ ...q, answers: [] })) } as QuestionDetails,
				};
			}

			type AskOneResult = { kind: "answers"; answers: string[] } | { kind: "back" } | { kind: "cancelled" };

const askOne = async (
	q: Question,
	index: number,
	total: number,
	allowBack: boolean,
	initialAnswers: string[],
): Promise<AskOneResult> => {
				const allowCustom = q.custom !== false;
				const multiple = q.multiple === true;
				const allOptions: DisplayOption[] = [
					...(q.options ?? []),
					...(allowCustom ? [{ label: "Type your own answer", isOther: true }] : []),
				];

				const result = await ctx.ui.custom<AskOneResult>(
					(tui, theme, _kb, done) => {
						let optionIndex = 0;
						let editMode = false;
						const selected = new Set<number>();
						for (let i = 0; i < (q.options ?? []).length; i++) {
							if (initialAnswers.includes(q.options[i]?.label ?? "\u0000")) {
								selected.add(i);
							}
						}
						let cachedLines: string[] | undefined;

						const editorTheme: EditorTheme = {
							borderColor: (s) => theme.fg("accent", s),
							selectList: {
								selectedPrefix: (t) => theme.fg("accent", t),
								selectedText: (t) => theme.fg("accent", t),
								description: (t) => theme.fg("muted", t),
								scrollInfo: (t) => theme.fg("dim", t),
								noMatch: (t) => theme.fg("warning", t),
							},
						};
						const editor = new Editor(tui, editorTheme);

						editor.onSubmit = (value) => {
							const trimmed = value.trim();
							if (!trimmed) {
								editMode = false;
								editor.setText("");
								refresh();
								return;
							}
							const answers = [
								...Array.from(selected, (i) => allOptions[i]?.label ?? "").filter(Boolean),
								trimmed,
							];
							done({ kind: "answers", answers });
						};

						function refresh() {
							cachedLines = undefined;
							tui.requestRender();
						}

						function handleInput(data: string) {
							if (editMode) {
								if (matchesKey(data, Key.escape)) {
									editMode = false;
									editor.setText("");
									refresh();
									return;
								}
								editor.handleInput(data);
								refresh();
								return;
							}

							if (matchesKey(data, Key.up)) {
								optionIndex = Math.max(0, optionIndex - 1);
								refresh();
								return;
							}
							if (matchesKey(data, Key.down)) {
								optionIndex = Math.min(allOptions.length - 1, optionIndex + 1);
								refresh();
								return;
							}

							if (allowBack && matchesKey(data, Key.left)) {
								done({ kind: "back" });
								return;
							}

							if (matchesKey(data, Key.enter)) {
								const opt = allOptions[optionIndex];
								if (!opt) return;
								if (opt.isOther) {
									editMode = true;
									refresh();
									return;
								}
								if (multiple) {
									if (selected.size === 0) {
										selected.add(optionIndex);
									}
									const answers = Array.from(selected, (i) => allOptions[i]?.label ?? "").filter(Boolean);
									done({ kind: "answers", answers });
									return;
								}
								done({ kind: "answers", answers: [opt.label] });
								return;
							}

							if (multiple && matchesKey(data, Key.space)) {
								const opt = allOptions[optionIndex];
								if (opt && !opt.isOther) {
									if (selected.has(optionIndex)) {
										selected.delete(optionIndex);
									} else {
										selected.add(optionIndex);
									}
									refresh();
								}
								return;
							}

							if (matchesKey(data, Key.escape)) {
								done({ kind: "cancelled" });
							}
						}

						function render(width: number): string[] {
							if (cachedLines) return cachedLines;

							const lines: string[] = [];
							const renderWidth = Math.max(1, width);

							function addWrapped(text: string) {
								lines.push(...wrapTextWithAnsi(text, renderWidth));
							}

							function addWrappedWithPrefix(prefix: string, text: string) {
								const prefixWidth = visibleWidth(prefix);
								if (prefixWidth >= renderWidth) {
									addWrapped(prefix + text);
									return;
								}
								const wrapped = wrapTextWithAnsi(text, renderWidth - prefixWidth);
								const continuationPrefix = " ".repeat(prefixWidth);
								for (let i = 0; i < wrapped.length; i++) {
									lines.push(`${i === 0 ? prefix : continuationPrefix}${wrapped[i]}`);
								}
							}

							const counter = total > 1 ? theme.fg("dim", ` (${index}/${total})`) : "";
							lines.push(theme.fg("accent", "─".repeat(renderWidth)));
							addWrappedWithPrefix(" ", theme.fg("accent", theme.bold(q.header)) + counter);
							addWrappedWithPrefix(" ", theme.fg("text", q.question));
							lines.push("");

							for (let i = 0; i < allOptions.length; i++) {
								const opt = allOptions[i];
								const selectedCursor = i === optionIndex;
								const checked = selected.has(i);
								const isOther = opt.isOther === true;

								let prefix: string;
								let checkbox = "";
								if (multiple && !isOther) {
									checkbox = checked ? theme.fg("accent", "◉ ") : theme.fg("muted", "○ ");
								}
								if (selectedCursor) {
									prefix = theme.fg("accent", "> ");
								} else {
									prefix = "  ";
								}

								const label = isOther && editMode ? `${opt.label} ✎` : opt.label;
								const color = selectedCursor || (isOther && editMode) ? "accent" : "text";

								addWrappedWithPrefix(prefix, theme.fg(color, checkbox + label));

								if (opt.description) {
									addWrappedWithPrefix("     ", theme.fg("muted", opt.description));
								}
							}

							if (editMode) {
								lines.push("");
								addWrappedWithPrefix(" ", theme.fg("muted", "Your answer:"));
								for (const line of editor.render(Math.max(1, renderWidth - 2))) {
									lines.push(` ${line}`);
								}
							}

							lines.push("");
							let hint: string;
							const backHint = allowBack ? " • ← back" : "";
							if (editMode) {
								hint = "Enter to submit • Esc to go back";
							} else if (multiple) {
								hint = `↑↓ navigate • Space to select • Enter to confirm${backHint} • Esc to cancel`;
							} else {
								hint = `↑↓ navigate • Enter to select${backHint} • Esc to cancel`;
							}
							addWrappedWithPrefix(" ", theme.fg("dim", hint));
							lines.push(theme.fg("accent", "─".repeat(renderWidth)));

							cachedLines = lines;
							return lines;
						}

						return {
							render,
							invalidate: () => {
								cachedLines = undefined;
							},
							handleInput,
						};
					},
				);

			return result;
			};

			const details: QuestionDetails["questions"] = questions.map((q) => ({
				header: q.header,
				question: q.question,
				answers: [],
			}));

			let i = 0;
			let cancelled = false;
			while (i < questions.length) {
				const result = await askOne(questions[i], i + 1, questions.length, i > 0, details[i].answers);
				if (result.kind === "back") {
					details[i].answers = [];
					i = Math.max(0, i - 1);
					continue;
				}
				if (result.kind === "cancelled") {
					cancelled = true;
					break;
				}
				details[i].answers = result.answers;
				i++;
			}
			if (cancelled) {
				for (let j = i; j < questions.length; j++) details[j].answers = [];
			}

			const formatted = questions
				.map((q, i) => {
					const answers = details[i]?.answers ?? [];
					return `"${q.question}"="${answers.length ? answers.join(", ") : "Unanswered"}"`;
				})
				.join(", ");

			const allAnswered = details.every((d) => d.answers.length > 0);

			return {
				content: [
					{
						type: "text",
						text: allAnswered
							? `User has answered your questions: ${formatted}. You can now continue with the user's answers in mind.`
							: `User has answered your questions: ${formatted}. If a question is Unanswered, ask again with clearer options or continue without that answer.`,
					},
				],
				details: { questions: details } as QuestionDetails,
			};
		},

		renderCall(args, theme, _context) {
			let text = theme.fg("toolTitle", theme.bold("question "));
			const questions: Question[] = Array.isArray(args?.questions) ? args.questions : [];
			if (questions.length) {
				text += theme.fg("muted", questions.map((q) => q.header).join(", "));
				for (const q of questions) {
					text += `\n${theme.fg("text", q.question ?? "")}`;
					const opts = Array.isArray(q.options) ? q.options : [];
					if (opts.length) {
						text += `\n${theme.fg("dim", `  ${opts.map((o) => o.label).join(" • ")}`)}`;
					}
				}
			}
			return new Text(text, 0, 0);
		},

		renderResult(result, _options, theme, _context) {
			const details = result.details as QuestionDetails | undefined;
			if (!details || !details.questions) {
				const content = result.content[0];
				return new Text(content?.type === "text" ? content.text : "", 0, 0);
			}

			const lines: string[] = [];
			for (const q of details.questions) {
				if (q.answers.length === 0) {
					lines.push(theme.fg("warning", `✗ ${q.header}: Unanswered`));
				} else {
					lines.push(theme.fg("success", "✓ ") + theme.fg("accent", `${q.header}: `) + q.answers.join(", "));
				}
			}
			return new Text(lines.join("\n"), 0, 0);
		},
	});
}

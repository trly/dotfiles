import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const JJ_VCS_INSTRUCTIONS = `

VCS preference:
- This working directory is a Jujutsu/jj repository.
- Prefer \`jj\` for version-control operations.
- Use \`git\` only when \`jj\` is unavailable or when a required operation has no practical \`jj\` equivalent.
- Common mappings:
  - status: \`jj status\`
  - diff: \`jj diff\`
  - log/history: \`jj log\`
  - show current change: \`jj show\`
  - commit/describe current change: \`jj describe\`
  - new change: \`jj new\`
  - fetch/push git remotes: \`jj git fetch\` / \`jj git push\`
`;

export default function (pi: ExtensionAPI) {
	pi.on("before_agent_start", async (event, _ctx) => {
		const jjRoot = await pi.exec("jj", ["root"], { timeout: 2000 });

		if (jjRoot.code !== 0) {
			return;
		}

		return {
			systemPrompt: event.systemPrompt + JJ_VCS_INSTRUCTIONS,
		};
	});
}

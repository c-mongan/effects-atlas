# Optional design iteration tools

The runtime library is tool-neutral. Contributors can use these upstream design skills in their preferred compatible agent:

- [Anthropic frontend-design](https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design/skills/frontend-design): design direction and frontend craft. Follow the upstream installation and license terms.
- [Impeccable](https://github.com/pbakaus/impeccable): design critique and iteration tools. Follow the upstream README for supported clients and current installation instructions.

These are links to optional tools, not vendored skills, installed plugins or runtime dependencies. No install hook downloads or executes them. A design tool's output still needs visual review and the same provenance, motion, input and fallback checks as a human contribution.

Suggested brief: inspect the selected story through Storybook MCP, preserve the existing API and source attribution, improve hierarchy/composition at desktop and 390px, then compare Default, Paused and Fallback. Keep meaningful content readable and do not introduce remote fonts/assets, hover-only essential controls, unbounded animation or external telemetry.

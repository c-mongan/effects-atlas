import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";
const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    docs: { codePanel: true },
    a11y: { test: "error" },
    controls: { expanded: true },
    options: { storySort: { order: ["Start here", "Effects"] } },
  },
};
export default preview;

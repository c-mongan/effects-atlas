import type { Meta, StoryObj } from "@storybook/react-vite";
import { Effect } from "../Effect";
const meta = {
  title: "Effects/Flow fields",
  component: Effect,
  tags: ["autodocs"],
  args: { id: "flow-fields", paused: false, forceFallback: false },
  argTypes: {
    id: { control: false },
    style: { control: false },
    className: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Trails follow a smooth vector field. Source: Shaders · FlowField. License: MIT. Pause and reduced motion use a static preview; GPU simulations are unmounted.",
      },
    },
  },
} satisfies Meta<typeof Effect>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Paused: Story = { args: { paused: true } };
export const Fallback: Story = { args: { forceFallback: true } };

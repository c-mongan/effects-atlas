import type { Meta, StoryObj } from "@storybook/react-vite";
import { Effect } from "../Effect";
const meta = {
  title: "Effects/Holographic foil",
  component: Effect,
  tags: ["autodocs"],
  args: { id: "holographic-foil", paused: false, forceFallback: false },
  argTypes: {
    id: { control: false },
    style: { control: false },
    className: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Foil highlights follow pointer, touch and arrow keys. Source: Effects Atlas · adapted interaction from UI FX Kit. License: MIT. Pause and reduced motion use a static preview; GPU simulations are unmounted.",
      },
    },
  },
} satisfies Meta<typeof Effect>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Paused: Story = { args: { paused: true } };
export const Fallback: Story = { args: { forceFallback: true } };

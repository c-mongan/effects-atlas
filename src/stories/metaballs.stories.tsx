import type { Meta, StoryObj } from "@storybook/react-vite";
import { Effect } from "../Effect";
const meta = {
  title: "Effects/Metaballs",
  component: Effect,
  tags: ["autodocs"],
  args: { id: "metaballs", paused: false, forceFallback: false },
  argTypes: {
    id: { control: false },
    style: { control: false },
    className: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Ink-like drops merge and separate. Source: Paper Shaders · Metaballs. License: Apache-2.0. Pause and reduced motion use a static preview; GPU simulations are unmounted.",
      },
    },
  },
} satisfies Meta<typeof Effect>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Paused: Story = { args: { paused: true } };
export const Fallback: Story = { args: { forceFallback: true } };

import type { Meta, StoryObj } from "@storybook/react-vite";
import { Recipe } from "../Recipe";
const meta = {
  title: "Recipes/Glass Transmission",
  component: Recipe,
  tags: ["autodocs"],
  args: { id: "glass-transmission", paused: false, forceFallback: false },
  argTypes: {
    id: { control: false },
    style: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Recipe>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Paused: Story = { args: { paused: true } };
export const Fallback: Story = { args: { forceFallback: true } };

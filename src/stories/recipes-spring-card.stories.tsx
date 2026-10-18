import type { Meta, StoryObj } from "@storybook/react-vite";
import { Recipe } from "../Recipe";
const meta = {
  title: "Recipes/Spring Card",
  component: Recipe,
  tags: ["autodocs"],
  args: { id: "spring-card", paused: false, forceFallback: false },
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

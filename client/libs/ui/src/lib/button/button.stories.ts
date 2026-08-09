import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { Button } from './button';

const meta: Meta<Button> = {
  title: 'UI/Button',
  component: Button,
  render: (args) => ({
    props: args,
    template: `<lib-button ${argsToTemplate(args)}>Click me</lib-button>`,
  }),
};

export default meta;
type Story = StoryObj<Button>;

export const Primary: Story = {
  args: { variant: 'primary', disabled: false },
};

export const Secondary: Story = {
  args: { variant: 'secondary', disabled: false },
};

export const Disabled: Story = {
  args: { variant: 'primary', disabled: true },
};

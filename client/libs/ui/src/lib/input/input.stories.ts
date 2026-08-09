import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { Input } from './input';

const meta: Meta<Input> = {
  title: 'UI/Input',
  component: Input,
  render: (args) => ({
    props: args,
    template: `<lib-input ${argsToTemplate(args)} />`,
  }),
};

export default meta;
type Story = StoryObj<Input>;

export const Text: Story = {
  args: { label: 'Username', type: 'text', placeholder: 'Enter username' },
};

export const Email: Story = {
  args: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
};

export const Password: Story = {
  args: { label: 'Password', type: 'password', placeholder: '••••••••' },
};

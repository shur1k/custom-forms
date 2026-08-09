import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { Select } from './select';

const meta: Meta<Select> = {
  title: 'UI/Select',
  component: Select,
  render: (args) => ({
    props: args,
    template: `<lib-select ${argsToTemplate(args)} />`,
  }),
};

export default meta;
type Story = StoryObj<Select>;

export const Roles: Story = {
  args: {
    label: 'Role',
    placeholder: 'Select role…',
    options: [
      { value: 'user', label: 'User' },
      { value: 'admin', label: 'Admin' },
    ],
  },
};

export const WithSelection: Story = {
  args: {
    label: 'Role',
    options: [
      { value: 'user', label: 'User' },
      { value: 'admin', label: 'Admin' },
    ],
  },
};

import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { TextArea } from './text-area';

const meta: Meta<TextArea> = {
  title: 'UI/Text Area',
  component: TextArea,
  render: (args) => ({
    props: args,
    template: `<lib-text-area ${argsToTemplate(args)} />`,
  }),
};

export default meta;
type Story = StoryObj<TextArea>;

export const Default: Story = {
  args: { label: 'Description', placeholder: 'Enter a description', rows: 3 },
};

export const Tall: Story = {
  args: { label: 'Notes', placeholder: 'Enter notes', rows: 8 },
};

export const WithError: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter a description',
    rows: 3,
    error: 'Description is required.',
  },
};

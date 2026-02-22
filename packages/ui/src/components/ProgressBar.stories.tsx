import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: {
    value: 65,
  },
};

export const WithLabel: Story = {
  args: {
    value: 72,
    label: 'Upload Progress',
    showLabel: true,
  },
};

export const Success: Story = {
  args: {
    value: 95,
    variant: 'success',
    label: 'Completion',
    showLabel: true,
  },
};

export const Warning: Story = {
  args: {
    value: 60,
    variant: 'warning',
    label: 'Storage Usage',
    showLabel: true,
  },
};

export const Error: Story = {
  args: {
    value: 90,
    variant: 'error',
    label: 'Error Rate',
    showLabel: true,
  },
};

export const Primary: Story = {
  args: {
    value: 80,
    variant: 'primary',
    label: 'Processing',
    showLabel: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <ProgressBar value={50} size="sm" label="Small" showLabel />
      <ProgressBar value={50} size="md" label="Medium" showLabel />
      <ProgressBar value={50} size="lg" label="Large" showLabel />
    </div>
  ),
};

export const Striped: Story = {
  render: () => (
    <div className="space-y-4">
      <ProgressBar value={75} striped label="Striped" showLabel />
      <ProgressBar value={60} striped animated label="Animated Striped" showLabel />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <ProgressBar value={50} variant="default" label="Default" showLabel />
      <ProgressBar value={50} variant="success" label="Success" showLabel />
      <ProgressBar value={50} variant="warning" label="Warning" showLabel />
      <ProgressBar value={50} variant="error" label="Error" showLabel />
      <ProgressBar value={50} variant="primary" label="Primary" showLabel />
      <ProgressBar value={50} variant="secondary" label="Secondary" showLabel />
    </div>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div className="space-y-4">
      <ProgressBar value={25} label="Step 1" showLabel />
      <ProgressBar value={50} label="Step 2" showLabel />
      <ProgressBar value={75} label="Step 3" showLabel />
      <ProgressBar value={100} label="Step 4" showLabel />
    </div>
  ),
};

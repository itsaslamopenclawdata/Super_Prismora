import type { Meta, StoryObj } from '@storybook/react';
import { Loading } from './Loading';

const meta: Meta<typeof Loading> = {
  title: 'Components/Loading',
  component: Loading,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Loading>;

export const Default: Story = {
  args: {},
};

export const WithText: Story = {
  args: {
    text: 'Loading...',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    text: 'Loading large content...',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    text: 'Loading extra large content...',
  },
};

export const Dots: Story = {
  args: {
    variant: 'dots',
    text: 'Loading...',
  },
};

export const DotsSmall: Story = {
  args: {
    variant: 'dots',
    size: 'sm',
  },
};

export const Pulse: Story = {
  args: {
    variant: 'pulse',
    text: 'Loading...',
  },
};

export const PulseLarge: Story = {
  args: {
    variant: 'pulse',
    size: 'lg',
    text: 'Please wait...',
  },
};

export const Bar: Story = {
  args: {
    variant: 'bar',
    text: 'Loading progress...',
  },
};

export const SuccessColor: Story = {
  args: {
    color: 'success',
    text: 'Loading...',
  },
};

export const WarningColor: Story = {
  args: {
    color: 'warning',
    text: 'Loading...',
  },
};

export const ErrorColor: Story = {
  args: {
    color: 'error',
    text: 'Loading...',
  },
};

export const SecondaryColor: Story = {
  args: {
    color: 'secondary',
    text: 'Loading...',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <Loading variant="default" text="Default" />
      <Loading variant="dots" text="Dots" />
      <Loading variant="pulse" text="Pulse" />
      <Loading variant="bar" text="Bar" />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Loading size="sm" text="Small" />
      <Loading size="md" text="Medium" />
      <Loading size="lg" text="Large" />
      <Loading size="xl" text="Extra Large" />
    </div>
  ),
};

export const AllColors: Story = {
  render: () => (
    <div className="space-y-4">
      <Loading color="primary" text="Primary" />
      <Loading color="secondary" text="Secondary" />
      <Loading color="success" text="Success" />
      <Loading color="warning" text="Warning" />
      <Loading color="error" text="Error" />
    </div>
  ),
};

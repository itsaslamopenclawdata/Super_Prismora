import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'Components/StatCard',
  component: StatCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: {
    title: 'Total Photos',
    value: '1,234',
  },
};

export const WithIncrease: Story = {
  args: {
    title: 'Total Photos',
    value: '1,234',
    change: 12,
    changeType: 'increase',
  },
};

export const WithDecrease: Story = {
  args: {
    title: 'Storage Used',
    value: '2.4 GB',
    change: 8,
    changeType: 'decrease',
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Identifications',
    value: '856',
    change: 15,
    changeType: 'increase',
    icon: <span className="text-2xl">📷</span>,
  },
};

export const SuccessVariant: Story = {
  args: {
    title: 'Accuracy Rate',
    value: '94.5%',
    change: 2,
    changeType: 'increase',
    variant: 'success',
    icon: <span className="text-2xl">✅</span>,
  },
};

export const WarningVariant: Story = {
  args: {
    title: 'Pending Reviews',
    value: '23',
    change: 5,
    changeType: 'increase',
    variant: 'warning',
    icon: <span className="text-2xl">⏳</span>,
  },
};

export const ErrorVariant: Story = {
  args: {
    title: 'Failed Uploads',
    value: '3',
    change: 1,
    changeType: 'decrease',
    variant: 'error',
    icon: <span className="text-2xl">❌</span>,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <StatCard
        title="Small"
        value="100"
        size="sm"
        icon={<span className="text-xl">📊</span>}
      />
      <StatCard
        title="Medium"
        value="100"
        size="md"
        icon={<span className="text-2xl">📊</span>}
      />
      <StatCard
        title="Large"
        value="100"
        size="lg"
        icon={<span className="text-3xl">📊</span>}
      />
    </div>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Photos"
        value="1,234"
        change={12}
        changeType="increase"
        icon={<span className="text-2xl">📷</span>}
      />
      <StatCard
        title="Identifications"
        value="856"
        change={15}
        changeType="increase"
        variant="primary"
        icon={<span className="text-2xl">🔍</span>}
      />
      <StatCard
        title="Accuracy Rate"
        value="94.5%"
        change={2}
        changeType="increase"
        variant="success"
        icon={<span className="text-2xl">📈</span>}
      />
      <StatCard
        title="Pending Reviews"
        value="23"
        change={5}
        changeType="increase"
        variant="warning"
        icon={<span className="text-2xl">⏳</span>}
      />
    </div>
  ),
};

export const NeutralChange: Story = {
  args: {
    title: 'Storage Used',
    value: '2.4 GB',
    change: 0,
    changeType: 'neutral',
  },
};

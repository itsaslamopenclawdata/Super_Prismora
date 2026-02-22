import type { Meta, StoryObj } from '@storybook/react';
import { ConfidenceCard } from './ConfidenceCard';

const meta: Meta<typeof ConfidenceCard> = {
  title: 'Components/ConfidenceCard',
  component: ConfidenceCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConfidenceCard>;

export const HighConfidence: Story = {
  args: {
    confidence: 95,
    label: 'Match Confidence',
  },
};

export const GoodConfidence: Story = {
  args: {
    confidence: 82,
    label: 'Match Confidence',
  },
};

export const MediumConfidence: Story = {
  args: {
    confidence: 65,
    label: 'Match Confidence',
  },
};

export const LowConfidence: Story = {
  args: {
    confidence: 35,
    label: 'Match Confidence',
  },
};

export const Compact: Story = {
  args: {
    confidence: 88,
    variant: 'compact',
  },
};

export const Minimal: Story = {
  args: {
    confidence: 92,
    variant: 'minimal',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <ConfidenceCard confidence={85} size="sm" label="Small" />
      <ConfidenceCard confidence={85} size="md" label="Medium" />
      <ConfidenceCard confidence={85} size="lg" label="Large" />
    </div>
  ),
};

export const WithoutValue: Story = {
  args: {
    confidence: 78,
    label: 'Match Confidence',
    showValue: false,
  },
};

export const ConfidenceLevels: Story = {
  render: () => (
    <div className="space-y-4">
      <ConfidenceCard confidence={98} label="Excellent Match" />
      <ConfidenceCard confidence={87} label="Good Match" />
      <ConfidenceCard confidence={72} label="Moderate Match" />
      <ConfidenceCard confidence={45} label="Low Match" />
      <ConfidenceCard confidence={20} label="Very Low Match" />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <ConfidenceCard confidence={90} variant="default" label="Default" />
      <ConfidenceCard confidence={90} variant="compact" label="Compact" />
      <ConfidenceCard confidence={90} variant="minimal" label="Minimal" />
    </div>
  ),
};

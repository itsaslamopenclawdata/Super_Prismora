import type { Meta, StoryObj } from '@storybook/react';
import { DonutChart } from './DonutChart';

const meta: Meta<typeof DonutChart> = {
  title: 'Components/DonutChart',
  component: DonutChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DonutChart>;

const sampleData = [
  { label: 'Birds', value: 45, color: '#3b82f6' },
  { label: 'Insects', value: 30, color: '#10b981' },
  { label: 'Mammals', value: 15, color: '#f59e0b' },
  { label: 'Reptiles', value: 10, color: '#ef4444' },
];

export const Default: Story = {
  args: {
    data: sampleData,
  },
};

export const WithLabels: Story = {
  args: {
    data: sampleData,
    showLabels: true,
  },
};

export const WithPercentage: Story = {
  args: {
    data: sampleData,
    showLabels: true,
    showPercentage: true,
  },
};

export const WithCenterText: Story = {
  args: {
    data: sampleData,
    centerText: '100',
  },
};

export const Small: Story = {
  args: {
    data: sampleData,
    size: 150,
  },
};

export const Large: Story = {
  args: {
    data: sampleData,
    size: 300,
    strokeWidth: 30,
  },
};

export const ThinStroke: Story = {
  args: {
    data: sampleData,
    strokeWidth: 10,
  },
};

export const TwoSegments: Story = {
  args: {
    data: [
      { label: 'Identified', value: 75, color: '#10b981' },
      { label: 'Unknown', value: 25, color: '#e5e7eb' },
    ],
    centerText: '75%',
    showLabels: true,
  },
};

export const ThreeSegments: Story = {
  args: {
    data: [
      { label: 'High', value: 50, color: '#10b981' },
      { label: 'Medium', value: 30, color: '#f59e0b' },
      { label: 'Low', value: 20, color: '#ef4444' },
    ],
    showLabels: true,
    showPercentage: true,
  },
};

export const ManySegments: Story = {
  args: {
    data: [
      { label: 'Category A', value: 25, color: '#3b82f6' },
      { label: 'Category B', value: 20, color: '#10b981' },
      { label: 'Category C', value: 15, color: '#f59e0b' },
      { label: 'Category D', value: 15, color: '#ef4444' },
      { label: 'Category E', value: 10, color: '#8b5cf6' },
      { label: 'Category F', value: 8, color: '#ec4899' },
      { label: 'Category G', value: 7, color: '#06b6d4' },
    ],
    size: 250,
    showLabels: true,
    showPercentage: true,
  },
};

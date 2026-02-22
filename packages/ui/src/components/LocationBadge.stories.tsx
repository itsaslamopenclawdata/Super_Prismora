import type { Meta, StoryObj } from '@storybook/react';
import { LocationBadge } from './LocationBadge';

const meta: Meta<typeof LocationBadge> = {
  title: 'Components/LocationBadge',
  component: LocationBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LocationBadge>;

export const Default: Story = {
  args: {
    location: 'Central Park, New York',
  },
};

export const WithCoordinates: Story = {
  args: {
    location: 'Golden Gate Bridge, San Francisco',
    coordinates: {
      lat: 37.8199,
      lng: -122.4783,
    },
    onMapClick: () => console.log('View map'),
  },
};

export const Minimal: Story = {
  args: {
    location: 'Paris, France',
    variant: 'minimal',
  },
};

export const Compact: Story = {
  args: {
    location: 'London, UK',
    variant: 'compact',
  },
};

export const CompactWithMap: Story = {
  args: {
    location: 'Tokyo, Japan',
    variant: 'compact',
    onMapClick: () => console.log('View map'),
  },
};

export const Small: Story = {
  args: {
    location: 'Sydney, Australia',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    location: 'Cairo, Egypt',
    size: 'lg',
  },
};

export const NoIcon: Story = {
  args: {
    location: 'Berlin, Germany',
    showIcon: false,
  },
};

export const LongLocation: Story = {
  args: {
    location: 'The Eiffel Tower, Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France',
    variant: 'compact',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <LocationBadge location="Default Variant" variant="default" />
      <LocationBadge location="Compact Variant" variant="compact" />
      <LocationBadge location="Minimal Variant" variant="minimal" />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <LocationBadge location="Small Badge" size="sm" variant="compact" />
      <LocationBadge location="Medium Badge" size="md" variant="compact" />
      <LocationBadge location="Large Badge" size="lg" variant="compact" />
    </div>
  ),
};

import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';
import { Button } from './Button';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {},
};

export const WithAction: Story = {
  args: {
    action: <Button>Upload Photo</Button>,
  },
};

export const CustomContent: Story = {
  args: {
    icon: '📷',
    title: 'No photos yet',
    description: 'Upload your first photo to get started with AI-powered identification.',
    action: <Button>Upload Photo</Button>,
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    icon: '📭',
    title: 'No messages',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    icon: '🔍',
    title: 'No results found',
    description: 'We couldn\'t find any results matching your search.',
    action: <Button variant="outline">Clear Search</Button>,
  },
};

export const Minimal: Story = {
  args: {
    variant: 'minimal',
    icon: '📭',
    title: 'No items',
  },
};

export const Compact: Story = {
  args: {
    variant: 'compact',
    icon: '📭',
    title: 'No items',
    description: 'There are no items to display.',
  },
};

export const GalleryEmpty: Story = {
  args: {
    icon: '📷',
    title: 'Your gallery is empty',
    description: 'Upload photos to start building your collection.',
    action: <Button>Upload Photo</Button>,
  },
};

export const SearchEmpty: Story = {
  args: {
    icon: '🔍',
    title: 'No results found',
    description: 'Try adjusting your search terms or filters.',
    action: <Button variant="ghost">Clear Filters</Button>,
  },
};

export const NotificationsEmpty: Story = {
  args: {
    icon: '🔔',
    title: 'No notifications',
    description: 'You\'re all caught up! Check back later for updates.',
  },
};

export const FavoritesEmpty: Story = {
  args: {
    icon: '❤️',
    title: 'No favorites yet',
    description: 'Heart photos you like to save them to your favorites.',
    action: <Button variant="outline">Browse Gallery</Button>,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <EmptyState variant="default" icon="📭" title="Default" />
      <EmptyState variant="compact" icon="📭" title="Compact" description="Compact variant" />
      <EmptyState variant="minimal" icon="📭" title="Minimal" />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-6">
      <EmptyState size="sm" icon="📭" title="Small" />
      <EmptyState size="md" icon="📭" title="Medium" description="Medium size empty state" />
      <EmptyState size="lg" icon="📭" title="Large" description="Large size empty state with more space" />
    </div>
  ),
};

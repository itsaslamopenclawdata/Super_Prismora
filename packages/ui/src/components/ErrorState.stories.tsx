import type { Meta, StoryObj } from '@storybook/react';
import { ErrorState } from './ErrorState';
import { Button } from './Button';

const meta: Meta<typeof ErrorState> = {
  title: 'Components/ErrorState',
  component: ErrorState,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ErrorState>;

export const Default: Story = {
  args: {},
};

export const WithAction: Story = {
  args: {
    action: <Button>Try Again</Button>,
  },
};

export const WithError: Story = {
  args: {
    error: 'Failed to connect to server. Please check your internet connection and try again.',
    showDetails: true,
    action: <Button>Retry</Button>,
  },
};

export const NetworkError: Story = {
  args: {
    icon: '🌐',
    title: 'Network Error',
    description: 'Unable to connect to the server. Please check your internet connection.',
    action: <Button>Retry</Button>,
  },
};

export const NotFoundError: Story = {
  args: {
    icon: '🔍',
    title: 'Not Found',
    description: 'The requested resource could not be found.',
    action: <Button variant="outline">Go Home</Button>,
  },
};

export const PermissionError: Story = {
  args: {
    icon: '🔒',
    title: 'Access Denied',
    description: 'You don\'t have permission to access this resource.',
    action: <Button variant="outline">Contact Support</Button>,
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    title: 'Error occurred',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    icon: '⚠️',
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Our team has been notified.',
    action: <Button>Go Back</Button>,
  },
};

export const Minimal: Story = {
  args: {
    variant: 'minimal',
    icon: '❌',
    title: 'Error',
  },
};

export const Compact: Story = {
  args: {
    variant: 'compact',
    icon: '❌',
    title: 'Error occurred',
    error: 'Unexpected error while processing',
    showDetails: true,
  },
};

export const WithErrorObject: Story = {
  args: {
    error: new Error('TypeError: Cannot read property "map" of undefined'),
    showDetails: true,
    action: <Button>Report Bug</Button>,
  },
};

export const ServerError: Story = {
  args: {
    icon: '🖥️',
    title: 'Server Error',
    description: 'Something went wrong on our end. Please try again later.',
    action: (
      <>
        <Button variant="outline">Go Home</Button>
        <Button>Retry</Button>
      </>
    ),
  },
};

export const UploadError: Story = {
  args: {
    icon: '📤',
    title: 'Upload Failed',
    description: 'Failed to upload your photo. Please check the file and try again.',
    error: 'File too large. Maximum size is 10MB.',
    showDetails: true,
    action: <Button>Try Again</Button>,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <ErrorState variant="default" icon="❌" title="Default" />
      <ErrorState variant="compact" icon="❌" title="Compact" />
      <ErrorState variant="minimal" icon="❌" title="Minimal" />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-6">
      <ErrorState size="sm" icon="❌" title="Small" />
      <ErrorState size="md" icon="❌" title="Medium" description="Medium size error state" />
      <ErrorState size="lg" icon="❌" title="Large" description="Large size error state with more space" />
    </div>
  ),
};

export const MultipleErrors: Story = {
  render: () => (
    <div className="space-y-8">
      <ErrorState
        icon="🌐"
        title="Network Error"
        description="Unable to connect to the server."
        action={<Button>Retry</Button>}
      />
      <ErrorState
        icon="🔒"
        title="Access Denied"
        description="You don\'t have permission to view this page."
        action={<Button variant="outline">Go Home</Button>}
      />
      <ErrorState
        icon="📤"
        title="Upload Failed"
        description="The file upload encountered an error."
        error="File size exceeds the 10MB limit."
        showDetails
        action={<Button>Try Again</Button>}
      />
    </div>
  ),
};

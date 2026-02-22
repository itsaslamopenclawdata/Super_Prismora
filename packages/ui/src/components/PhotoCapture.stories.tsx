import type { Meta, StoryObj } from '@storybook/react';
import { PhotoCapture } from './PhotoCapture';

const meta: Meta<typeof PhotoCapture> = {
  title: 'Components/PhotoCapture',
  component: PhotoCapture,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PhotoCapture>;

export const Default: Story = {
  args: {
    onCapture: (file, preview) => {
      console.log('Captured:', file.name, preview);
    },
  },
};

export const WithPreview: Story = {
  args: {
    onCapture: (file, preview) => {
      console.log('Captured:', file.name, preview);
    },
    preview: 'https://via.placeholder.com/800x600/3b82f6/ffffff?text=Preview+Image',
  },
};

export const Disabled: Story = {
  args: {
    onCapture: (file, preview) => {
      console.log('Captured:', file.name, preview);
    },
    disabled: true,
  },
};

export const CustomMaxSize: Story = {
  args: {
    onCapture: (file, preview) => {
      console.log('Captured:', file.name, preview);
    },
    maxSize: 5,
  },
};

export const NoPreview: Story = {
  args: {
    onCapture: (file, preview) => {
      console.log('Captured:', file.name, preview);
    },
    showPreview: false,
  },
};

export const WithClearCallback: Story = {
  args: {
    onCapture: (file, preview) => {
      console.log('Captured:', file.name, preview);
    },
    onClear: () => {
      console.log('Cleared');
    },
    preview: 'https://via.placeholder.com/800x600/3b82f6/ffffff?text=Preview+Image',
  },
};

export const CustomClassName: Story = {
  args: {
    onCapture: (file, preview) => {
      console.log('Captured:', file.name, preview);
    },
    className: 'max-w-md mx-auto',
  },
};

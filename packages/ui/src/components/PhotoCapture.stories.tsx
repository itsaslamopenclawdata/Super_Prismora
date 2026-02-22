import type { Meta, StoryObj } from '@storybook/react';
import { PhotoCapture } from './PhotoCapture';

const meta: Meta<typeof PhotoCapture> = {
  title: 'Components/PhotoCapture',
  component: PhotoCapture,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onCapture: {
      action: 'capture',
      description: 'Callback when a photo is captured/uploaded and confirmed',
    },
    onCancel: {
      action: 'cancel',
      description: 'Callback when the user cancels the operation',
    },
    aspectRatio: {
      control: 'select',
      options: ['1:1', '4:3', '16:9', '3:4', '9:16'],
      description: 'Aspect ratio for the capture area',
    },
    overlay: {
      control: 'select',
      options: [null, 'circular', 'rectangular', 'freeform'],
      description: 'Type of overlay to display on camera viewfinder',
    },
    defaultMode: {
      control: 'select',
      options: ['camera', 'upload'],
      description: 'Initial mode to display',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PhotoCapture>;

export const UploadMode: Story = {
  args: {
    onCapture: (file: File) => {
      console.log('Captured file:', file.name, file.size);
      alert(`Captured: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    },
    onCancel: () => {
      console.log('Cancelled');
    },
    aspectRatio: '4:3',
    overlay: null,
    defaultMode: 'upload',
  },
};

export const CameraMode: Story = {
  args: {
    onCapture: (file: File) => {
      console.log('Captured file:', file.name, file.size);
      alert(`Captured: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    },
    onCancel: () => {
      console.log('Cancelled');
    },
    aspectRatio: '4:3',
    overlay: null,
    defaultMode: 'camera',
  },
};

export const SquareAspectRatio: Story = {
  args: {
    onCapture: (file: File) => {
      console.log('Captured file:', file.name, file.size);
      alert(`Captured: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    },
    aspectRatio: '1:1',
    defaultMode: 'upload',
  },
};

export const Landscape16_9: Story = {
  args: {
    onCapture: (file: File) => {
      console.log('Captured file:', file.name, file.size);
      alert(`Captured: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    },
    aspectRatio: '16:9',
    defaultMode: 'upload',
  },
};

export const Portrait9_16: Story = {
  args: {
    onCapture: (file: File) => {
      console.log('Captured file:', file.name, file.size);
      alert(`Captured: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    },
    aspectRatio: '9:16',
    defaultMode: 'upload',
  },
};

export const CircularOverlay: Story = {
  args: {
    onCapture: (file: File) => {
      console.log('Captured file:', file.name, file.size);
      alert(`Captured: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    },
    aspectRatio: '1:1',
    overlay: 'circular',
    defaultMode: 'camera',
  },
};

export const RectangularOverlay: Story = {
  args: {
    onCapture: (file: File) => {
      console.log('Captured file:', file.name, file.size);
      alert(`Captured: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    },
    aspectRatio: '4:3',
    overlay: 'rectangular',
    defaultMode: 'camera',
  },
};

export const FreeformOverlay: Story = {
  args: {
    onCapture: (file: File) => {
      console.log('Captured file:', file.name, file.size);
      alert(`Captured: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    },
    aspectRatio: '4:3',
    overlay: 'freeform',
    defaultMode: 'camera',
  },
};

export const WithoutCancel: Story = {
  args: {
    onCapture: (file: File) => {
      console.log('Captured file:', file.name, file.size);
      alert(`Captured: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    },
    aspectRatio: '4:3',
    defaultMode: 'upload',
  },
};

export const CustomWidth: Story = {
  args: {
    onCapture: (file: File) => {
      console.log('Captured file:', file.name, file.size);
      alert(`Captured: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    },
    aspectRatio: '4:3',
    defaultMode: 'upload',
    className: 'max-w-md mx-auto',
  },
};

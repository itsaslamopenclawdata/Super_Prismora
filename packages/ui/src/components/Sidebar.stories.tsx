import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar } from './Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const sidebarItems = [
  { label: 'Dashboard', active: true, icon: <span>📊</span> },
  { label: 'Gallery', icon: <span>📷</span> },
  { label: 'Upload', icon: <span>📤</span> },
  { label: 'History', icon: <span>📜</span> },
  { label: 'Settings', icon: <span>⚙️</span> },
];

export const Default: Story = {
  args: {
    items: sidebarItems,
  },
};

export const Dark: Story = {
  args: {
    items: sidebarItems,
    variant: 'dark',
  },
};

export const Minimal: Story = {
  args: {
    items: sidebarItems,
    variant: 'minimal',
  },
};

export const RightPosition: Story = {
  args: {
    items: sidebarItems,
    position: 'right',
  },
};

export const Collapsed: Story = {
  args: {
    items: sidebarItems,
    collapsed: true,
  },
};

export const WithFooter: Story = {
  args: {
    items: sidebarItems,
    children: (
      <div className="text-sm text-neutral-600">
        <p className="font-medium">PhotoIdentifier</p>
        <p className="text-xs mt-1">v1.0.0</p>
      </div>
    ),
  },
};

export const CollapsedDark: Story = {
  args: {
    items: sidebarItems,
    collapsed: true,
    variant: 'dark',
  },
};

export const WithActiveState: Story = {
  args: {
    items: [
      { label: 'Dashboard', icon: <span>📊</span> },
      { label: 'Gallery', active: true, icon: <span>📷</span> },
      { label: 'Upload', icon: <span>📤</span> },
      { label: 'History', icon: <span>📜</span> },
      { label: 'Settings', icon: <span>⚙️</span> },
    ],
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import { Navbar } from './Navbar';
import { Button } from './Button';

const meta: Meta<typeof Navbar> = {
  title: 'Components/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Navbar>;

const logo = (
  <div className="text-xl font-bold text-primary-600">PhotoIdentifier</div>
);

const navItems = [
  { label: 'Home', active: true },
  { label: 'Gallery', onClick: () => console.log('Gallery') },
  { label: 'Upload', onClick: () => console.log('Upload') },
  { label: 'About', onClick: () => console.log('About') },
];

export const Default: Story = {
  args: {
    logo,
    items: navItems,
  },
};

export const Minimal: Story = {
  args: {
    logo,
    items: navItems,
    variant: 'minimal',
  },
};

export const Transparent: Story = {
  args: {
    logo,
    items: navItems,
    variant: 'transparent',
  },
};

export const Fixed: Story = {
  args: {
    logo,
    items: navItems,
    position: 'fixed',
  },
};

export const Sticky: Story = {
  args: {
    logo,
    items: navItems,
    position: 'sticky',
  },
};

export const WithActions: Story = {
  args: {
    logo,
    items: navItems,
    actions: (
      <>
        <Button variant="ghost" size="sm">Sign In</Button>
        <Button size="sm">Get Started</Button>
      </>
    ),
  },
};

export const WithIcons: Story = {
  args: {
    logo,
    items: [
      { label: 'Home', active: true, icon: <span>🏠</span> },
      { label: 'Gallery', icon: <span>📷</span> },
      { label: 'Upload', icon: <span>📤</span> },
      { label: 'About', icon: <span>ℹ️</span> },
    ],
  },
};

export const DisabledItems: Story = {
  args: {
    logo,
    items: [
      { label: 'Home', active: true },
      { label: 'Gallery' },
      { label: 'Upload', disabled: true },
      { label: 'About' },
    ],
  },
};

export const LogoOnly: Story = {
  args: {
    logo,
  },
};

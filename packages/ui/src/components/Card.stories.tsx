import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './Card';
import { Button } from './Button';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here</p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const Elevated: Story = {
  render: () => (
    <Card variant="elevated" className="w-80">
      <CardHeader>
        <CardTitle>Elevated Card</CardTitle>
        <CardDescription>With more prominent shadow</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content with elevated visual hierarchy</p>
      </CardContent>
    </Card>
  ),
};

export const Outlined: Story = {
  render: () => (
    <Card variant="outlined" className="w-80">
      <CardHeader>
        <CardTitle>Outlined Card</CardTitle>
        <CardDescription>With border instead of shadow</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content with outlined style</p>
      </CardContent>
    </Card>
  ),
};

export const Flat: Story = {
  render: () => (
    <Card variant="flat" className="w-80">
      <CardHeader>
        <CardTitle>Flat Card</CardTitle>
        <CardDescription>Minimal styling</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content with flat background</p>
      </CardContent>
    </Card>
  ),
};

export const NoPadding: Story = {
  render: () => (
    <Card padding="none" className="w-80">
      <img src="https://via.placeholder.com/320x200" alt="Card image" />
      <div className="p-4">
        <CardHeader>
          <CardTitle>Image Card</CardTitle>
          <CardDescription>With image and content</CardDescription>
        </CardHeader>
      </div>
    </Card>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Card variant="default" className="w-40">
        <CardContent>Default</CardContent>
      </Card>
      <Card variant="elevated" className="w-40">
        <CardContent>Elevated</CardContent>
      </Card>
      <Card variant="outlined" className="w-40">
        <CardContent>Outlined</CardContent>
      </Card>
      <Card variant="flat" className="w-40">
        <CardContent>Flat</CardContent>
      </Card>
    </div>
  ),
};

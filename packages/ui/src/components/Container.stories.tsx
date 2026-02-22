import type { Meta, StoryObj } from '@storybook/react';
import { Container } from './Container';
import { Card, CardContent } from './Card';

const meta: Meta<typeof Container> = {
  title: 'Components/Container',
  component: Container,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Default: Story = {
  args: {
    children: (
      <Card>
        <CardContent>
          <p>Default container content</p>
        </CardContent>
      </Card>
    ),
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: (
      <Card>
        <CardContent>
          <p>Small container content</p>
        </CardContent>
      </Card>
    ),
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    children: (
      <Card>
        <CardContent>
          <p>Medium container content</p>
        </CardContent>
      </Card>
    ),
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: (
      <Card>
        <CardContent>
          <p>Large container content</p>
        </CardContent>
      </Card>
    ),
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    children: (
      <Card>
        <CardContent>
          <p>Extra large container content</p>
        </CardContent>
      </Card>
    ),
  },
};

export const FullWidth: Story = {
  args: {
    size: 'full',
    children: (
      <Card>
        <CardContent>
          <p>Full width container content</p>
        </CardContent>
      </Card>
    ),
  },
};

export const Centered: Story = {
  args: {
    size: 'lg',
    centerContent: true,
    className: 'min-h-screen bg-neutral-50',
    children: (
      <Card className="w-96">
        <CardContent>
          <p>Centered content</p>
        </CardContent>
      </Card>
    ),
  },
};

export const NoPadding: Story = {
  args: {
    padding: 'none',
    children: (
      <div className="bg-primary-100 p-4 rounded">
        <p>No padding container</p>
      </div>
    ),
  },
};

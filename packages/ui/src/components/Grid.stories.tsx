import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from './Grid';
import { Card, CardContent } from './Card';

const meta: Meta<typeof Grid> = {
  title: 'Components/Grid',
  component: Grid,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Grid>;

const sampleCard = (text: string) => (
  <Card>
    <CardContent className="h-24 flex items-center justify-center">
      {text}
    </CardContent>
  </Card>
);

export const Default: Story = {
  args: {
    children: (
      <>
        {sampleCard('1')}
        {sampleCard('2')}
        {sampleCard('3')}
      </>
    ),
  },
};

export const TwoColumns: Story = {
  args: {
    cols: 2,
    children: (
      <>
        {sampleCard('1')}
        {sampleCard('2')}
        {sampleCard('3')}
        {sampleCard('4')}
      </>
    ),
  },
};

export const ThreeColumns: Story = {
  args: {
    cols: 3,
    children: (
      <>
        {sampleCard('1')}
        {sampleCard('2')}
        {sampleCard('3')}
        {sampleCard('4')}
        {sampleCard('5')}
        {sampleCard('6')}
      </>
    ),
  },
};

export const FourColumns: Story = {
  args: {
    cols: 4,
    children: (
      <>
        {sampleCard('1')}
        {sampleCard('2')}
        {sampleCard('3')}
        {sampleCard('4')}
        {sampleCard('5')}
        {sampleCard('6')}
        {sampleCard('7')}
        {sampleCard('8')}
      </>
    ),
  },
};

export const NoGap: Story = {
  args: {
    gap: 'none',
    children: (
      <>
        {sampleCard('1')}
        {sampleCard('2')}
        {sampleCard('3')}
        {sampleCard('4')}
      </>
    ),
  },
};

export const SmallGap: Story = {
  args: {
    gap: 'sm',
    children: (
      <>
        {sampleCard('1')}
        {sampleCard('2')}
        {sampleCard('3')}
        {sampleCard('4')}
      </>
    ),
  },
};

export const LargeGap: Story = {
  args: {
    gap: 'lg',
    children: (
      <>
        {sampleCard('1')}
        {sampleCard('2')}
        {sampleCard('3')}
        {sampleCard('4')}
      </>
    ),
  },
};

export const Responsive: Story = {
  args: {
    responsive: true,
    children: (
      <>
        {sampleCard('1')}
        {sampleCard('2')}
        {sampleCard('3')}
        {sampleCard('4')}
        {sampleCard('5')}
        {sampleCard('6')}
        {sampleCard('7')}
        {sampleCard('8')}
      </>
    ),
  },
};

export const NonResponsive: Story = {
  args: {
    responsive: false,
    cols: 4,
    children: (
      <>
        {sampleCard('1')}
        {sampleCard('2')}
        {sampleCard('3')}
        {sampleCard('4')}
      </>
    ),
  },
};

export const TwelveColumns: Story = {
  args: {
    cols: 12,
    gap: 'sm',
    children: (
      <>
        {Array.from({ length: 12 }).map((_, i) => sampleCard(`${i + 1}`))}
      </>
    ),
  },
};

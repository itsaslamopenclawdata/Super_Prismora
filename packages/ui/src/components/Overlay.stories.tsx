import type { Meta, StoryObj } from '@storybook/react';
import { Overlay } from './Overlay';
import { Button } from './Button';

const meta: Meta<typeof Overlay> = {
  title: 'Components/Overlay',
  component: Overlay,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Overlay>;

export const Default: Story = {
  args: {
    isOpen: true,
    children: (
      <div className="flex items-center justify-center h-full">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <p>Content overlayed on top</p>
        </div>
      </div>
    ),
  },
};

export const Dark: Story = {
  args: {
    isOpen: true,
    variant: 'dark',
    children: (
      <div className="flex items-center justify-center h-full">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <p>Dark overlay</p>
        </div>
      </div>
    ),
  },
};

export const Light: Story = {
  args: {
    isOpen: true,
    variant: 'light',
    children: (
      <div className="flex items-center justify-center h-full">
        <div className="bg-neutral-800 text-white p-6 rounded-lg shadow-xl">
          <p>Light overlay</p>
        </div>
      </div>
    ),
  },
};

export const Blur: Story = {
  args: {
    isOpen: true,
    variant: 'blur',
    children: (
      <div className="flex items-center justify-center h-full">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <p>Blur overlay with backdrop</p>
        </div>
      </div>
    ),
  },
};

export const WithoutContent: Story = {
  args: {
    isOpen: true,
  },
};

export const WithSpinner: Story = {
  args: {
    isOpen: true,
    variant: 'blur',
    children: (
      <div className="flex items-center justify-center h-full">
        <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
          <p className="text-neutral-700">Loading...</p>
        </div>
      </div>
    ),
  },
};

export const AllVariants: Story = {
  render: () => {
    const [variant, setVariant] = React.useState<'default' | 'dark' | 'light' | 'blur'>('default');
    const variants: Array<'default' | 'dark' | 'light' | 'blur'> = ['default', 'dark', 'light', 'blur'];

    return (
      <div className="p-8">
        <div className="flex gap-2 mb-4">
          {variants.map((v) => (
            <Button
              key={v}
              variant={variant === v ? 'primary' : 'outline'}
              onClick={() => setVariant(v)}
            >
              {v}
            </Button>
          ))}
        </div>
        <div className="h-64 bg-neutral-100 rounded-lg p-4">
          <p>Background content</p>
        </div>
        <Overlay
          isOpen={true}
          variant={variant}
          closeOnClick={false}
        >
          <div className="flex items-center justify-center h-full">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <p>{variant} overlay</p>
              <Button className="mt-4" onClick={() => setVariant('default')}>Close</Button>
            </div>
          </div>
        </Overlay>
      </div>
    );
  },
};

export const Interactive: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div className="p-8">
        <div className="h-64 bg-neutral-100 rounded-lg p-4 mb-4">
          <p>Background content - {isOpen ? 'overlaid' : 'visible'}</p>
        </div>
        <Button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 'Close' : 'Open'} Overlay
        </Button>
        <Overlay isOpen={isOpen} onClose={() => setIsOpen(false)} variant="blur">
          <div className="flex items-center justify-center h-full">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <p>This overlay can be toggled on and off</p>
              <Button className="mt-4" onClick={() => setIsOpen(false)}>Close</Button>
            </div>
          </div>
        </Overlay>
      </div>
    );
  },
};

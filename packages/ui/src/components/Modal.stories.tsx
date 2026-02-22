import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';
import { Button } from './Button';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Modal Title',
    children: (
      <p>This is the modal content. You can put any React components here.</p>
    ),
  },
};

export const Small: Story = {
  args: {
    isOpen: true,
    title: 'Small Modal',
    size: 'sm',
    children: <p>This is a small modal with limited width.</p>,
  },
};

export const Large: Story = {
  args: {
    isOpen: true,
    title: 'Large Modal',
    size: 'lg',
    children: (
      <div className="space-y-4">
        <p>This is a large modal with more space for content.</p>
        <p>You can include multiple paragraphs, forms, or other components.</p>
      </div>
    ),
  },
};

export const ExtraLarge: Story = {
  args: {
    isOpen: true,
    title: 'Extra Large Modal',
    size: 'xl',
    children: (
      <div className="space-y-4">
        <p>This is an extra large modal with maximum width.</p>
        <p>Suitable for displaying complex content, forms, or detailed information.</p>
      </div>
    ),
  },
};

export const FullWidth: Story = {
  args: {
    isOpen: true,
    title: 'Full Width Modal',
    size: 'full',
    children: (
      <div className="space-y-4">
        <p>This modal takes up almost the full width of the screen.</p>
        <p>Perfect for displaying images, tables, or wide content.</p>
      </div>
    ),
  },
};

export const WithoutTitle: Story = {
  args: {
    isOpen: true,
    children: (
      <div className="text-center">
        <div className="text-4xl mb-4">✅</div>
        <p className="text-lg font-medium">Success!</p>
        <p className="text-neutral-600">Your changes have been saved.</p>
      </div>
    ),
  },
};

export const WithoutCloseButton: Story = {
  args: {
    isOpen: true,
    title: 'No Close Button',
    showCloseButton: false,
    children: (
      <p>This modal cannot be closed by clicking the X button.</p>
    ),
  },
};

export const WithForm: Story = {
  args: {
    isOpen: true,
    title: 'Edit Profile',
    children: (
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            defaultValue="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            defaultValue="john@example.com"
          />
        </div>
        <Button fullWidth>Save Changes</Button>
      </form>
    ),
  },
};

export const Interactive: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div className="p-8">
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Interactive Modal"
        >
          <p>This modal can be opened and closed interactively.</p>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => setIsOpen(false)}>Close</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </Modal>
      </div>
    );
  },
};

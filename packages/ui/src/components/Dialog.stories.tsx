import type { Meta, StoryObj } from '@storybook/react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from './Dialog';
import { Button } from './Button';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  args: {
    isOpen: true,
    children: (
      <>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account.
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <p>Please confirm that you want to proceed with this action.</p>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost">Cancel</Button>
          <Button variant="danger">Delete</Button>
        </DialogFooter>
      </>
    ),
  },
};

export const Center: Story = {
  args: {
    isOpen: true,
    position: 'center',
    children: (
      <>
        <DialogHeader>
          <DialogTitle>Center Position</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p>This dialog is centered on the screen.</p>
        </DialogContent>
      </>
    ),
  },
};

export const Top: Story = {
  args: {
    isOpen: true,
    position: 'top',
    children: (
      <>
        <DialogHeader>
          <DialogTitle>Top Position</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p>This dialog is positioned at the top of the screen.</p>
        </DialogContent>
      </>
    ),
  },
};

export const Bottom: Story = {
  args: {
    isOpen: true,
    position: 'bottom',
    children: (
      <>
        <DialogHeader>
          <DialogTitle>Bottom Position</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p>This dialog is positioned at the bottom of the screen.</p>
        </DialogContent>
      </>
    ),
  },
};

export const WithFooterLeft: Story = {
  args: {
    isOpen: true,
    children: (
      <>
        <DialogHeader>
          <DialogTitle>Footer Left Aligned</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p>The footer buttons are aligned to the left.</p>
        </DialogContent>
        <DialogFooter align="left">
          <Button>Back</Button>
          <Button variant="primary">Next</Button>
        </DialogFooter>
      </>
    ),
  },
};

export const WithFooterCenter: Story = {
  args: {
    isOpen: true,
    children: (
      <>
        <DialogHeader>
          <DialogTitle>Footer Center Aligned</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p>The footer buttons are centered.</p>
        </DialogContent>
        <DialogFooter align="center">
          <Button>OK</Button>
        </DialogFooter>
      </>
    ),
  },
};

export const WithFooterSpaceBetween: Story = {
  args: {
    isOpen: true,
    children: (
      <>
        <DialogHeader>
          <DialogTitle>Footer Space Between</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p>The footer buttons are spaced evenly.</p>
        </DialogContent>
        <DialogFooter align="space-between">
          <Button variant="ghost">Cancel</Button>
          <div className="flex gap-2">
            <Button variant="secondary">Save Draft</Button>
            <Button>Publish</Button>
          </div>
        </DialogFooter>
      </>
    ),
  },
};

export const WithLongContent: Story = {
  args: {
    isOpen: true,
    size: 'lg',
    children: (
      <>
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-2 text-sm text-neutral-600 max-h-64 overflow-y-auto">
            <p>1. Acceptance of Terms</p>
            <p>By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.</p>
            <p>2. Use License</p>
            <p>Permission is granted to temporarily download one copy of the materials on this website for personal, non-commercial transitory viewing only.</p>
            <p>3. Disclaimer</p>
            <p>The materials on this website are provided "as is". This website makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability.</p>
            <p>4. Limitations</p>
            <p>In no event shall this website or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on this website.</p>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost">Decline</Button>
          <Button>Accept</Button>
        </DialogFooter>
      </>
    ),
  },
};

export const Interactive: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div className="p-8">
        <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>
        <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <DialogHeader>
            <DialogTitle>Interactive Dialog</DialogTitle>
            <DialogDescription>
              This dialog can be opened and closed interactively.
            </DialogDescription>
          </DialogHeader>
          <DialogContent>
            <p>Click the buttons below to take action.</p>
          </DialogContent>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsOpen(false)}>Confirm</Button>
          </DialogFooter>
        </Dialog>
      </div>
    );
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';
import { Button } from './Button';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Information',
    children: 'This is an informational alert message.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Success',
    children: 'Your changes have been saved successfully.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Warning',
    children: 'Please review your input before proceeding.',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Error',
    children: 'Something went wrong. Please try again.',
  },
};

export const NoTitle: Story = {
  args: {
    variant: 'info',
    children: 'Simple alert without a title',
  },
};

export const Dismissible: Story = {
  render: () => {
    const [dismissed, setDismissed] = React.useState(false);

    if (dismissed) {
      return (
        <Button onClick={() => setDismissed(false)}>Show Alert</Button>
      );
    }

    return (
      <Alert
        variant="info"
        title="Dismissible Alert"
        dismissible
        onDismiss={() => setDismissed(true)}
      >
        This alert can be dismissed by clicking the X button.
      </Alert>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Alert variant="info" title="Info">
        This is an informational alert.
      </Alert>
      <Alert variant="success" title="Success">
        Your operation was successful.
      </Alert>
      <Alert variant="warning" title="Warning">
        Please proceed with caution.
      </Alert>
      <Alert variant="error" title="Error">
        An error has occurred.
      </Alert>
    </div>
  ),
};

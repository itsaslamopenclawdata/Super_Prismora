import type { Meta, StoryObj } from '@storybook/react';
import { IdentificationResult } from './IdentificationResult';

const meta: Meta<typeof IdentificationResult> = {
  title: 'Components/IdentificationResult',
  component: IdentificationResult,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IdentificationResult>;

const sampleIdentification = {
  id: '1',
  name: 'Monarch Butterfly',
  scientificName: 'Danaus plexippus',
  confidence: 94.5,
  boundingBox: { x: 10, y: 20, width: 80, height: 60 },
  details: {
    habitat: 'Open fields, meadows, gardens',
    diet: 'Nectar from flowers',
    lifespan: '2-6 weeks (adult)',
  },
};

export const Default: Story = {
  args: {
    identification: sampleIdentification,
    imageUrl: 'https://via.placeholder.com/800x600/3b82f6/ffffff?text=Butterfly+Photo',
  },
};

export const WithoutBoundingBox: Story = {
  args: {
    identification: sampleIdentification,
    imageUrl: 'https://via.placeholder.com/800x600/3b82f6/ffffff?text=Butterfly+Photo',
    showBoundingBox: false,
  },
};

export const WithoutDetails: Story = {
  args: {
    identification: sampleIdentification,
    imageUrl: 'https://via.placeholder.com/800x600/3b82f6/ffffff?text=Butterfly+Photo',
    showDetails: false,
  },
};

export const WithoutImage: Story = {
  args: {
    identification: sampleIdentification,
  },
};

export const ListVariant: Story = {
  args: {
    identification: sampleIdentification,
    imageUrl: 'https://via.placeholder.com/200x200/3b82f6/ffffff?text=Butterfly',
    variant: 'list',
  },
};

export const MinimalVariant: Story = {
  args: {
    identification: sampleIdentification,
    variant: 'minimal',
  },
};

export const LowConfidence: Story = {
  args: {
    identification: {
      ...sampleIdentification,
      confidence: 42.3,
    },
    imageUrl: 'https://via.placeholder.com/800x600/3b82f6/ffffff?text=Butterfly+Photo',
  },
};

export const WithoutScientificName: Story = {
  args: {
    identification: {
      ...sampleIdentification,
      scientificName: undefined,
    },
    imageUrl: 'https://via.placeholder.com/800x600/3b82f6/ffffff?text=Butterfly+Photo',
  },
};

export const MultipleResults: Story = {
  render: () => (
    <div className="space-y-4">
      <IdentificationResult
        identification={sampleIdentification}
        imageUrl="https://via.placeholder.com/800x600/3b82f6/ffffff?text=Butterfly+Photo"
      />
      <IdentificationResult
        identification={{
          ...sampleIdentification,
          id: '2',
          name: 'Viceroy Butterfly',
          scientificName: 'Limenitis archippus',
          confidence: 78.2,
        }}
        imageUrl="https://via.placeholder.com/800x600/9333ea/ffffff?text=Butterfly+Photo"
      />
      <IdentificationResult
        identification={{
          ...sampleIdentification,
          id: '3',
          name: 'Painted Lady',
          scientificName: 'Vanessa cardui',
          confidence: 65.8,
        }}
        imageUrl="https://via.placeholder.com/800x600/f59e0b/ffffff?text=Butterfly+Photo"
      />
    </div>
  ),
};

export const ListVariantMultiple: Story = {
  render: () => (
    <div className="space-y-4">
      <IdentificationResult
        identification={sampleIdentification}
        variant="list"
      />
      <IdentificationResult
        identification={{
          ...sampleIdentification,
          id: '2',
          name: 'Viceroy Butterfly',
          scientificName: 'Limenitis archippus',
          confidence: 78.2,
        }}
        variant="list"
      />
      <IdentificationResult
        identification={{
          ...sampleIdentification,
          id: '3',
          name: 'Painted Lady',
          scientificName: 'Vanessa cardui',
          confidence: 65.8,
        }}
        variant="list"
      />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <IdentificationResult
        identification={sampleIdentification}
        imageUrl="https://via.placeholder.com/800x600/3b82f6/ffffff?text=Card+Variant"
        variant="card"
      />
      <IdentificationResult
        identification={sampleIdentification}
        imageUrl="https://via.placeholder.com/200x200/3b82f6/ffffff?text=List+Variant"
        variant="list"
      />
      <IdentificationResult
        identification={sampleIdentification}
        variant="minimal"
      />
    </div>
  ),
};

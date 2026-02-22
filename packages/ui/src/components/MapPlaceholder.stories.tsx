import type { Meta, StoryObj } from '@storybook/react';
import { MapPlaceholder } from './MapPlaceholder';

const meta: Meta<typeof MapPlaceholder> = {
  title: 'Components/MapPlaceholder',
  component: MapPlaceholder,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MapPlaceholder>;

export const Default: Story = {
  args: {},
};

export const WithLocation: Story = {
  args: {
    location: 'Central Park, New York',
    coordinates: {
      lat: 40.7829,
      lng: -73.9654,
    },
  },
};

export const Interactive: Story = {
  args: {
    location: 'Golden Gate Bridge, San Francisco',
    coordinates: {
      lat: 37.8199,
      lng: -122.4783,
    },
    interactive: true,
    onInteractiveClick: () => console.log('Interactive map clicked'),
  },
};

export const CustomDimensions: Story = {
  args: {
    width: 400,
    height: 300,
    location: 'Eiffel Tower, Paris',
  },
};

export const FullWidth: Story = {
  args: {
    width: '100%',
    height: 400,
    location: 'Sydney Opera House, Australia',
    coordinates: {
      lat: -33.8568,
      lng: 151.2153,
    },
  },
};

export const CustomContent: Story = {
  args: {
    title: 'Photo Location',
    description: 'This photo was taken at a beautiful location',
    location: 'Mount Fuji, Japan',
    coordinates: {
      lat: 35.3606,
      lng: 138.7274,
    },
  },
};

export const Small: Story = {
  args: {
    width: 300,
    height: 200,
    location: 'London Bridge, UK',
  },
};

export const Large: Story = {
  args: {
    width: 800,
    height: 500,
    location: 'Grand Canyon, Arizona',
    coordinates: {
      lat: 36.1069,
      lng: -112.1129,
    },
  },
};

export const NoLocation: Story = {
  args: {
    title: 'No Location Data',
    description: 'Location information is not available for this photo',
    showLocation: false,
  },
};

export const Multiple: Story = {
  render: () => (
    <div className="space-y-6">
      <MapPlaceholder
        location="Central Park, New York"
        coordinates={{ lat: 40.7829, lng: -73.9654 }}
      />
      <div className="grid grid-cols-2 gap-4">
        <MapPlaceholder
          location="Eiffel Tower, Paris"
          coordinates={{ lat: 48.8584, lng: 2.2945 }}
          height={250}
        />
        <MapPlaceholder
          location="Big Ben, London"
          coordinates={{ lat: 51.5007, lng: -0.1246 }}
          height={250}
        />
      </div>
    </div>
  ),
};

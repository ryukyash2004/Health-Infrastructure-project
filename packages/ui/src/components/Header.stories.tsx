import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './Header';

const meta: Meta<typeof Header> = {
  title: 'Clinical/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Doctor: Story = {
  args: {
    title: 'Triage Command Center',
    subtitle: 'Hospital ID: Aegis-Main-01',
    user: {
      name: 'Dr. Sarah Connor',
      role: 'MBBS, MD',
      initials: 'SC',
    },
    onRefresh: () => alert('Refresh clicked'),
    isLoading: false,
  },
};

export const Patient: Story = {
  args: {
    title: 'Patient Portal',
    subtitle: 'AI-Powered Clinical Triage',
    user: {
      name: 'Guest Patient',
      role: 'Self-Triage Mode',
      initials: 'GP',
    },
  },
};

export const WithBack: Story = {
  args: {
    ...Doctor.args,
    title: 'Patient Medical Record',
    onBack: () => alert('Back clicked'),
  },
};

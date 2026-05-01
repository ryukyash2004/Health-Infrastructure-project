import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar } from './Sidebar';
import { LayoutDashboard, Users, Calendar } from 'lucide-react';

const meta: Meta<typeof Sidebar> = {
  title: 'Clinical/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  args: {
    navItems: [
      { icon: LayoutDashboard, label: 'Overview', active: true },
      { icon: Users, label: 'Patients' },
      { icon: Calendar, label: 'Appointments' },
    ],
    onLogout: () => alert('Logout clicked'),
    onLogoClick: () => alert('Logo clicked'),
  },
};

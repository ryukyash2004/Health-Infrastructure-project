import type { Meta, StoryObj } from '@storybook/react';
import { MedicalAutocomplete } from './MedicalAutocomplete';

const meta: Meta<typeof MedicalAutocomplete> = {
  title: 'Clinical/MedicalAutocomplete',
  component: MedicalAutocomplete,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof MedicalAutocomplete>;

export const ICD10: Story = {
  args: {
    type: 'icd10',
    placeholder: 'Search ICD-10 Diagnosis...',
    onSelect: (val) => console.log('Selected:', val),
  },
};

export const RxNorm: Story = {
  args: {
    type: 'rxnorm',
    placeholder: 'Search RxNorm Medication...',
    onSelect: (val) => console.log('Selected:', val),
  },
};

export const WithDefaultValue: Story = {
  args: {
    ...ICD10.args,
    defaultValue: 'Acute Gastritis',
  },
};

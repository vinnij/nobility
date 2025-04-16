import { Control, UseFieldArrayRemove } from 'react-hook-form'
import { z } from 'zod'
import { formSchema, stepSchema, fieldSchema } from './category-manager'

export type FormValues = z.infer<typeof formSchema>
export type StepData = z.infer<typeof stepSchema>
export type FieldData = z.infer<typeof fieldSchema>

export type FieldType = {
  type: 'string' | 'number' | 'boolean' | 'enum' | 'date' | 'textarea' | 'players' | 'server';
  label: string;
  key: string;
  required: boolean;
  description?: string;
  placeholder?: string;
} & (
  | { type: 'string'; minLength?: number; maxLength?: number }
  | { type: 'number'; min?: number; max?: number }
  | { type: 'boolean' }
  | { type: 'enum'; options: string[] }
  | { type: 'date'; minDate?: string; maxDate?: string }
  | { type: 'textarea'; minLength?: number; maxLength?: number }
  | { type: 'players'; min?: number; max?: number }
  | { type: 'server' }
);

export interface SortableStepProps {
  id: string
  stepIndex: number
  control: Control<FormValues>
  removeStep: UseFieldArrayRemove
}

export interface SortableFieldProps {
  id: string
  stepIndex: number
  fieldIndex: number
  control: Control<FormValues>
  remove: UseFieldArrayRemove
}

export interface FieldDetailsProps {
  stepIndex: number
  fieldIndex: number
  control: Control<FormValues>
}

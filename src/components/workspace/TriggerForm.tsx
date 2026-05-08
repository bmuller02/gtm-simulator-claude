'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trigger, TriggerType, TriggerCondition, ConditionOperator } from '@/lib/types/gtm';
import { Plus, Trash2 } from 'lucide-react';
import { Section, FieldRow } from './BuilderShared';

const triggerSchema = z.object({
  name: z.string().min(1, 'Trigger name is required'),
  type: z.enum(['PageView', 'Click', 'FormSubmission', 'CustomEvent']),
  customEventName: z.string().optional(),
});

type TriggerFormData = z.infer<typeof triggerSchema>;

interface TriggerFormProps {
  formId: string;
  existingTrigger?: Trigger;
  onSave: (trigger: Trigger) => void;
  onTypeChange?: (type: TriggerType) => void;
}

export const TRIGGER_TYPE_LABELS: Record<TriggerType, string> = {
  PageView: 'Page View',
  Click: 'Click - All Elements',
  FormSubmission: 'Form Submission',
  CustomEvent: 'Custom Event',
};

const TRIGGER_TYPE_ABBREV: Record<TriggerType, string> = {
  PageView: 'PV',
  Click: 'CK',
  FormSubmission: 'FS',
  CustomEvent: 'CE',
};

const TRIGGER_TYPE_DESCRIPTION: Record<TriggerType, string> = {
  PageView: 'Fires when a page is loaded',
  Click: 'Fires when an element is clicked',
  FormSubmission: 'Fires when a form is submitted',
  CustomEvent: 'Fires on custom dataLayer events',
};

const TRIGGER_TYPE_COLOR: Record<TriggerType, string> = {
  PageView: '#5b8a5b',
  Click: '#c98a3a',
  FormSubmission: '#7c5b8a',
  CustomEvent: '#4f5b8a',
};

const CONDITION_VARIABLE_OPTIONS = [
  'Page URL',
  'Page Path',
  'Page Hostname',
  'Click Element',
  'Click Text',
  'Click ID',
  'Click Classes',
  'Form ID',
  'Form Classes',
  'dlv_userType',
  'dlv_analytics_consent',
  'dlv_ads_consent',
  'dlv_transactionRevenue',
  'dlv_channel',
  'Custom Variable',
];

const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  equals: 'equals',
  doesNotEqual: 'does not equal',
  contains: 'contains',
  doesNotContain: 'does not contain',
  startsWith: 'starts with',
  matchesRegex: 'matches regex',
  greaterThan: 'greater than',
  lessThan: 'less than',
};

export function TriggerForm({ formId, existingTrigger, onSave, onTypeChange }: TriggerFormProps) {
  const [conditions, setConditions] = useState<TriggerCondition[]>(existingTrigger?.conditions || []);
  const [customVarInputs, setCustomVarInputs] = useState<Record<number, string>>({});
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TriggerFormData>({
    resolver: zodResolver(triggerSchema),
    defaultValues: existingTrigger
      ? {
          name: existingTrigger.name,
          type: existingTrigger.type,
          customEventName: existingTrigger.customEventName || '',
        }
      : { type: 'PageView' },
  });

  const selectedType = watch('type') as TriggerType;

  const handleTypeChange = (val: TriggerType) => {
    setValue('type', val);
    setShowTypeSelector(false);
    onTypeChange?.(val);
  };

  const addCondition = () =>
    setConditions([...conditions, { variable: 'Page URL', operator: 'contains', value: '' }]);
  const removeCondition = (i: number) =>
    setConditions(conditions.filter((_, idx) => idx !== i));
  const updateCondition = (i: number, field: keyof TriggerCondition, val: string) =>
    setConditions(conditions.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)));

  const onSubmit = (data: TriggerFormData) => {
    onSave({
      id: existingTrigger?.id || uuidv4(),
      name: data.name,
      type: data.type,
      enabled: true,
      conditions,
      customEventName: data.type === 'CustomEvent' ? data.customEventName || '' : undefined,
    });
  };

  const typeColor = TRIGGER_TYPE_COLOR[selectedType] ?? '#4b5563';
  const typeAbbrev = TRIGGER_TYPE_ABBREV[selectedType] ?? '?';

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      {/* Trigger name row */}
      <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid #e6e2db' }}>
        <div
          className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ background: typeColor }}
        >
          {typeAbbrev}
        </div>
        <input
          className="flex-1 text-base font-semibold bg-transparent outline-none border-b border-transparent focus:border-[#c9c5be]"
          style={{ color: '#1a1d24' }}
          placeholder="Untitled Trigger"
          {...register('name')}
        />
        {errors.name && (
          <span className="text-xs shrink-0" style={{ color: '#ef4444' }}>
            {errors.name.message}
          </span>
        )}
      </div>

      {/* Trigger Configuration section */}
      <Section title="Trigger Configuration">
        {/* Type card / selector */}
        {!showTypeSelector ? (
          <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid #f0ece4' }}>
            <div
              className="w-9 h-9 rounded flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: typeColor }}
            >
              {typeAbbrev}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold" style={{ color: '#1a1d24' }}>
                {TRIGGER_TYPE_LABELS[selectedType]}
              </div>
              <div className="text-xs" style={{ color: '#6b7280' }}>
                {TRIGGER_TYPE_DESCRIPTION[selectedType]}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowTypeSelector(true)}
              className="shrink-0 text-xs px-2.5 py-1 rounded transition-colors hover:bg-gray-50"
              style={{ border: '1px solid #c9c5be', color: '#6b7280' }}
            >
              Change
            </button>
          </div>
        ) : (
          <div className="px-4 py-3" style={{ borderBottom: '1px solid #f0ece4' }}>
            <Select
              value={selectedType}
              onValueChange={(val) => val && handleTypeChange(val as TriggerType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TRIGGER_TYPE_LABELS) as TriggerType[]).map((value) => (
                  <SelectItem key={value} value={value}>
                    {TRIGGER_TYPE_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() => setShowTypeSelector(false)}
              className="mt-1 text-xs"
              style={{ color: '#9ca3af' }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Custom event name */}
        {selectedType === 'CustomEvent' && (
          <FieldRow label="Custom Event Name">
            <Input
              placeholder="e.g. purchase"
              className="text-sm"
              {...register('customEventName')}
            />
          </FieldRow>
        )}
      </Section>

      {/* Trigger Filters section */}
      <Section title="Trigger Filters">
        <div className="px-4 py-3 space-y-2">
          {conditions.length === 0 && (
            <p className="text-xs italic" style={{ color: '#9ca3af' }}>
              {selectedType === 'PageView'
                ? 'No conditions = fires on all pages'
                : selectedType === 'Click'
                ? 'No conditions = fires on any click'
                : selectedType === 'FormSubmission'
                ? 'No conditions = fires on any form submission'
                : 'Add conditions to filter when this trigger fires'}
            </p>
          )}

          {conditions.map((condition, i) => (
            <div
              key={i}
              className="rounded border p-2.5 space-y-2"
              style={{ borderColor: '#e6e2db', background: '#faf8f4' }}
            >
              <div className="flex gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs mb-1" style={{ color: '#9ca3af' }}>
                    Variable
                  </p>
                  <Select
                    value={
                      customVarInputs[i] === 'custom'
                        ? 'Custom Variable'
                        : condition.variable || 'Page URL'
                    }
                    onValueChange={(val) => {
                      if (!val) return;
                      if (val === 'Custom Variable') {
                        updateCondition(i, 'variable', '');
                        setCustomVarInputs({ ...customVarInputs, [i]: 'custom' });
                      } else {
                        updateCondition(i, 'variable', val);
                        setCustomVarInputs({ ...customVarInputs, [i]: '' });
                      }
                    }}
                  >
                    <SelectTrigger className="text-xs h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_VARIABLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt} className="text-xs">
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {customVarInputs[i] === 'custom' && (
                    <Input
                      className="mt-1 text-xs h-7"
                      placeholder="Variable name"
                      value={condition.variable}
                      onChange={(e) => updateCondition(i, 'variable', e.target.value)}
                    />
                  )}
                </div>

                <div className="w-32 shrink-0">
                  <p className="text-xs mb-1" style={{ color: '#9ca3af' }}>
                    Operator
                  </p>
                  <Select
                    value={condition.operator}
                    onValueChange={(val) =>
                      val && updateCondition(i, 'operator', val as ConditionOperator)
                    }
                  >
                    <SelectTrigger className="text-xs h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(OPERATOR_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value} className="text-xs">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <button
                  type="button"
                  onClick={() => removeCondition(i)}
                  className="shrink-0 self-end mb-0.5"
                >
                  <Trash2 className="h-3.5 w-3.5" style={{ color: '#b85a5a' }} />
                </button>
              </div>

              <div>
                <p className="text-xs mb-1" style={{ color: '#9ca3af' }}>
                  Value
                </p>
                <Input
                  className="text-xs h-7"
                  placeholder="e.g. /products, Add to Cart"
                  value={condition.value}
                  onChange={(e) => updateCondition(i, 'value', e.target.value)}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addCondition}
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: '#4f5b8a' }}
          >
            <Plus className="h-3 w-3" /> Add Condition
          </button>
        </div>
      </Section>
    </form>
  );
}

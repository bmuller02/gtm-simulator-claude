'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Trigger, TriggerType, TriggerCondition, ConditionOperator } from '@/lib/types/gtm';
import { Plus, Trash2, Zap } from 'lucide-react';

const triggerSchema = z.object({
  name: z.string().min(1, 'Trigger name is required'),
  type: z.enum(['PageView', 'Click', 'FormSubmission', 'CustomEvent']),
  customEventName: z.string().optional(),
});

type TriggerFormData = z.infer<typeof triggerSchema>;

const TRIGGER_TYPE_LABELS: Record<TriggerType, string> = {
  PageView: 'Page View',
  Click: 'Click - All Elements',
  FormSubmission: 'Form Submission',
  CustomEvent: 'Custom Event',
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

interface TriggerFormProps {
  existingTrigger?: Trigger;
  onSave: (trigger: Trigger) => void;
  onCancel: () => void;
}

export function TriggerForm({ existingTrigger, onSave, onCancel }: TriggerFormProps) {
  const [conditions, setConditions] = useState<TriggerCondition[]>(
    existingTrigger?.conditions || []
  );
  const [customVarInputs, setCustomVarInputs] = useState<Record<number, string>>({});

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

  const selectedType = watch('type');

  const addCondition = () => {
    setConditions([
      ...conditions,
      { variable: 'Page URL', operator: 'contains', value: '' },
    ]);
  };

  const removeCondition = (i: number) => {
    setConditions(conditions.filter((_, idx) => idx !== i));
  };

  const updateCondition = (i: number, field: keyof TriggerCondition, val: string) => {
    setConditions(conditions.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)));
  };

  const onSubmit = (data: TriggerFormData) => {
    const trigger: Trigger = {
      id: existingTrigger?.id || uuidv4(),
      name: data.name,
      type: data.type,
      enabled: true,
      conditions,
      customEventName: data.type === 'CustomEvent' ? data.customEventName || '' : undefined,
    };
    onSave(trigger);
  };

  const typeColor: Record<string, string> = {
    PageView: 'bg-green-600',
    Click: 'bg-yellow-500',
    FormSubmission: 'bg-purple-500',
    CustomEvent: 'bg-blue-600',
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* GTM-style header strip */}
      {selectedType && (
        <div className={`-mx-4 -mt-4 px-4 py-3 mb-2 flex items-center gap-3 ${typeColor[selectedType] ?? 'bg-gray-500'} rounded-t-xl`}>
          <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{TRIGGER_TYPE_LABELS[selectedType as TriggerType] ?? 'Trigger'}</p>
            <p className="text-white/70 text-xs">Trigger Configuration</p>
          </div>
        </div>
      )}

      {/* Name */}
      <div className="space-y-1">
        <Label htmlFor="trigger-name">Trigger Name</Label>
        <Input id="trigger-name" placeholder="e.g. All Pages" {...register('name')} />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      {/* Type */}
      <div className="space-y-1">
        <Label>Trigger Type</Label>
        <Select
          value={selectedType}
          onValueChange={(val) => val && setValue('type', val as TriggerType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select trigger type" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TRIGGER_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom Event Name */}
      {selectedType === 'CustomEvent' && (
        <div className="space-y-1">
          <Label>Custom Event Name</Label>
          <Input
            placeholder="e.g. purchase"
            {...register('customEventName')}
          />
          <p className="text-xs text-muted-foreground">
            Must exactly match the event name fired via dataLayer.push(&#123; event: &quot;...&quot; &#125;)
          </p>
        </div>
      )}

      <Separator />

      {/* Conditions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Label>Conditions</Label>
            <p className="text-xs text-muted-foreground">All conditions must match for the trigger to fire</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addCondition}>
            <Plus className="h-3 w-3 mr-1" /> Add Condition
          </Button>
        </div>

        {conditions.length === 0 && (
          <p className="text-xs text-muted-foreground italic py-2">
            {selectedType === 'PageView' ? 'No conditions = fires on all pages' :
             selectedType === 'Click' ? 'No conditions = fires on any click' :
             selectedType === 'FormSubmission' ? 'No conditions = fires on any form submission' :
             'Add conditions to filter when this trigger fires'}
          </p>
        )}

        {conditions.map((condition, i) => (
          <div key={i} className="border rounded-md p-2 space-y-2 bg-gray-50">
            <div className="flex gap-2 items-center">
              {/* Variable */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Variable</p>
                <Select
                  value={condition.variable}
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
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_VARIABLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {customVarInputs[i] === 'custom' && (
                  <Input
                    className="mt-1 text-xs h-8"
                    placeholder="Variable name"
                    value={condition.variable}
                    onChange={(e) => updateCondition(i, 'variable', e.target.value)}
                  />
                )}
              </div>

              {/* Operator */}
              <div className="w-36 shrink-0">
                <p className="text-xs text-muted-foreground mb-1">Operator</p>
                <Select
                  value={condition.operator}
                  onValueChange={(val) => val && updateCondition(i, 'operator', val as ConditionOperator)}
                >
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(OPERATOR_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value} className="text-xs">{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCondition(i)}
                className="shrink-0 mt-4"
              >
                <Trash2 className="h-3 w-3 text-red-400" />
              </Button>
            </div>

            {/* Value on its own row */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Value</p>
              <Input
                className="text-xs h-8"
                placeholder="e.g. /products, Add to Cart, internal"
                value={condition.value}
                onChange={(e) => updateCondition(i, 'value', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
          {existingTrigger ? 'Update Trigger' : 'Save Trigger'}
        </Button>
      </div>
    </form>
  );
}

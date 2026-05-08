'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Variable, VariableType } from '@/lib/types/gtm';
import { Section, FieldRow } from './BuilderShared';

const variableSchema = z.object({
  name: z.string().min(1, 'Variable name is required'),
  type: z.enum(['DataLayer', 'DOMElement', 'JavaScriptVariable', 'Constant', 'Cookie']),
  dataLayerVariableName: z.string().optional(),
  defaultValue: z.string().optional(),
  cssSelector: z.string().optional(),
  attributeName: z.string().optional(),
  javaScriptVariableName: z.string().optional(),
  constantValue: z.string().optional(),
  cookieName: z.string().optional(),
});

type VariableFormData = z.infer<typeof variableSchema>;

interface VariableFormProps {
  formId: string;
  existingVariable?: Variable;
  onSave: (variable: Variable) => void;
  onTypeChange?: (type: VariableType) => void;
}

export const VARIABLE_TYPE_LABELS: Record<VariableType, string> = {
  DataLayer: 'Data Layer Variable',
  DOMElement: 'DOM Element',
  JavaScriptVariable: 'JavaScript Variable',
  Constant: 'Constant',
  Cookie: 'Cookie',
};

const VARIABLE_TYPE_ABBREV: Record<VariableType, string> = {
  DataLayer: 'DL',
  DOMElement: 'DO',
  JavaScriptVariable: 'JS',
  Constant: 'CN',
  Cookie: 'CK',
};

const VARIABLE_TYPE_DESCRIPTION: Record<VariableType, string> = {
  DataLayer: 'Reads a value from the data layer',
  DOMElement: 'Reads a value from a DOM element',
  JavaScriptVariable: 'Reads a global JavaScript variable',
  Constant: 'Returns a fixed value',
  Cookie: 'Reads a browser cookie',
};

const VARIABLE_TYPE_COLOR: Record<VariableType, string> = {
  DataLayer: '#1a8a6e',
  DOMElement: '#5b5b8a',
  JavaScriptVariable: '#c98a3a',
  Constant: '#6b7280',
  Cookie: '#b85a5a',
};

export function VariableForm({ formId, existingVariable, onSave, onTypeChange }: VariableFormProps) {
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<VariableFormData>({
    resolver: zodResolver(variableSchema),
    defaultValues: existingVariable
      ? {
          name: existingVariable.name,
          type: existingVariable.type,
          dataLayerVariableName: (existingVariable.config as any).dataLayerVariableName || '',
          defaultValue: (existingVariable.config as any).defaultValue || '',
          cssSelector: (existingVariable.config as any).cssSelector || '',
          attributeName: (existingVariable.config as any).attributeName || '',
          javaScriptVariableName: (existingVariable.config as any).javaScriptVariableName || '',
          constantValue: (existingVariable.config as any).value || '',
          cookieName: (existingVariable.config as any).cookieName || '',
        }
      : { type: 'DataLayer' },
  });

  const selectedType = watch('type') as VariableType;

  const handleTypeChange = (val: VariableType) => {
    setValue('type', val);
    setShowTypeSelector(false);
    onTypeChange?.(val);
  };

  const onSubmit = (data: VariableFormData) => {
    let config: any = {};
    switch (data.type) {
      case 'DataLayer':
        config = { dataLayerVariableName: data.dataLayerVariableName || '', defaultValue: data.defaultValue || '' };
        break;
      case 'DOMElement':
        config = { cssSelector: data.cssSelector || '', attributeName: data.attributeName || 'value' };
        break;
      case 'JavaScriptVariable':
        config = { javaScriptVariableName: data.javaScriptVariableName || '' };
        break;
      case 'Constant':
        config = { value: data.constantValue || '' };
        break;
      case 'Cookie':
        config = { cookieName: data.cookieName || '' };
        break;
    }

    onSave({
      id: existingVariable?.id || uuidv4(),
      name: data.name,
      type: data.type,
      enabled: true,
      config,
    });
  };

  const typeColor = VARIABLE_TYPE_COLOR[selectedType] ?? '#4b5563';
  const typeAbbrev = VARIABLE_TYPE_ABBREV[selectedType] ?? '?';

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      {/* Variable name row */}
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
          placeholder="Untitled Variable"
          {...register('name')}
        />
        {errors.name && (
          <span className="text-xs shrink-0" style={{ color: '#ef4444' }}>
            {errors.name.message}
          </span>
        )}
      </div>

      {/* Variable Configuration section */}
      <Section title="Variable Configuration">
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
                {VARIABLE_TYPE_LABELS[selectedType]}
              </div>
              <div className="text-xs" style={{ color: '#6b7280' }}>
                {VARIABLE_TYPE_DESCRIPTION[selectedType]}
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
              onValueChange={(val) => val && handleTypeChange(val as VariableType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(VARIABLE_TYPE_LABELS) as VariableType[]).map((value) => (
                  <SelectItem key={value} value={value}>
                    {VARIABLE_TYPE_LABELS[value]}
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

        {/* Type-specific fields */}
        {selectedType === 'DataLayer' && (
          <>
            <FieldRow label="Data Layer Key">
              <Input
                placeholder="e.g. userType"
                className="text-sm"
                {...register('dataLayerVariableName')}
              />
            </FieldRow>
            <FieldRow label="Default Value">
              <Input
                placeholder="Value if not set"
                className="text-sm"
                {...register('defaultValue')}
              />
            </FieldRow>
          </>
        )}

        {selectedType === 'DOMElement' && (
          <>
            <FieldRow label="CSS Selector">
              <Input
                placeholder='e.g. input[name="email"]'
                className="text-sm"
                {...register('cssSelector')}
              />
            </FieldRow>
            <FieldRow label="Attribute Name">
              <Input
                placeholder="e.g. value, href, text"
                className="text-sm"
                {...register('attributeName')}
              />
            </FieldRow>
          </>
        )}

        {selectedType === 'JavaScriptVariable' && (
          <FieldRow label="Global Variable">
            <Input
              placeholder="e.g. window.myApp.userId"
              className="text-sm"
              {...register('javaScriptVariableName')}
            />
          </FieldRow>
        )}

        {selectedType === 'Constant' && (
          <FieldRow label="Value">
            <Input placeholder="e.g. production" className="text-sm" {...register('constantValue')} />
          </FieldRow>
        )}

        {selectedType === 'Cookie' && (
          <FieldRow label="Cookie Name">
            <Input placeholder="e.g. session_id" className="text-sm" {...register('cookieName')} />
          </FieldRow>
        )}
      </Section>
    </form>
  );
}

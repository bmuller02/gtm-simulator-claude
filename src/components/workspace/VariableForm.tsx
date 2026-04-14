'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Variable, VariableType } from '@/lib/types/gtm';
import { Variable as VarIcon } from 'lucide-react';

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

const VARIABLE_TYPE_LABELS: Record<VariableType, string> = {
  DataLayer: 'Data Layer Variable',
  DOMElement: 'DOM Element',
  JavaScriptVariable: 'JavaScript Variable',
  Constant: 'Constant',
  Cookie: 'Cookie',
};

interface VariableFormProps {
  existingVariable?: Variable;
  onSave: (variable: Variable) => void;
  onCancel: () => void;
}

export function VariableForm({ existingVariable, onSave, onCancel }: VariableFormProps) {
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

  const selectedType = watch('type');

  const onSubmit = (data: VariableFormData) => {
    let config: any = {};

    switch (data.type) {
      case 'DataLayer':
        config = {
          dataLayerVariableName: data.dataLayerVariableName || '',
          defaultValue: data.defaultValue || '',
        };
        break;
      case 'DOMElement':
        config = {
          cssSelector: data.cssSelector || '',
          attributeName: data.attributeName || 'value',
        };
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

    const variable: Variable = {
      id: existingVariable?.id || uuidv4(),
      name: data.name,
      type: data.type,
      enabled: true,
      config,
    };

    onSave(variable);
  };

  const typeColor: Record<string, string> = {
    DataLayer: 'bg-teal-600',
    DOMElement: 'bg-indigo-500',
    JavaScriptVariable: 'bg-yellow-600',
    Constant: 'bg-gray-500',
    Cookie: 'bg-pink-500',
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* GTM-style header strip */}
      {selectedType && (
        <div className={`-mx-4 -mt-4 px-4 py-3 mb-2 flex items-center gap-3 ${typeColor[selectedType] ?? 'bg-gray-500'} rounded-t-xl`}>
          <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center">
            <VarIcon className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{VARIABLE_TYPE_LABELS[selectedType as VariableType] ?? 'Variable'}</p>
            <p className="text-white/70 text-xs">Variable Configuration</p>
          </div>
        </div>
      )}

      {/* Name */}
      <div className="space-y-1">
        <Label htmlFor="var-name">Variable Name</Label>
        <Input
          id="var-name"
          placeholder="e.g. dlv_userType"
          {...register('name')}
        />
        <p className="text-xs text-muted-foreground">
          Reference this variable in triggers using &#123;&#123;Variable Name&#125;&#125;
        </p>
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      {/* Type */}
      <div className="space-y-1">
        <Label>Variable Type</Label>
        <Select
          value={selectedType}
          onValueChange={(val) => val && setValue('type', val as VariableType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select variable type" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(VARIABLE_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Type-specific fields */}
      {selectedType === 'DataLayer' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Data Layer Variable Name</Label>
            <Input
              placeholder="e.g. userType"
              {...register('dataLayerVariableName')}
            />
            <p className="text-xs text-muted-foreground">
              Must exactly match the key used in dataLayer.push(&#123; ... &#125;)
            </p>
          </div>
          <div className="space-y-1">
            <Label>Default Value (optional)</Label>
            <Input placeholder="Value if not set" {...register('defaultValue')} />
          </div>
        </div>
      )}

      {selectedType === 'DOMElement' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>CSS Selector</Label>
            <Input
              placeholder='e.g. input[name="email"]'
              {...register('cssSelector')}
            />
          </div>
          <div className="space-y-1">
            <Label>Attribute Name</Label>
            <Input
              placeholder="e.g. value, href, data-id"
              {...register('attributeName')}
            />
            <p className="text-xs text-muted-foreground">
              Use &quot;value&quot; for input fields, &quot;href&quot; for links, &quot;text&quot; for visible text
            </p>
          </div>
        </div>
      )}

      {selectedType === 'JavaScriptVariable' && (
        <div className="space-y-1">
          <Label>Global Variable Name</Label>
          <Input
            placeholder="e.g. window.myApp.userId"
            {...register('javaScriptVariableName')}
          />
        </div>
      )}

      {selectedType === 'Constant' && (
        <div className="space-y-1">
          <Label>Value</Label>
          <Input placeholder="e.g. production" {...register('constantValue')} />
        </div>
      )}

      {selectedType === 'Cookie' && (
        <div className="space-y-1">
          <Label>Cookie Name</Label>
          <Input placeholder="e.g. session_id" {...register('cookieName')} />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
          {existingVariable ? 'Update Variable' : 'Save Variable'}
        </Button>
      </div>
    </form>
  );
}

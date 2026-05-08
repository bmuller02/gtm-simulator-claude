'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tag, TagType, Trigger } from '@/lib/types/gtm';
import { Plus, Trash2 } from 'lucide-react';
import { Section, FieldRow } from './BuilderShared';

const tagSchema = z.object({
  name: z.string().min(1, 'Tag name is required'),
  type: z.enum(['GA4Configuration', 'GA4Event', 'GoogleAdsConversion', 'ConversionLinker', 'CustomHTML', 'GoogleTag', 'FloodlightActivity']),
  firingTriggerId: z.string().min(1, 'Please select a firing trigger'),
  measurementId: z.string().optional(),
  eventName: z.string().optional(),
  conversionId: z.string().optional(),
  conversionLabel: z.string().optional(),
  html: z.string().optional(),
  sendPageView: z.boolean().optional(),
  googleTagId: z.string().optional(),
  floodlightAdvertiserId: z.string().optional(),
  floodlightGroupTagString: z.string().optional(),
  floodlightActivityTagString: z.string().optional(),
  floodlightCountingMethod: z.enum(['standard', 'unique', 'per_session']).optional(),
  setupTagId: z.string().optional(),
  teardownTagId: z.string().optional(),
});

type TagFormData = z.infer<typeof tagSchema>;

interface CustomDimensionRow {
  key: string;
  value: string;
}

interface TagFormProps {
  formId: string;
  triggers: Trigger[];
  tags?: Tag[];
  existingTag?: Tag;
  onSave: (tag: Tag) => void;
  onTypeChange?: (type: TagType) => void;
}

export const TAG_TYPE_LABELS: Record<TagType, string> = {
  GoogleTag: 'Google Tag',
  FloodlightActivity: 'Floodlight Activity',
  GA4Configuration: 'GA4 Configuration',
  GA4Event: 'GA4 Event',
  GoogleAdsConversion: 'Google Ads Conversion',
  ConversionLinker: 'Conversion Linker',
  CustomHTML: 'Custom HTML',
};

const TAG_TYPE_ABBREV: Record<TagType, string> = {
  GoogleTag: 'GT',
  FloodlightActivity: 'FL',
  GA4Configuration: 'GA',
  GA4Event: 'GA',
  GoogleAdsConversion: 'AW',
  ConversionLinker: 'CL',
  CustomHTML: '<>',
};

const TAG_TYPE_DESCRIPTION: Record<TagType, string> = {
  GoogleTag: 'Google Tag · Site configuration',
  FloodlightActivity: 'Campaign Manager 360 · Conversion tracking',
  GA4Configuration: 'Google Analytics 4 · Configuration',
  GA4Event: 'Google Analytics 4 · Event tracking',
  GoogleAdsConversion: 'Google Ads · Conversion tracking',
  ConversionLinker: 'Google Ads · Cross-domain linking',
  CustomHTML: 'Custom · HTML/JavaScript',
};

const TAG_TYPE_COLOR: Record<TagType, string> = {
  GoogleTag: '#1a73e8',
  FloodlightActivity: '#1a8a6e',
  GA4Configuration: '#e8711a',
  GA4Event: '#e8a41a',
  GoogleAdsConversion: '#1a65e8',
  ConversionLinker: '#3d7be8',
  CustomHTML: '#4b5563',
};

export function TagForm({ formId, triggers, tags = [], existingTag, onSave, onTypeChange }: TagFormProps) {
  const [customDimensions, setCustomDimensions] = useState<CustomDimensionRow[]>(
    existingTag?.type === 'GA4Event' && (existingTag.config as any).customDimensions
      ? Object.entries((existingTag.config as any).customDimensions).map(([key, value]) => ({
          key,
          value: value as string,
        }))
      : []
  );
  const [fireBeforeEnabled, setFireBeforeEnabled] = useState(!!existingTag?.setupTagId);
  const [fireAfterEnabled, setFireAfterEnabled] = useState(!!existingTag?.teardownTagId);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: existingTag
      ? {
          name: existingTag.name,
          type: existingTag.type,
          firingTriggerId: existingTag.firingTriggerId,
          measurementId: (existingTag.config as any).measurementId || '',
          eventName: (existingTag.config as any).eventName || '',
          conversionId: (existingTag.config as any).conversionId || '',
          conversionLabel: (existingTag.config as any).conversionLabel || '',
          html: (existingTag.config as any).html || '',
          sendPageView: (existingTag.config as any).sendPageView ?? true,
          googleTagId: (existingTag.config as any).tagId || '',
          floodlightAdvertiserId: (existingTag.config as any).advertiserId || '',
          floodlightGroupTagString: (existingTag.config as any).groupTagString || '',
          floodlightActivityTagString: (existingTag.config as any).activityTagString || '',
          floodlightCountingMethod: (existingTag.config as any).countingMethod || 'standard',
          setupTagId: existingTag.setupTagId || '',
          teardownTagId: existingTag.teardownTagId || '',
        }
      : { type: 'GoogleTag', sendPageView: true, floodlightCountingMethod: 'standard' },
  });

  const selectedType = watch('type') as TagType;
  const firingTriggerId = watch('firingTriggerId');
  const setupTagIdVal = watch('setupTagId');
  const teardownTagIdVal = watch('teardownTagId');
  const otherTags = tags.filter((t) => t.id !== existingTag?.id);

  const handleTypeChange = (val: TagType) => {
    setValue('type', val);
    setShowTypeSelector(false);
    onTypeChange?.(val);
  };

  const onSubmit = (data: TagFormData) => {
    let config: any = {};
    switch (data.type) {
      case 'GoogleTag':
        config = { tagId: data.googleTagId || '' };
        break;
      case 'FloodlightActivity':
        config = {
          advertiserId: data.floodlightAdvertiserId || '',
          groupTagString: data.floodlightGroupTagString || '',
          activityTagString: data.floodlightActivityTagString || '',
          countingMethod: data.floodlightCountingMethod || 'standard',
        };
        break;
      case 'GA4Configuration':
        config = { measurementId: data.measurementId || '', sendPageView: data.sendPageView ?? true };
        break;
      case 'GA4Event':
        config = {
          eventName: data.eventName || '',
          customDimensions: customDimensions.reduce((acc, row) => {
            if (row.key) acc[row.key] = row.value;
            return acc;
          }, {} as Record<string, string>),
        };
        break;
      case 'GoogleAdsConversion':
        config = { conversionId: data.conversionId || '', conversionLabel: data.conversionLabel || '' };
        break;
      case 'ConversionLinker':
        config = { enableCrossDomain: true };
        break;
      case 'CustomHTML':
        config = { html: data.html || '' };
        break;
    }

    onSave({
      id: existingTag?.id || uuidv4(),
      name: data.name,
      type: data.type,
      enabled: true,
      firingTriggerId: data.firingTriggerId,
      config,
      ...(fireBeforeEnabled && setupTagIdVal ? { setupTagId: setupTagIdVal } : {}),
      ...(fireAfterEnabled && teardownTagIdVal ? { teardownTagId: teardownTagIdVal } : {}),
    });
  };

  const addDimension = () => setCustomDimensions([...customDimensions, { key: '', value: '' }]);
  const removeDimension = (i: number) => setCustomDimensions(customDimensions.filter((_, idx) => idx !== i));
  const updateDimension = (i: number, field: 'key' | 'value', val: string) => {
    setCustomDimensions(customDimensions.map((d, idx) => (idx === i ? { ...d, [field]: val } : d)));
  };

  const typeColor = TAG_TYPE_COLOR[selectedType] ?? '#4b5563';
  const typeAbbrev = TAG_TYPE_ABBREV[selectedType] ?? '?';

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      {/* Tag name row */}
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
          placeholder="Untitled Tag"
          {...register('name')}
        />
        {errors.name && (
          <span className="text-xs shrink-0" style={{ color: '#ef4444' }}>
            {errors.name.message}
          </span>
        )}
      </div>

      {/* Tag Configuration section */}
      <Section title="Tag Configuration">
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
                {TAG_TYPE_LABELS[selectedType]}
              </div>
              <div className="text-xs" style={{ color: '#6b7280' }}>
                {TAG_TYPE_DESCRIPTION[selectedType]}
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
              onValueChange={(val) => val && handleTypeChange(val as TagType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TAG_TYPE_LABELS) as TagType[]).map((value) => (
                  <SelectItem key={value} value={value}>
                    {TAG_TYPE_LABELS[value]}
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
        {selectedType === 'GoogleTag' && (
          <FieldRow label="Tag ID">
            <Input
              placeholder="DC-XXXXXXXXX or GT-XXXXXXXXX"
              className="text-sm"
              {...register('googleTagId')}
            />
          </FieldRow>
        )}

        {selectedType === 'FloodlightActivity' && (
          <>
            <FieldRow label="Advertiser ID">
              <Input placeholder="DC-12345678" className="text-sm" {...register('floodlightAdvertiserId')} />
            </FieldRow>
            <FieldRow label="Activity Group String">
              <Input placeholder="e.g. shop" className="text-sm" {...register('floodlightGroupTagString')} />
            </FieldRow>
            <FieldRow label="Activity Tag String">
              <Input placeholder="e.g. add_to_cart" className="text-sm" {...register('floodlightActivityTagString')} />
            </FieldRow>
            <FieldRow label="Counting Method">
              <Select
                value={watch('floodlightCountingMethod') || 'standard'}
                onValueChange={(val) =>
                  val && setValue('floodlightCountingMethod', val as 'standard' | 'unique' | 'per_session')
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue>
                    {watch('floodlightCountingMethod') === 'unique'
                      ? 'Unique'
                      : watch('floodlightCountingMethod') === 'per_session'
                      ? 'Per Session'
                      : 'Standard'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="unique">Unique</SelectItem>
                  <SelectItem value="per_session">Per Session</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
          </>
        )}

        {selectedType === 'GA4Configuration' && (
          <FieldRow label="Measurement ID">
            <Input placeholder="G-XXXXXXXX" className="text-sm" {...register('measurementId')} />
          </FieldRow>
        )}

        {selectedType === 'GA4Event' && (
          <>
            <FieldRow label="Event Name">
              <Input placeholder="e.g. add_to_cart" className="text-sm" {...register('eventName')} />
            </FieldRow>
            <div className="px-4 py-3" style={{ borderTop: '1px solid #f0ece4' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: '#6b7280' }}>
                  Custom Parameters
                </span>
                <button
                  type="button"
                  onClick={addDimension}
                  className="flex items-center gap-0.5 text-xs"
                  style={{ color: '#4f5b8a' }}
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>
              {customDimensions.map((dim, i) => (
                <div key={i} className="flex gap-2 items-center mb-1.5">
                  <Input
                    placeholder="Key"
                    value={dim.key}
                    onChange={(e) => updateDimension(i, 'key', e.target.value)}
                    className="flex-1 text-xs h-8"
                  />
                  <Input
                    placeholder="Value"
                    value={dim.value}
                    onChange={(e) => updateDimension(i, 'value', e.target.value)}
                    className="flex-1 text-xs h-8"
                  />
                  <button type="button" onClick={() => removeDimension(i)} className="shrink-0">
                    <Trash2 className="h-3 w-3" style={{ color: '#b85a5a' }} />
                  </button>
                </div>
              ))}
              {customDimensions.length === 0 && (
                <p className="text-xs italic" style={{ color: '#9ca3af' }}>
                  No parameters yet
                </p>
              )}
            </div>
          </>
        )}

        {selectedType === 'GoogleAdsConversion' && (
          <>
            <FieldRow label="Conversion ID">
              <Input placeholder="AW-XXXXXXXXXX" className="text-sm" {...register('conversionId')} />
            </FieldRow>
            <FieldRow label="Conversion Label">
              <Input
                placeholder="xXxXxXxXxXx (optional)"
                className="text-sm"
                {...register('conversionLabel')}
              />
            </FieldRow>
          </>
        )}

        {selectedType === 'ConversionLinker' && (
          <div className="px-4 py-3">
            <p className="text-xs" style={{ color: '#6b7280' }}>
              Automatically enables cross-domain conversion tracking. No additional configuration needed.
            </p>
          </div>
        )}

        {selectedType === 'CustomHTML' && (
          <FieldRow label="HTML Code">
            <Textarea
              placeholder='<script>console.log("tag fired");</script>'
              className="font-mono text-xs"
              rows={4}
              {...register('html')}
            />
          </FieldRow>
        )}
      </Section>

      {/* Triggering section */}
      <Section title="Triggering">
        <FieldRow label="Firing Trigger">
          <Select
            value={firingTriggerId || ''}
            onValueChange={(val) => val && setValue('firingTriggerId', val)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select a trigger">
                {triggers.find((t) => t.id === firingTriggerId)?.name || ''}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {triggers.length === 0 ? (
                <SelectItem value="_none" disabled>
                  No triggers yet — create one first
                </SelectItem>
              ) : (
                triggers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </FieldRow>
        {errors.firingTriggerId && (
          <p className="px-4 pb-2 text-xs" style={{ color: '#ef4444' }}>
            {errors.firingTriggerId.message}
          </p>
        )}
      </Section>

      {/* Advanced Settings section */}
      <Section title="Advanced Settings — Tag Sequencing, Firing Priority" defaultOpen={false}>
        <div className="px-4 py-3 space-y-3">
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: '#4b5563' }}>
              <input
                type="checkbox"
                checked={fireBeforeEnabled}
                onChange={(e) => {
                  setFireBeforeEnabled(e.target.checked);
                  if (!e.target.checked) setValue('setupTagId', '');
                }}
                className="rounded"
              />
              Fire a tag before this tag fires
            </label>
            {fireBeforeEnabled && (
              <div className="ml-6">
                <Select
                  value={setupTagIdVal || ''}
                  onValueChange={(val) => val && setValue('setupTagId', val)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select a tag">
                      {otherTags.find((t) => t.id === setupTagIdVal)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {otherTags.length === 0 ? (
                      <SelectItem value="_none" disabled>
                        No other tags available
                      </SelectItem>
                    ) : (
                      otherTags.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: '#4b5563' }}>
              <input
                type="checkbox"
                checked={fireAfterEnabled}
                onChange={(e) => {
                  setFireAfterEnabled(e.target.checked);
                  if (!e.target.checked) setValue('teardownTagId', '');
                }}
                className="rounded"
              />
              Fire a tag after this tag fires
            </label>
            {fireAfterEnabled && (
              <div className="ml-6">
                <Select
                  value={teardownTagIdVal || ''}
                  onValueChange={(val) => val && setValue('teardownTagId', val)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select a tag">
                      {otherTags.find((t) => t.id === teardownTagIdVal)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {otherTags.length === 0 ? (
                      <SelectItem value="_none" disabled>
                        No other tags available
                      </SelectItem>
                    ) : (
                      otherTags.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </Section>
    </form>
  );
}

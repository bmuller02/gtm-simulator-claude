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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tag, TagType, Trigger } from '@/lib/types/gtm';
import { X, Plus, Trash2, Tag as TagIcon } from 'lucide-react';

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
  triggers: Trigger[];
  tags?: Tag[];
  existingTag?: Tag;
  onSave: (tag: Tag) => void;
  onCancel: () => void;
}

const TAG_TYPE_LABELS: Record<TagType, string> = {
  GoogleTag: 'Google Tag',
  FloodlightActivity: 'Floodlight Activity',
  GA4Configuration: 'Google Analytics 4 - Configuration',
  GA4Event: 'Google Analytics 4 - Event',
  GoogleAdsConversion: 'Google Ads - Conversion Tracking',
  ConversionLinker: 'Conversion Linker',
  CustomHTML: 'Custom HTML',
};

export function TagForm({ triggers, tags = [], existingTag, onSave, onCancel }: TagFormProps) {
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

  const selectedType = watch('type');
  const firingTriggerId = watch('firingTriggerId');
  const setupTagIdVal = watch('setupTagId');
  const teardownTagIdVal = watch('teardownTagId');

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

    const tag: Tag = {
      id: existingTag?.id || uuidv4(),
      name: data.name,
      type: data.type,
      enabled: true,
      firingTriggerId: data.firingTriggerId,
      config,
      ...(fireBeforeEnabled && setupTagIdVal ? { setupTagId: setupTagIdVal } : {}),
      ...(fireAfterEnabled && teardownTagIdVal ? { teardownTagId: teardownTagIdVal } : {}),
    };

    onSave(tag);
  };

  const addDimension = () => setCustomDimensions([...customDimensions, { key: '', value: '' }]);
  const removeDimension = (i: number) => setCustomDimensions(customDimensions.filter((_, idx) => idx !== i));
  const updateDimension = (i: number, field: 'key' | 'value', val: string) => {
    setCustomDimensions(customDimensions.map((d, idx) => (idx === i ? { ...d, [field]: val } : d)));
  };

  // GTM-style type icon colors
  const typeColor: Record<string, string> = {
    GoogleTag: 'bg-blue-700',
    FloodlightActivity: 'bg-teal-600',
    GA4Configuration: 'bg-orange-500',
    GA4Event: 'bg-orange-400',
    GoogleAdsConversion: 'bg-blue-500',
    ConversionLinker: 'bg-blue-400',
    CustomHTML: 'bg-gray-600',
  };

  // Other tags (excluding the tag being edited) for sequencing selects
  const otherTags = tags.filter(t => t.id !== existingTag?.id);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* GTM-style header strip */}
      {selectedType && (
        <div className={`-mx-4 -mt-4 px-4 py-3 mb-2 flex items-center gap-3 ${typeColor[selectedType] ?? 'bg-gray-500'} rounded-t-xl`}>
          <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center">
            <TagIcon className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{TAG_TYPE_LABELS[selectedType as TagType] ?? 'Tag'}</p>
            <p className="text-white/70 text-xs">Tag Configuration</p>
          </div>
        </div>
      )}

      {/* Name */}
      <div className="space-y-1">
        <Label htmlFor="tag-name">Tag Name</Label>
        <Input id="tag-name" placeholder="e.g. Google Tag - CM360" {...register('name')} />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      {/* Type */}
      <div className="space-y-1">
        <Label>Tag Type</Label>
        <Select
          value={selectedType}
          onValueChange={(val) => val && setValue('type', val as TagType)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a tag type">
              {selectedType ? TAG_TYPE_LABELS[selectedType as TagType] : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="min-w-80">
            {Object.entries(TAG_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Type-specific fields */}
      {selectedType === 'GoogleTag' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Tag ID</Label>
            <Input placeholder="DC-XXXXXXXXX or GT-XXXXXXXXX" {...register('googleTagId')} />
            <p className="text-xs text-muted-foreground">
              Your CM360 Advertiser&apos;s Floodlight Tag ID (starts with DC-) or Google Tag ID (starts with GT-)
            </p>
          </div>
        </div>
      )}

      {selectedType === 'FloodlightActivity' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Advertiser ID</Label>
            <Input placeholder="DC-12345678" {...register('floodlightAdvertiserId')} />
            <p className="text-xs text-muted-foreground">Your CM360 advertiser ID (starts with DC-)</p>
          </div>
          <div className="space-y-1">
            <Label>Activity Group Tag String</Label>
            <Input placeholder="e.g. shop" {...register('floodlightGroupTagString')} />
            <p className="text-xs text-muted-foreground">Found in CM360 under Floodlight → Activity Groups</p>
          </div>
          <div className="space-y-1">
            <Label>Activity Tag String</Label>
            <Input placeholder="e.g. add_to_cart" {...register('floodlightActivityTagString')} />
            <p className="text-xs text-muted-foreground">Found in CM360 under Floodlight → Activities</p>
          </div>
          <div className="space-y-1">
            <Label>Counting Method</Label>
            <Select
              value={watch('floodlightCountingMethod') || 'standard'}
              onValueChange={(val) => val && setValue('floodlightCountingMethod', val as 'standard' | 'unique' | 'per_session')}
            >
              <SelectTrigger>
                <SelectValue>
                  {watch('floodlightCountingMethod') === 'unique' ? 'Unique' :
                   watch('floodlightCountingMethod') === 'per_session' ? 'Per Session' : 'Standard'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="unique">Unique</SelectItem>
                <SelectItem value="per_session">Per Session</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {selectedType === 'GA4Configuration' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Measurement ID</Label>
            <Input placeholder="G-XXXXXXXX" {...register('measurementId')} />
            <p className="text-xs text-muted-foreground">Found in your GA4 property settings</p>
          </div>
        </div>
      )}

      {selectedType === 'GA4Event' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Event Name</Label>
            <Input placeholder="e.g. add_to_cart" {...register('eventName')} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Custom Dimensions / Parameters</Label>
              <Button type="button" variant="outline" size="sm" onClick={addDimension}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              To reference a variable, type its name in the Value field (e.g. <code className="bg-gray-100 px-1 rounded font-mono">dlv_transactionRevenue</code>)
            </p>
            {customDimensions.map((dim, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  placeholder="Key (e.g. email)"
                  value={dim.key}
                  onChange={(e) => updateDimension(i, 'key', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Value (e.g. dlv_email)"
                  value={dim.value}
                  onChange={(e) => updateDimension(i, 'value', e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDimension(i)}
                  className="shrink-0"
                >
                  <Trash2 className="h-3 w-3 text-red-400" />
                </Button>
              </div>
            ))}
            {customDimensions.length === 0 && (
              <p className="text-xs text-muted-foreground">No custom dimensions added yet.</p>
            )}
          </div>
        </div>
      )}

      {selectedType === 'GoogleAdsConversion' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Conversion ID</Label>
            <Input placeholder="AW-XXXXXXXXXX" {...register('conversionId')} />
          </div>
          <div className="space-y-1">
            <Label>Conversion Label</Label>
            <Input placeholder="xXxXxXxXxXx (optional)" {...register('conversionLabel')} />
          </div>
        </div>
      )}

      {selectedType === 'ConversionLinker' && (
        <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
          <p className="text-sm text-blue-800">
            The Conversion Linker tag automatically enables cross-domain conversion tracking. No additional configuration needed.
          </p>
        </div>
      )}

      {selectedType === 'CustomHTML' && (
        <div className="space-y-1">
          <Label>HTML Code</Label>
          <Textarea
            placeholder='<script>console.log("tag fired");</script>'
            className="font-mono text-sm"
            rows={5}
            {...register('html')}
          />
        </div>
      )}

      <Separator />

      {/* Firing Trigger */}
      <div className="space-y-1">
        <Label>Firing Trigger</Label>
        <Select
          value={firingTriggerId || ''}
          onValueChange={(val) => val && setValue('firingTriggerId', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a trigger">
              {triggers.find(t => t.id === firingTriggerId)?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="min-w-56">
            {triggers.length === 0 ? (
              <SelectItem value="_none" disabled>No triggers yet — create one first</SelectItem>
            ) : (
              triggers.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {errors.firingTriggerId && (
          <p className="text-xs text-red-500">{errors.firingTriggerId.message}</p>
        )}
      </div>

      <Separator />

      {/* Tag Sequencing (Advanced Settings) */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Advanced Settings — Tag Sequencing</Label>
        <p className="text-xs text-muted-foreground">
          Tag sequencing guarantees one tag fires before or after this tag.
        </p>

        {/* Fire a tag BEFORE */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={fireBeforeEnabled}
              onChange={(e) => {
                setFireBeforeEnabled(e.target.checked);
                if (!e.target.checked) setValue('setupTagId', '');
              }}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Fire a tag before this tag fires</span>
          </label>
          {fireBeforeEnabled && (
            <div className="ml-6">
              <Select
                value={setupTagIdVal || ''}
                onValueChange={(val) => val && setValue('setupTagId', val)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select a tag">
                    {otherTags.find(t => t.id === setupTagIdVal)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="min-w-56">
                  {otherTags.length === 0 ? (
                    <SelectItem value="_none" disabled>No other tags available</SelectItem>
                  ) : (
                    otherTags.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Fire a tag AFTER */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={fireAfterEnabled}
              onChange={(e) => {
                setFireAfterEnabled(e.target.checked);
                if (!e.target.checked) setValue('teardownTagId', '');
              }}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Fire a tag after this tag fires</span>
          </label>
          {fireAfterEnabled && (
            <div className="ml-6">
              <Select
                value={teardownTagIdVal || ''}
                onValueChange={(val) => val && setValue('teardownTagId', val)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select a tag">
                    {otherTags.find(t => t.id === teardownTagIdVal)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="min-w-56">
                  {otherTags.length === 0 ? (
                    <SelectItem value="_none" disabled>No other tags available</SelectItem>
                  ) : (
                    otherTags.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
          {existingTag ? 'Update Tag' : 'Save Tag'}
        </Button>
      </div>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tag,
  Trigger,
  Variable,
  TagType,
  TriggerType,
  VariableType,
  DataLayerVariableConfig,
  DOMElementVariableConfig,
  ConstantVariableConfig,
} from '@/lib/types/gtm';
import { useWorkspaceStore } from '@/lib/store/workspaceStore';
import { TagForm, TAG_TYPE_LABELS } from './TagForm';
import { TriggerForm, TRIGGER_TYPE_LABELS } from './TriggerForm';
import { VariableForm, VARIABLE_TYPE_LABELS } from './VariableForm';
import {
  Plus,
  Tag as TagIcon,
  Zap,
  Variable as VarIcon,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
} from 'lucide-react';

const TAG_TYPE_SHORT: Record<string, string> = {
  GoogleTag: 'Google Tag',
  FloodlightActivity: 'Floodlight',
  GA4Configuration: 'GA4 Config',
  GA4Event: 'GA4 Event',
  GoogleAdsConversion: 'Google Ads',
  ConversionLinker: 'Conv. Linker',
  CustomHTML: 'Custom HTML',
};

const TRIGGER_TYPE_SHORT: Record<string, string> = {
  PageView: 'Page View',
  Click: 'Click',
  FormSubmission: 'Form Submit',
  CustomEvent: 'Custom Event',
};

const VARIABLE_TYPE_SHORT: Record<string, string> = {
  DataLayer: 'Data Layer',
  DOMElement: 'DOM Element',
  JavaScriptVariable: 'JS Variable',
  Constant: 'Constant',
  Cookie: 'Cookie',
};

type BuilderView =
  | { kind: 'none' }
  | { kind: 'tag'; entity: Tag | null; typeLabel: string }
  | { kind: 'trigger'; entity: Trigger | null; typeLabel: string }
  | { kind: 'variable'; entity: Variable | null; typeLabel: string };

function variableSummary(variable: Variable): string {
  switch (variable.type) {
    case 'DataLayer':
      return `Key: ${(variable.config as DataLayerVariableConfig).dataLayerVariableName}`;
    case 'DOMElement':
      return `${(variable.config as DOMElementVariableConfig).cssSelector}`;
    case 'Constant':
      return `Value: ${(variable.config as ConstantVariableConfig).value}`;
    default:
      return '';
  }
}

const FORM_ID = 'gtm-builder-form';

interface GTMWorkspaceProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onBuilderOpen?: () => void;
}

export function GTMWorkspace({ collapsed, onToggleCollapse, onBuilderOpen }: GTMWorkspaceProps) {
  const {
    tags,
    triggers,
    variables,
    addTag,
    updateTag,
    deleteTag,
    addTrigger,
    updateTrigger,
    deleteTrigger,
    addVariable,
    updateVariable,
    deleteVariable,
  } = useWorkspaceStore();

  const [builderView, setBuilderView] = useState<BuilderView>({ kind: 'none' });

  const openTagBuilder = (entity: Tag | null) => {
    const defaultType: TagType = entity?.type ?? 'GoogleTag';
    setBuilderView({ kind: 'tag', entity, typeLabel: TAG_TYPE_LABELS[defaultType] });
    onBuilderOpen?.();
  };

  const openTriggerBuilder = (entity: Trigger | null) => {
    const defaultType: TriggerType = entity?.type ?? 'PageView';
    setBuilderView({ kind: 'trigger', entity, typeLabel: TRIGGER_TYPE_LABELS[defaultType] });
    onBuilderOpen?.();
  };

  const openVariableBuilder = (entity: Variable | null) => {
    const defaultType: VariableType = entity?.type ?? 'DataLayer';
    setBuilderView({ kind: 'variable', entity, typeLabel: VARIABLE_TYPE_LABELS[defaultType] });
    onBuilderOpen?.();
  };

  const closeBuilder = () => setBuilderView({ kind: 'none' });

  const handleSaveTag = (tag: Tag) => {
    if (builderView.kind === 'tag' && builderView.entity) updateTag(tag.id, tag);
    else addTag(tag);
    closeBuilder();
  };

  const handleSaveTrigger = (trigger: Trigger) => {
    if (builderView.kind === 'trigger' && builderView.entity) updateTrigger(trigger.id, trigger);
    else addTrigger(trigger);
    closeBuilder();
  };

  const handleSaveVariable = (variable: Variable) => {
    if (builderView.kind === 'variable' && builderView.entity) updateVariable(variable.id, variable);
    else addVariable(variable);
    closeBuilder();
  };

  const inBuilder = builderView.kind !== 'none';

  const sectionLabel =
    builderView.kind === 'tag'
      ? 'Tags'
      : builderView.kind === 'trigger'
      ? 'Triggers'
      : builderView.kind === 'variable'
      ? 'Variables'
      : '';

  const actionLabel =
    builderView.kind === 'none'
      ? ''
      : builderView.entity
      ? `Edit ${builderView.kind === 'tag' ? 'Tag' : builderView.kind === 'trigger' ? 'Trigger' : 'Variable'}`
      : `New ${builderView.kind === 'tag' ? 'Tag' : builderView.kind === 'trigger' ? 'Trigger' : 'Variable'}`;

  const typeLabel = builderView.kind !== 'none' ? builderView.typeLabel : '';

  return (
    <div className="flex flex-col h-full" style={{ background: '#ffffff', borderTop: '1px solid #c9c5be' }}>
      {/* ── Header bar ── */}
      <div
        className="shrink-0 flex items-center gap-2 px-4 py-2"
        style={{ background: '#1a1d24', borderBottom: '1px solid #2e3340' }}
      >
        {inBuilder ? (
          // Breadcrumb header
          <>
            <button
              type="button"
              onClick={closeBuilder}
              className="flex items-center shrink-0 hover:text-white transition-colors"
              style={{ color: '#9ca3af' }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5 text-xs min-w-0">
              <button
                type="button"
                onClick={closeBuilder}
                className="hover:text-white transition-colors shrink-0"
                style={{ color: '#9ca3af' }}
              >
                {sectionLabel}
              </button>
              <span style={{ color: '#4b5563' }}>›</span>
              <span className="shrink-0" style={{ color: '#e5e7eb' }}>
                {actionLabel}
              </span>
              {typeLabel && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                  style={{ background: '#2e3340', color: '#93c5fd', border: '1px solid #374151' }}
                >
                  {typeLabel}
                </span>
              )}
            </div>
            <button
              type="submit"
              form={FORM_ID}
              className="ml-auto shrink-0 text-xs px-3 py-1 rounded font-semibold transition-colors"
              style={{ background: '#4f5b8a', color: '#ffffff' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#3f4b7a')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#4f5b8a')}
            >
              Save
            </button>
          </>
        ) : (
          // List header
          <>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: '#5b8a5b' }} />
            <span className="text-sm font-semibold text-white">Simulator Workspace</span>

            <div className="flex items-center gap-1.5 ml-1">
              <span
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm"
                style={{ color: '#9ca3af', border: '1px solid #374151' }}
              >
                <TagIcon className="h-3 w-3" />
                Tags {tags.length}
              </span>
              <span
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm"
                style={{ color: '#9ca3af', border: '1px solid #374151' }}
              >
                <Zap className="h-3 w-3" />
                Triggers {triggers.length}
              </span>
              <span
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm"
                style={{ color: '#9ca3af', border: '1px solid #374151' }}
              >
                <VarIcon className="h-3 w-3" />
                Variables {variables.length}
              </span>
            </div>

            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="ml-auto flex items-center gap-1 text-xs hover:text-white transition-colors"
                style={{ color: '#9ca3af' }}
              >
                {collapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {collapsed ? 'expand' : 'collapse'}
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Body ── */}
      {inBuilder ? (
        // Builder mode — inline form
        <div className="flex-1 overflow-y-auto min-h-0 bg-white">
          {builderView.kind === 'tag' && (
            <TagForm
              formId={FORM_ID}
              triggers={triggers}
              tags={tags}
              existingTag={builderView.entity ?? undefined}
              onSave={handleSaveTag}
              onTypeChange={(type) =>
                setBuilderView((prev) =>
                  prev.kind === 'none' ? prev : { ...prev, typeLabel: TAG_TYPE_LABELS[type] }
                )
              }
            />
          )}
          {builderView.kind === 'trigger' && (
            <TriggerForm
              formId={FORM_ID}
              existingTrigger={builderView.entity ?? undefined}
              onSave={handleSaveTrigger}
              onTypeChange={(type) =>
                setBuilderView((prev) =>
                  prev.kind === 'none' ? prev : { ...prev, typeLabel: TRIGGER_TYPE_LABELS[type] }
                )
              }
            />
          )}
          {builderView.kind === 'variable' && (
            <VariableForm
              formId={FORM_ID}
              existingVariable={builderView.entity ?? undefined}
              onSave={handleSaveVariable}
              onTypeChange={(type) =>
                setBuilderView((prev) =>
                  prev.kind === 'none' ? prev : { ...prev, typeLabel: VARIABLE_TYPE_LABELS[type] }
                )
              }
            />
          )}
        </div>
      ) : !collapsed ? (
        // List mode — three-column layout
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* ── Tags column ── */}
          <div
            className="flex-1 flex flex-col overflow-hidden"
            style={{ borderRight: '1px solid #e6e2db' }}
          >
            <div
              className="shrink-0 flex items-center justify-between px-3 py-2"
              style={{ background: '#faf8f4', borderBottom: '1px solid #e6e2db' }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#5b8a5b' }} />
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#6b7280' }}
                >
                  Tags ({tags.length})
                </span>
              </div>
              <button
                onClick={() => openTagBuilder(null)}
                className="flex items-center gap-0.5 text-xs font-medium hover:underline"
                style={{ color: '#4f5b8a' }}
              >
                <Plus className="h-3 w-3" /> NEW
              </button>
            </div>
            <ScrollArea className="flex-1">
              {tags.length === 0 ? (
                <div className="p-4 text-center">
                  <TagIcon
                    className="h-6 w-6 mx-auto mb-1.5 opacity-20"
                    style={{ color: '#6b7280' }}
                  />
                  <p className="text-xs italic" style={{ color: '#a39d94' }}>
                    No tags yet
                  </p>
                </div>
              ) : (
                <div>
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center gap-2 px-3 py-2 group cursor-default"
                      style={{ borderBottom: '1px solid #e6e2db' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#faf8f4')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: '#5b8a5b' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-xs font-medium truncate"
                          style={{ color: '#1a1d24' }}
                        >
                          {tag.name}
                        </div>
                        <div className="text-xs" style={{ color: '#6b7280' }}>
                          {TAG_TYPE_SHORT[tag.type] || tag.type}
                        </div>
                      </div>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => openTagBuilder(tag)}
                        >
                          <Pencil className="h-2.5 w-2.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          style={{ color: '#b85a5a' }}
                          onClick={() => deleteTag(tag.id)}
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* ── Triggers column ── */}
          <div
            className="flex-1 flex flex-col overflow-hidden"
            style={{ borderRight: '1px solid #e6e2db' }}
          >
            <div
              className="shrink-0 flex items-center justify-between px-3 py-2"
              style={{ background: '#faf8f4', borderBottom: '1px solid #e6e2db' }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#5b8a5b' }} />
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#6b7280' }}
                >
                  Triggers ({triggers.length})
                </span>
              </div>
              <button
                onClick={() => openTriggerBuilder(null)}
                className="flex items-center gap-0.5 text-xs font-medium hover:underline"
                style={{ color: '#4f5b8a' }}
              >
                <Plus className="h-3 w-3" /> NEW
              </button>
            </div>
            <ScrollArea className="flex-1">
              {triggers.length === 0 ? (
                <div className="p-4 text-center">
                  <Zap
                    className="h-6 w-6 mx-auto mb-1.5 opacity-20"
                    style={{ color: '#6b7280' }}
                  />
                  <p className="text-xs italic" style={{ color: '#a39d94' }}>
                    No triggers yet
                  </p>
                </div>
              ) : (
                <div>
                  {triggers.map((trigger) => {
                    const summary =
                      trigger.type === 'CustomEvent' && trigger.customEventName
                        ? `Event: ${trigger.customEventName}`
                        : trigger.conditions.length === 0
                        ? 'All pages'
                        : `${trigger.conditions.length} condition${trigger.conditions.length > 1 ? 's' : ''}`;
                    return (
                      <div
                        key={trigger.id}
                        className="flex items-center gap-2 px-3 py-2 group cursor-default"
                        style={{ borderBottom: '1px solid #e6e2db' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#faf8f4')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: '#5b8a5b' }}
                        />
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-xs font-medium truncate"
                            style={{ color: '#1a1d24' }}
                          >
                            {trigger.name}
                          </div>
                          <div className="text-xs" style={{ color: '#6b7280' }}>
                            {TRIGGER_TYPE_SHORT[trigger.type] || trigger.type} · {summary}
                          </div>
                        </div>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => openTriggerBuilder(trigger)}
                          >
                            <Pencil className="h-2.5 w-2.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            style={{ color: '#b85a5a' }}
                            onClick={() => deleteTrigger(trigger.id)}
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* ── Variables column ── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div
              className="shrink-0 flex items-center justify-between px-3 py-2"
              style={{ background: '#faf8f4', borderBottom: '1px solid #e6e2db' }}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: variables.length > 0 ? '#5b8a5b' : '#c9c5be' }}
                />
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#6b7280' }}
                >
                  Variables ({variables.length})
                </span>
              </div>
              <button
                onClick={() => openVariableBuilder(null)}
                className="flex items-center gap-0.5 text-xs font-medium hover:underline"
                style={{ color: '#4f5b8a' }}
              >
                <Plus className="h-3 w-3" /> NEW
              </button>
            </div>
            <ScrollArea className="flex-1">
              {variables.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-xs font-mono" style={{ color: '#c9c5be' }}>
                    no variables set
                  </p>
                </div>
              ) : (
                <div>
                  {variables.map((variable) => (
                    <div
                      key={variable.id}
                      className="flex items-center gap-2 px-3 py-2 group cursor-default"
                      style={{ borderBottom: '1px solid #e6e2db' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#faf8f4')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: '#4f5b8a' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-xs font-medium truncate"
                          style={{ color: '#1a1d24' }}
                        >
                          {variable.name}
                        </div>
                        <div className="text-xs" style={{ color: '#6b7280' }}>
                          {VARIABLE_TYPE_SHORT[variable.type] || variable.type}
                          {variableSummary(variable) ? ` · ${variableSummary(variable)}` : ''}
                        </div>
                      </div>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => openVariableBuilder(variable)}
                        >
                          <Pencil className="h-2.5 w-2.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          style={{ color: '#b85a5a' }}
                          onClick={() => deleteVariable(variable.id)}
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      ) : null}
    </div>
  );
}

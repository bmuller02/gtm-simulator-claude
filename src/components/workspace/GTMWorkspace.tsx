'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tag, Trigger, Variable, GA4ConfigurationConfig, GA4EventConfig, GoogleAdsConversionConfig, DataLayerVariableConfig, DOMElementVariableConfig, ConstantVariableConfig } from '@/lib/types/gtm';
import { useWorkspaceStore } from '@/lib/store/workspaceStore';
import { TagForm } from './TagForm';
import { TriggerForm } from './TriggerForm';
import { VariableForm } from './VariableForm';
import { Plus, Tag as TagIcon, Zap, Variable as VarIcon, Pencil, Trash2, ChevronRight } from 'lucide-react';

const TAG_TYPE_SHORT: Record<string, string> = {
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

type ModalState =
  | { mode: 'none' }
  | { mode: 'addTag' }
  | { mode: 'editTag'; tag: Tag }
  | { mode: 'addTrigger' }
  | { mode: 'editTrigger'; trigger: Trigger }
  | { mode: 'addVariable' }
  | { mode: 'editVariable'; variable: Variable };

function tagSummary(tag: Tag, triggers: Trigger[]): string {
  const trigger = triggers.find((t) => t.id === tag.firingTriggerId);
  return trigger ? `Fires on: ${trigger.name}` : 'No trigger assigned';
}

function triggerSummary(trigger: Trigger): string {
  if (trigger.type === 'CustomEvent' && trigger.customEventName) {
    return `Event: ${trigger.customEventName}`;
  }
  if (trigger.conditions.length === 0) return 'All conditions';
  return `${trigger.conditions.length} condition${trigger.conditions.length > 1 ? 's' : ''}`;
}

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

export function GTMWorkspace() {
  const { tags, triggers, variables, addTag, updateTag, deleteTag, addTrigger, updateTrigger, deleteTrigger, addVariable, updateVariable, deleteVariable } = useWorkspaceStore();
  const [modal, setModal] = useState<ModalState>({ mode: 'none' });

  const closeModal = () => setModal({ mode: 'none' });

  const handleSaveTag = (tag: Tag) => {
    if (modal.mode === 'editTag') {
      updateTag(tag.id, tag);
    } else {
      addTag(tag);
    }
    closeModal();
  };

  const handleSaveTrigger = (trigger: Trigger) => {
    if (modal.mode === 'editTrigger') {
      updateTrigger(trigger.id, trigger);
    } else {
      addTrigger(trigger);
    }
    closeModal();
  };

  const handleSaveVariable = (variable: Variable) => {
    if (modal.mode === 'editVariable') {
      updateVariable(variable.id, variable);
    } else {
      addVariable(variable);
    }
    closeModal();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* GTM Header */}
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-400" />
        <span className="text-sm font-medium">GTM Workspace</span>
        <span className="text-xs text-gray-400 ml-1">— Simulator</span>
      </div>

      <Tabs defaultValue="tags" className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b bg-gray-50 px-2">
          <TabsList className="h-9 bg-transparent gap-0">
            <TabsTrigger value="tags" className="text-xs gap-1 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-3">
              <TagIcon className="h-3 w-3" />
              Tags
              {tags.length > 0 && <Badge variant="secondary" className="ml-1 text-xs px-1 py-0 h-4">{tags.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="triggers" className="text-xs gap-1 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-3">
              <Zap className="h-3 w-3" />
              Triggers
              {triggers.length > 0 && <Badge variant="secondary" className="ml-1 text-xs px-1 py-0 h-4">{triggers.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="variables" className="text-xs gap-1 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-3">
              <VarIcon className="h-3 w-3" />
              Variables
              {variables.length > 0 && <Badge variant="secondary" className="ml-1 text-xs px-1 py-0 h-4">{variables.length}</Badge>}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tags Panel */}
        <TabsContent value="tags" className="flex-1 flex flex-col overflow-hidden mt-0">
          <div className="p-3 border-b flex justify-between items-center bg-white">
            <span className="text-xs text-muted-foreground">{tags.length} tag{tags.length !== 1 ? 's' : ''}</span>
            <Button size="sm" onClick={() => setModal({ mode: 'addTag' })} className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-3 w-3 mr-1" /> New Tag
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {tags.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <TagIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No tags yet</p>
                  <p className="text-xs mt-1">Click &quot;New Tag&quot; to add your first tag</p>
                </div>
              ) : (
                tags.map((tag) => (
                  <div key={tag.id} className="px-3 py-2.5 hover:bg-gray-50 flex items-center gap-2 group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{tag.name}</span>
                        <Badge variant="outline" className="text-xs shrink-0 font-normal">
                          {TAG_TYPE_SHORT[tag.type] || tag.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{tagSummary(tag, triggers)}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setModal({ mode: 'editTag', tag })}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => deleteTag(tag.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Triggers Panel */}
        <TabsContent value="triggers" className="flex-1 flex flex-col overflow-hidden mt-0">
          <div className="p-3 border-b flex justify-between items-center bg-white">
            <span className="text-xs text-muted-foreground">{triggers.length} trigger{triggers.length !== 1 ? 's' : ''}</span>
            <Button size="sm" onClick={() => setModal({ mode: 'addTrigger' })} className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-3 w-3 mr-1" /> New Trigger
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {triggers.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Zap className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No triggers yet</p>
                  <p className="text-xs mt-1">Triggers control when your tags fire</p>
                </div>
              ) : (
                triggers.map((trigger) => (
                  <div key={trigger.id} className="px-3 py-2.5 hover:bg-gray-50 flex items-center gap-2 group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{trigger.name}</span>
                        <Badge variant="outline" className="text-xs shrink-0 font-normal">
                          {TRIGGER_TYPE_SHORT[trigger.type] || trigger.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{triggerSummary(trigger)}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setModal({ mode: 'editTrigger', trigger })}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => deleteTrigger(trigger.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Variables Panel */}
        <TabsContent value="variables" className="flex-1 flex flex-col overflow-hidden mt-0">
          <div className="p-3 border-b flex justify-between items-center bg-white">
            <span className="text-xs text-muted-foreground">{variables.length} variable{variables.length !== 1 ? 's' : ''}</span>
            <Button size="sm" onClick={() => setModal({ mode: 'addVariable' })} className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-3 w-3 mr-1" /> New Variable
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {variables.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <VarIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No variables yet</p>
                  <p className="text-xs mt-1">Variables let you capture dynamic values</p>
                </div>
              ) : (
                variables.map((variable) => (
                  <div key={variable.id} className="px-3 py-2.5 hover:bg-gray-50 flex items-center gap-2 group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{variable.name}</span>
                        <Badge variant="outline" className="text-xs shrink-0 font-normal">
                          {VARIABLE_TYPE_SHORT[variable.type] || variable.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{variableSummary(variable)}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setModal({ mode: 'editVariable', variable })}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => deleteVariable(variable.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <Dialog open={modal.mode !== 'none'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modal.mode === 'addTag' && 'New Tag'}
              {modal.mode === 'editTag' && 'Edit Tag'}
              {modal.mode === 'addTrigger' && 'New Trigger'}
              {modal.mode === 'editTrigger' && 'Edit Trigger'}
              {modal.mode === 'addVariable' && 'New Variable'}
              {modal.mode === 'editVariable' && 'Edit Variable'}
            </DialogTitle>
          </DialogHeader>
          {(modal.mode === 'addTag' || modal.mode === 'editTag') && (
            <TagForm
              triggers={triggers}
              existingTag={modal.mode === 'editTag' ? modal.tag : undefined}
              onSave={handleSaveTag}
              onCancel={closeModal}
            />
          )}
          {(modal.mode === 'addTrigger' || modal.mode === 'editTrigger') && (
            <TriggerForm
              existingTrigger={modal.mode === 'editTrigger' ? modal.trigger : undefined}
              onSave={handleSaveTrigger}
              onCancel={closeModal}
            />
          )}
          {(modal.mode === 'addVariable' || modal.mode === 'editVariable') && (
            <VariableForm
              existingVariable={modal.mode === 'editVariable' ? modal.variable : undefined}
              onSave={handleSaveVariable}
              onCancel={closeModal}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

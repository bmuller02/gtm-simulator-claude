import { WorkspaceState, Tag, Trigger, Variable, TagType, TriggerType, VariableType, ConditionOperator, TriggerCondition, GA4ConfigurationConfig, GA4EventConfig, DataLayerVariableConfig, DOMElementVariableConfig } from '@/lib/types/gtm';
import { ValidationResult, ValidationCriterion } from '@/lib/types/challenge';

// ─── Core validation runner ───────────────────────────────────────────────────

export function validateWorkspace(
  workspace: WorkspaceState,
  criteria: ValidationCriterion[]
): ValidationResult {
  const feedback = criteria.map((criterion) => ({
    criterionId: criterion.id,
    description: criterion.description,
    passed: criterion.check(workspace),
    message: criterion.check(workspace)
      ? `✓ ${criterion.description}`
      : criterion.failureMessage,
  }));

  const passedCount = feedback.filter((f) => f.passed).length;

  return {
    passed: passedCount === criteria.length,
    score: Math.round((passedCount / criteria.length) * 100),
    passedCount,
    totalCount: criteria.length,
    feedback,
  };
}

// ─── Tag helpers ──────────────────────────────────────────────────────────────

export function findTagByType(workspace: WorkspaceState, type: TagType): Tag | undefined {
  return workspace.tags.find((t) => t.type === type);
}

export function findTagsByType(workspace: WorkspaceState, type: TagType): Tag[] {
  return workspace.tags.filter((t) => t.type === type);
}

export function tagExists(workspace: WorkspaceState, type: TagType): boolean {
  return workspace.tags.some((t) => t.type === type);
}

export function tagHasTrigger(tag: Tag, triggerId: string): boolean {
  return tag.firingTriggerId === triggerId;
}

// ─── Trigger helpers ─────────────────────────────────────────────────────────

export function findTriggerByType(workspace: WorkspaceState, type: TriggerType): Trigger | undefined {
  return workspace.triggers.find((t) => t.type === type);
}

export function findTriggersByType(workspace: WorkspaceState, type: TriggerType): Trigger[] {
  return workspace.triggers.filter((t) => t.type === type);
}

export function triggerExists(workspace: WorkspaceState, type: TriggerType): boolean {
  return workspace.triggers.some((t) => t.type === type);
}

export function triggerHasCondition(
  trigger: Trigger,
  variableName: string,
  operator: ConditionOperator,
  value: string
): boolean {
  return trigger.conditions.some(
    (c) =>
      c.variable.toLowerCase().includes(variableName.toLowerCase()) &&
      c.operator === operator &&
      c.value.toLowerCase() === value.toLowerCase()
  );
}

export function triggerHasAnyCondition(trigger: Trigger, variableName: string): boolean {
  return trigger.conditions.some((c) =>
    c.variable.toLowerCase().includes(variableName.toLowerCase())
  );
}

// ─── Variable helpers ─────────────────────────────────────────────────────────

export function findVariableByType(workspace: WorkspaceState, type: VariableType): Variable | undefined {
  return workspace.variables.find((v) => v.type === type);
}

export function variableExists(workspace: WorkspaceState, type: VariableType): boolean {
  return workspace.variables.some((v) => v.type === type);
}

export function findDataLayerVariable(workspace: WorkspaceState, keyName: string): Variable | undefined {
  return workspace.variables.find(
    (v) =>
      v.type === 'DataLayer' &&
      (v.config as DataLayerVariableConfig).dataLayerVariableName
        .toLowerCase()
        .includes(keyName.toLowerCase())
  );
}

export function findDOMVariable(workspace: WorkspaceState, selector: string): Variable | undefined {
  return workspace.variables.find(
    (v) =>
      v.type === 'DOMElement' &&
      (v.config as DOMElementVariableConfig).cssSelector
        .toLowerCase()
        .includes(selector.toLowerCase())
  );
}

// ─── GA4 specific helpers ─────────────────────────────────────────────────────

export function getGA4Config(workspace: WorkspaceState): GA4ConfigurationConfig | undefined {
  const tag = findTagByType(workspace, 'GA4Configuration');
  if (!tag) return undefined;
  return tag.config as GA4ConfigurationConfig;
}

export function getGA4EventTags(workspace: WorkspaceState): Tag[] {
  return workspace.tags.filter((t) => t.type === 'GA4Event');
}

export function ga4EventTagWithName(workspace: WorkspaceState, eventName: string): Tag | undefined {
  return workspace.tags.find(
    (t) =>
      t.type === 'GA4Event' &&
      (t.config as GA4EventConfig).eventName.toLowerCase() === eventName.toLowerCase()
  );
}

export function ga4EventTagHasCustomDimension(tag: Tag, dimKey: string): boolean {
  const config = tag.config as GA4EventConfig;
  if (!config.customDimensions) return false;
  return Object.keys(config.customDimensions).some(
    (k) => k.toLowerCase() === dimKey.toLowerCase()
  );
}

// ─── Tag linked to trigger helper ─────────────────────────────────────────────

export function tagLinkedToTriggerType(workspace: WorkspaceState, tagType: TagType, triggerType: TriggerType): boolean {
  const tags = findTagsByType(workspace, tagType);
  if (tags.length === 0) return false;
  return tags.some((tag) => {
    const trigger = workspace.triggers.find((t) => t.id === tag.firingTriggerId);
    return trigger?.type === triggerType;
  });
}

export function anyTagLinkedToTrigger(workspace: WorkspaceState, triggerId: string): boolean {
  return workspace.tags.some((t) => t.firingTriggerId === triggerId);
}

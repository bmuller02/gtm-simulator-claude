// ============ TAG TYPES ============

export type TagType =
  | 'GA4Configuration'
  | 'GA4Event'
  | 'GoogleAdsConversion'
  | 'ConversionLinker'
  | 'CustomHTML';

export interface Tag {
  id: string;
  name: string;
  type: TagType;
  enabled: boolean;
  firingTriggerId: string; // trigger ID that fires this tag
  blockingTriggerId?: string; // trigger that prevents firing
  config: TagConfig;
}

export interface GA4ConfigurationConfig {
  measurementId: string; // e.g. "G-XXXXXXXX"
  sendPageView?: boolean;
  cookieDomain?: string;
  crossDomainDomains?: string; // comma-separated
}

export interface GA4EventConfig {
  measurementId?: string; // optional override
  eventName: string;
  customDimensions?: Record<string, string>; // param key -> variable reference or value
}

export interface GoogleAdsConversionConfig {
  conversionId: string;
  conversionLabel: string;
  value?: string;
  currency?: string;
  firingPriority?: number;
}

export interface ConversionLinkerConfig {
  enableCrossDomain?: boolean;
}

export interface CustomHTMLConfig {
  html: string;
}

export type TagConfig =
  | GA4ConfigurationConfig
  | GA4EventConfig
  | GoogleAdsConversionConfig
  | ConversionLinkerConfig
  | CustomHTMLConfig;

// ============ TRIGGER TYPES ============

export type TriggerType =
  | 'PageView'
  | 'Click'
  | 'FormSubmission'
  | 'CustomEvent';

export type ConditionOperator =
  | 'equals'
  | 'doesNotEqual'
  | 'contains'
  | 'doesNotContain'
  | 'startsWith'
  | 'matchesRegex'
  | 'greaterThan'
  | 'lessThan';

export interface TriggerCondition {
  variable: string; // e.g. "Page URL", "Click Element", "dlv_userType"
  operator: ConditionOperator;
  value: string;
}

export interface Trigger {
  id: string;
  name: string;
  type: TriggerType;
  conditions: TriggerCondition[];
  enabled: boolean;
  customEventName?: string; // only for CustomEvent type
}

// ============ VARIABLE TYPES ============

export type VariableType =
  | 'DataLayer'
  | 'DOMElement'
  | 'JavaScriptVariable'
  | 'Constant'
  | 'Cookie';

export interface Variable {
  id: string;
  name: string;
  type: VariableType;
  enabled: boolean;
  config: VariableConfig;
}

export interface DataLayerVariableConfig {
  dataLayerVariableName: string;
  defaultValue?: string;
}

export interface DOMElementVariableConfig {
  cssSelector: string;
  attributeName: string; // 'value', 'href', 'text', 'data-id', etc.
}

export interface JavaScriptVariableConfig {
  javaScriptVariableName: string; // e.g. "window.myVar"
}

export interface ConstantVariableConfig {
  value: string;
}

export interface CookieVariableConfig {
  cookieName: string;
}

export type VariableConfig =
  | DataLayerVariableConfig
  | DOMElementVariableConfig
  | JavaScriptVariableConfig
  | ConstantVariableConfig
  | CookieVariableConfig;

// ============ WORKSPACE ============

export interface WorkspaceState {
  tags: Tag[];
  triggers: Trigger[];
  variables: Variable[];
}

export const emptyWorkspace: WorkspaceState = {
  tags: [],
  triggers: [],
  variables: [],
};

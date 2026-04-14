import { ChallengeDefinition } from '@/lib/types/challenge';
import { WorkspaceState, DataLayerVariableConfig, GA4EventConfig, Tag, Trigger } from '@/lib/types/gtm';
import {
  tagExists, triggerExists, variableExists, ga4EventTagWithName,
  tagLinkedToTriggerType, findTagByType, findTriggerByType,
  findDataLayerVariable, ga4EventTagHasCustomDimension, findTagsByType, findTriggersByType
} from '@/lib/validation/engine';

export const level3Challenges: ChallengeDefinition[] = [
  // ─── Challenge 3-1: Consent Mode Setup ───────────────────────────────────
  {
    id: '3-1',
    level: 3,
    index: 1,
    title: 'Implement Consent Mode',
    scenario:
      "A European e-commerce brand must comply with GDPR. Their cookie consent banner sets data layer variables `analytics_consent` and `ads_consent` to either `'granted'` or `'denied'`. You need to make GA4 and Google Ads tags only fire when the appropriate consent has been granted.",
    instructions: `## Your Task
Implement consent-based tag firing:

1. **Create two Data Layer Variables**
   - Variable 1 — Variable Name (display name): *"dlv_analytics_consent"*, **Data Layer Variable Name** field: \`analytics_consent\`, leave Default Value blank
   - Variable 2 — Variable Name (display name): *"dlv_ads_consent"*, **Data Layer Variable Name** field: \`ads_consent\`, leave Default Value blank
   - The display names must match exactly what you select in trigger conditions below

2. **Create a consent-gated Page View trigger for GA4**
   - Type: **Page View**
   - Name: *"Page View - Analytics Consent"*
   - Add a condition: **dlv_analytics_consent** → **equals** → \`granted\`

3. **Create a consent-gated Page View trigger for Ads**
   - Type: **Page View**
   - Name: *"Page View - Ads Consent"*
   - Add a condition: **dlv_ads_consent** → **equals** → \`granted\`

4. **Create a GA4 Configuration tag**
   - Measurement ID: \`G-CONSENT99\`
   - Link it to your *"Page View - Analytics Consent"* trigger

5. **Create a Google Ads Conversion tag**
   - Conversion ID: \`AW-CONSENT99\`
   - Conversion Label field: leave blank (optional)
   - Link it to your *"Page View - Ads Consent"* trigger`,
    objectives: [
      'Create Data Layer Variables for analytics_consent and ads_consent',
      'Create a Page View trigger gated on analytics_consent = "granted"',
      'Create a Page View trigger gated on ads_consent = "granted"',
      'Link GA4 to analytics consent trigger and Google Ads to ads consent trigger',
    ],
    mockWebsite: 'cookieBanner',
    hints: [
      'Consent Mode ensures you only fire tags when the user has given permission.',
      'Create separate triggers for each consent category — analytics and advertising.',
      'Both triggers are Page View type but with different conditions.',
    ],
    successCriteria: [
      {
        id: '3-1-a',
        description: 'A Data Layer Variable for "analytics_consent" exists',
        check: (ws: WorkspaceState) => {
          return ws.variables.some(
            (v) =>
              v.type === 'DataLayer' &&
              (v.config as DataLayerVariableConfig).dataLayerVariableName
                .toLowerCase()
                .includes('analytics_consent')
          );
        },
        failureMessage:
          "No Data Layer Variable for 'analytics_consent' found. Create one with variable name 'analytics_consent'.",
      },
      {
        id: '3-1-b',
        description: 'A Data Layer Variable for "ads_consent" exists',
        check: (ws: WorkspaceState) => {
          return ws.variables.some(
            (v) =>
              v.type === 'DataLayer' &&
              (v.config as DataLayerVariableConfig).dataLayerVariableName
                .toLowerCase()
                .includes('ads_consent')
          );
        },
        failureMessage:
          "No Data Layer Variable for 'ads_consent' found. Create one with variable name 'ads_consent'.",
      },
      {
        id: '3-1-c',
        description: 'A Page View trigger gated on analytics consent exists',
        check: (ws: WorkspaceState) => {
          return ws.triggers.some(
            (t) =>
              t.type === 'PageView' &&
              t.conditions.some(
                (c) =>
                  c.variable.toLowerCase().includes('analytics') &&
                  c.operator === 'equals' &&
                  c.value.toLowerCase() === 'granted'
              )
          );
        },
        failureMessage:
          "No Page View trigger gated on analytics consent found. Create one with condition: [analytics_consent variable] → equals → granted",
      },
      {
        id: '3-1-d',
        description: 'A Page View trigger gated on ads consent exists',
        check: (ws: WorkspaceState) => {
          return ws.triggers.some(
            (t) =>
              t.type === 'PageView' &&
              t.conditions.some(
                (c) =>
                  c.variable.toLowerCase().includes('ads') &&
                  c.operator === 'equals' &&
                  c.value.toLowerCase() === 'granted'
              )
          );
        },
        failureMessage:
          "No Page View trigger gated on ads consent found. Create one with condition: [ads_consent variable] → equals → granted",
      },
      {
        id: '3-1-e',
        description: 'GA4 Configuration tag linked to analytics consent trigger',
        check: (ws: WorkspaceState) => {
          const ga4 = findTagByType(ws, 'GA4Configuration');
          if (!ga4) return false;
          const trigger = ws.triggers.find((t) => t.id === ga4.firingTriggerId);
          if (!trigger) return false;
          return trigger.conditions.some(
            (c) =>
              c.variable.toLowerCase().includes('analytics') &&
              c.operator === 'equals' &&
              c.value.toLowerCase() === 'granted'
          );
        },
        failureMessage:
          "Your GA4 tag is not linked to the analytics consent trigger. Make sure it fires only when analytics_consent = 'granted'.",
      },
      {
        id: '3-1-f',
        description: 'Google Ads Conversion tag linked to ads consent trigger',
        check: (ws: WorkspaceState) => {
          const adsTag = findTagByType(ws, 'GoogleAdsConversion');
          if (!adsTag) return false;
          const trigger = ws.triggers.find((t) => t.id === adsTag.firingTriggerId);
          if (!trigger) return false;
          return trigger.conditions.some(
            (c) =>
              c.variable.toLowerCase().includes('ads') &&
              c.operator === 'equals' &&
              c.value.toLowerCase() === 'granted'
          );
        },
        failureMessage:
          "Your Google Ads tag is not linked to the ads consent trigger. Make sure it fires only when ads_consent = 'granted'.",
      },
    ],
  },

  // ─── Challenge 3-2: Debug a Broken Setup ─────────────────────────────────
  {
    id: '3-2',
    level: 3,
    index: 2,
    title: 'Debug a Broken Tag Setup',
    scenario:
      "A client's GTM container has been set up by a previous contractor, but no data is appearing in GA4. Two bugs have been planted in the workspace. Your job is to find and fix them: (1) the GA4 event tag has a typo in its trigger condition variable name, and (2) the custom event trigger is listening for the wrong event name.",
    instructions: `## Your Task
Find and fix the two bugs in this pre-loaded workspace:

**Bug #1 — Wrong variable name**
- Look at the Page View trigger conditions
- The condition references \`dlv_usr_Type\` but the data layer actually uses \`userType\`
- Fix: change the condition variable to reference \`userType\`

**Bug #2 — Wrong custom event name**
- Look at the Custom Event trigger
- It's listening for event name \`Purchase\` (capital P) but the site fires \`purchase\` (lowercase)
- Fix: change the event name to \`purchase\` (all lowercase)

Inspect each trigger carefully and correct the mistakes.`,
    objectives: [
      'Fix the Page View trigger: correct the variable name from "dlv_usr_Type" to reference "userType"',
      'Fix the Custom Event trigger: change event name from "Purchase" to "purchase"',
    ],
    mockWebsite: 'ecommerce',
    preloadedWorkspace: {
      tags: [
        {
          id: 'preloaded-tag-1',
          name: 'GA4 - Configuration',
          type: 'GA4Configuration',
          enabled: true,
          firingTriggerId: 'preloaded-trigger-1',
          config: { measurementId: 'G-BROKEN123', sendPageView: true },
        },
        {
          id: 'preloaded-tag-2',
          name: 'GA4 - Purchase Event',
          type: 'GA4Event',
          enabled: true,
          firingTriggerId: 'preloaded-trigger-2',
          config: { eventName: 'purchase', customDimensions: { value: '{{dlv_transactionRevenue}}' } },
        },
      ],
      triggers: [
        {
          id: 'preloaded-trigger-1',
          name: 'Page View - Exclude Internal',
          type: 'PageView',
          enabled: true,
          // BUG 1: wrong variable name "dlv_usr_Type" instead of "userType"
          conditions: [
            { variable: 'dlv_usr_Type', operator: 'doesNotEqual', value: 'internal' },
          ],
        },
        {
          id: 'preloaded-trigger-2',
          name: 'Custom Event - Purchase',
          type: 'CustomEvent',
          enabled: true,
          conditions: [],
          // BUG 2: wrong event name "Purchase" (capital P) instead of "purchase"
          customEventName: 'Purchase',
        },
      ],
      variables: [
        {
          id: 'preloaded-var-1',
          name: 'dlv_userType',
          type: 'DataLayer',
          enabled: true,
          config: { dataLayerVariableName: 'userType' },
        },
        {
          id: 'preloaded-var-2',
          name: 'dlv_transactionRevenue',
          type: 'DataLayer',
          enabled: true,
          config: { dataLayerVariableName: 'transactionRevenue' },
        },
      ],
    },
    hints: [
      'Open each trigger by clicking on it. Examine the conditions carefully.',
      'GTM variable names and event names are case-sensitive. "Purchase" ≠ "purchase".',
      'The variable in a trigger condition must match the name of an existing variable in your Variables panel.',
    ],
    successCriteria: [
      {
        id: '3-2-a',
        description: 'Page View trigger references "userType" (not "dlv_usr_Type")',
        check: (ws: WorkspaceState) => {
          const trigger = ws.triggers.find((t) => t.type === 'PageView');
          if (!trigger) return false;
          return trigger.conditions.some(
            (c) =>
              !c.variable.toLowerCase().includes('usr_type') &&
              (c.variable.toLowerCase().includes('usertype') ||
                c.variable.toLowerCase().includes('user_type'))
          );
        },
        failureMessage:
          "The Page View trigger still has the wrong variable name. Change the condition variable from 'dlv_usr_Type' to reference your 'userType' variable.",
      },
      {
        id: '3-2-b',
        description: 'Custom Event trigger listens for "purchase" (lowercase)',
        check: (ws: WorkspaceState) => {
          const trigger = ws.triggers.find((t) => t.type === 'CustomEvent');
          if (!trigger) return false;
          return trigger.customEventName === 'purchase';
        },
        failureMessage:
          "The Custom Event trigger still has 'Purchase' (capital P). Change it to 'purchase' (all lowercase) to match what the website actually fires.",
      },
    ],
  },

  // ─── Challenge 3-3: Multi-Channel Attribution ─────────────────────────────
  {
    id: '3-3',
    level: 3,
    index: 3,
    title: 'Build Multi-Channel Attribution Tracking',
    scenario:
      "A performance marketing agency manages campaigns across paid search, social media, and email. Their client wants to understand which channels drive conversions. You need to track interactions from each channel and capture the channel name as a custom dimension on all events.",
    instructions: `## Your Task
Set up multi-channel event tracking across 3 sources:

1. **Create a Data Layer Variable** for the channel
   - Variable Name (display name): *"dlv_channel"*
   - **Data Layer Variable Name** field: \`channel\`
   - Leave Default Value blank
   - Devs push this with every interaction (e.g. \`{ channel: 'paid_search' }\`)

2. **Create 3 Custom Event Triggers** (one per channel)
   - Trigger A — Name: *"Custom Event - Paid Search"*, **Custom Event Name** field: \`paid_search_click\`
   - Trigger B — Name: *"Custom Event - Social"*, **Custom Event Name** field: \`social_click\`
   - Trigger C — Name: *"Custom Event - Email"*, **Custom Event Name** field: \`email_click\`

3. **Create a GA4 Event Tag for channel interactions**
   - Event name: \`channel_interaction\`
   - Add a custom dimension: key \`channel\`, value → \`dlv_channel\`
   - Set Firing Trigger to any one of your three channel triggers (we validate all three triggers exist separately)

4. **Create one more Custom Event Trigger** for the conversion
   - Name: *"Custom Event - Purchase"*
   - **Custom Event Name** field: \`purchase\`

5. **Create a GA4 Event Tag for the conversion**
   - Event name: \`purchase\`
   - Add a custom dimension: key \`channel\`, value → \`dlv_channel\` (last-touch attribution)
   - Firing Trigger: select your *"Custom Event - Purchase"* trigger`,
    objectives: [
      'Create a Data Layer Variable for "channel"',
      'Create 3 Custom Event triggers (paid_search_click, social_click, email_click)',
      'Create a GA4 Event tag for channel_interaction with custom dimension "channel"',
      'Create a Custom Event trigger for "purchase" and a GA4 Event tag linked to it',
    ],
    mockWebsite: 'marketing',
    hints: [
      'In real GTM you can assign multiple firing triggers to one tag. Here, create all the triggers and link the interaction tag to at least one.',
      'The channel variable lets you see exactly which channel drove each interaction in GA4 reports.',
      'Setting up separate triggers per channel lets you filter and segment channel performance.',
    ],
    successCriteria: [
      {
        id: '3-3-a',
        description: 'A Data Layer Variable for "channel" exists',
        check: (ws: WorkspaceState) => {
          return ws.variables.some(
            (v) =>
              v.type === 'DataLayer' &&
              (v.config as DataLayerVariableConfig).dataLayerVariableName.toLowerCase() === 'channel'
          );
        },
        failureMessage:
          "No Data Layer Variable for 'channel' found. Create one with variable name 'channel'.",
      },
      {
        id: '3-3-b',
        description: 'Custom Event trigger for "paid_search_click" exists',
        check: (ws: WorkspaceState) => {
          return ws.triggers.some(
            (t) =>
              t.type === 'CustomEvent' &&
              (t.customEventName?.toLowerCase().includes('paid') ||
                t.customEventName?.toLowerCase().includes('search'))
          );
        },
        failureMessage:
          "No Custom Event trigger for 'paid_search_click' found. Create one and set the event name to 'paid_search_click'.",
      },
      {
        id: '3-3-c',
        description: 'Custom Event trigger for "social_click" exists',
        check: (ws: WorkspaceState) => {
          return ws.triggers.some(
            (t) =>
              t.type === 'CustomEvent' &&
              t.customEventName?.toLowerCase().includes('social')
          );
        },
        failureMessage:
          "No Custom Event trigger for 'social_click' found. Create one and set the event name to 'social_click'.",
      },
      {
        id: '3-3-d',
        description: 'Custom Event trigger for "email_click" exists',
        check: (ws: WorkspaceState) => {
          return ws.triggers.some(
            (t) =>
              t.type === 'CustomEvent' &&
              t.customEventName?.toLowerCase().includes('email')
          );
        },
        failureMessage:
          "No Custom Event trigger for 'email_click' found. Create one and set the event name to 'email_click'.",
      },
      {
        id: '3-3-e',
        description: 'A GA4 Event tag for "channel_interaction" with "channel" dimension exists',
        check: (ws: WorkspaceState) => {
          const tag = ga4EventTagWithName(ws, 'channel_interaction');
          return tag ? ga4EventTagHasCustomDimension(tag, 'channel') : false;
        },
        failureMessage:
          "No GA4 Event tag for 'channel_interaction' with a 'channel' custom dimension found. Create it with event name 'channel_interaction' and add a custom dimension with key 'channel'.",
      },
      {
        id: '3-3-f',
        description: 'A GA4 Event tag for "purchase" with custom dimension "channel" exists',
        check: (ws: WorkspaceState) => {
          const tag = ga4EventTagWithName(ws, 'purchase');
          if (!tag) return false;
          return ga4EventTagHasCustomDimension(tag, 'channel');
        },
        failureMessage:
          "No GA4 purchase tag with 'channel' dimension found. Create a GA4 Event tag with event name 'purchase' and a custom dimension for 'channel' (last-touch attribution).",
      },
      {
        id: '3-3-g',
        description: 'A Custom Event trigger for "purchase" exists',
        check: (ws: WorkspaceState) => {
          return ws.triggers.some(
            (t) =>
              t.type === 'CustomEvent' &&
              t.customEventName?.toLowerCase() === 'purchase'
          );
        },
        failureMessage:
          "No Custom Event trigger for 'purchase' found. Create one with event name 'purchase' and link it to your GA4 purchase tag.",
      },
    ],
  },
];

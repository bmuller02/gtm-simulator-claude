import { ChallengeDefinition } from '@/lib/types/challenge';
import { WorkspaceState, DataLayerVariableConfig, GoogleTagConfig, FloodlightActivityConfig } from '@/lib/types/gtm';
import {
  tagExists, triggerExists, findTagByType, findTriggerByType,
  tagLinkedToTriggerType, findTagsByType
} from '@/lib/validation/engine';

export const level1Challenges: ChallengeDefinition[] = [
  // ─── Challenge 1-1: Install the Universal Google Tag ─────────────────────
  {
    id: '1-1',
    level: 1,
    index: 1,
    title: 'Install the Universal Google Tag',
    scenario:
      "Your AdOps team is onboarding a new advertiser into Campaign Manager 360 (CM360). Before any Floodlight activity tags can fire and report conversions, you must first install the advertiser's universal Google Tag on every page of the site. This tag links the site to CM360's Floodlight configuration.",
    instructions: `## Your Task
Install the universal Google Tag to enable Floodlight tracking:

1. **Create a Page View Trigger**
   - Trigger type: **Page View**
   - Fires on: All pages (no conditions needed — leave conditions empty)
   - Give it a name like *"All Pages"*
   - Note: you must create the trigger first — a tag cannot be saved without a firing trigger assigned

2. **Create a Google Tag**
   - Tag type: **Google Tag**
   - Tag ID: \`DC-DEMO12345\`
   - Give it a clear name like *"Google Tag - CM360"*

3. **Link the tag to the trigger**
   - In the tag's **Firing Trigger** field, select your *"All Pages"* trigger`,
    objectives: [
      'Create a Page View trigger that fires on all pages',
      'Create a Google Tag with Tag ID DC-DEMO12345',
      'Link the Google Tag to the Page View trigger',
    ],
    mockWebsite: 'ecommerce',
    hints: [
      'Start by clicking "+" in the Triggers panel to create the trigger first.',
      'The Google Tag is the foundation for all CM360 Floodlight tags — it must fire on every page.',
      'The Tag ID for CM360 advertisers starts with "DC-" followed by the advertiser\'s numeric ID.',
    ],
    successCriteria: [
      {
        id: '1-1-a',
        description: 'A Google Tag exists',
        check: (ws: WorkspaceState) => tagExists(ws, 'GoogleTag'),
        failureMessage:
          "No Google Tag found. Create a new tag and set its type to 'Google Tag'.",
      },
      {
        id: '1-1-b',
        description: 'Google Tag has a valid Tag ID (starts with DC- or GT-)',
        check: (ws: WorkspaceState) => {
          const tag = findTagByType(ws, 'GoogleTag');
          if (!tag) return false;
          const config = tag.config as GoogleTagConfig;
          return /^(DC|GT)-/i.test(config.tagId || '');
        },
        failureMessage:
          "Your Google Tag's Tag ID is missing or invalid. It must start with 'DC-' (e.g. DC-DEMO12345).",
      },
      {
        id: '1-1-c',
        description: 'A Page View trigger exists',
        check: (ws: WorkspaceState) => triggerExists(ws, 'PageView'),
        failureMessage:
          "No Page View trigger found. Create a trigger with type 'Page View'.",
      },
      {
        id: '1-1-d',
        description: 'Google Tag is linked to the Page View trigger',
        check: (ws: WorkspaceState) =>
          tagLinkedToTriggerType(ws, 'GoogleTag', 'PageView'),
        failureMessage:
          "Your Google Tag is not connected to the Page View trigger. Open the tag, then set its Firing Trigger to your Page View trigger.",
      },
    ],
  },

  // ─── Challenge 1-2: Track Add-to-Cart with a Floodlight Activity ──────────
  {
    id: '1-2',
    level: 1,
    index: 2,
    title: 'Track Add-to-Cart with a Floodlight Activity',
    scenario:
      'The advertiser wants to track when visitors click the "Add to Cart" button as a Floodlight conversion event in CM360. You need to create a Floodlight Activity tag that fires every time a user clicks the Add to Cart button on a product page.',
    instructions: `## Your Task
Track "Add to Cart" clicks with a Floodlight Activity tag:

1. **Create a Click Trigger**
   - Trigger type: **Click**
   - Add a condition: **Click Text** → **equals** → \`Add to Cart\`
   - This fires when the user clicks a button whose visible text is exactly "Add to Cart"

2. **Create a Floodlight Activity tag**
   - Tag type: **Floodlight Activity**
   - Advertiser ID: \`DC-12345678\`
   - Activity Group Tag String: \`shop\`
   - Activity Tag String: \`add_to_cart\`
   - Link it to your new Click trigger`,
    objectives: [
      'Create a Click trigger where Click Text equals "Add to Cart"',
      'Create a Floodlight Activity tag with Advertiser ID DC-12345678',
      'Link the Floodlight Activity tag to the Click trigger',
    ],
    mockWebsite: 'ecommerce',
    hints: [
      'Click triggers fire when a user clicks an element matching your condition.',
      'Use "Click Text" to target buttons by their visible label — more reliable than CSS selectors when button styling changes.',
      'Use the mock website to test: click "Add to Cart" and see if the event fires in the event log.',
    ],
    successCriteria: [
      {
        id: '1-2-a',
        description: 'A Click trigger exists',
        check: (ws: WorkspaceState) => triggerExists(ws, 'Click'),
        failureMessage:
          "No Click trigger found. Create a trigger with type 'Click'.",
      },
      {
        id: '1-2-b',
        description: 'Click trigger targets buttons with text "Add to Cart"',
        check: (ws: WorkspaceState) => {
          const trigger = findTriggerByType(ws, 'Click');
          if (!trigger) return false;
          return trigger.conditions.some(
            (c) =>
              c.variable === 'Click Text' &&
              c.value.toLowerCase().includes('add to cart')
          );
        },
        failureMessage:
          "Your Click trigger doesn't have the right condition. Add a condition: Click Text → equals → Add to Cart",
      },
      {
        id: '1-2-c',
        description: 'A Floodlight Activity tag exists',
        check: (ws: WorkspaceState) => tagExists(ws, 'FloodlightActivity'),
        failureMessage:
          "No Floodlight Activity tag found. Create a tag and set its type to 'Floodlight Activity'.",
      },
      {
        id: '1-2-d',
        description: 'Floodlight Activity tag is linked to the Click trigger',
        check: (ws: WorkspaceState) =>
          tagLinkedToTriggerType(ws, 'FloodlightActivity', 'Click'),
        failureMessage:
          "Your Floodlight Activity tag is not connected to the Click trigger. Open the tag and set its Firing Trigger to your Click trigger.",
      },
    ],
  },

  // ─── Challenge 1-3: Exclude Internal Traffic from the Google Tag ──────────
  {
    id: '1-3',
    level: 1,
    index: 3,
    title: 'Exclude Internal Traffic from the Google Tag',
    scenario:
      "The advertiser's analytics team noticed that employee testing is inflating their Floodlight conversion counts. The dev team already pushes a data layer variable `userType` with the value `'internal'` for employees. You need to modify the Google Tag's trigger so it only fires for external visitors.",
    instructions: `## Your Task
Prevent internal employee traffic from triggering the Google Tag:

1. **Create a Data Layer Variable**
   - Type: **Data Layer Variable**
   - Variable Name (display name): \`dlv_userType\`
   - **Data Layer Variable Name** field: \`userType\` (this must exactly match the key the dev team pushes)
   - Leave the **Default Value** field blank
   - The display name \`dlv_userType\` is what you'll select in trigger conditions

2. **Create a conditional Page View trigger**
   - Type: **Page View**
   - Add a condition: **dlv_userType** → **does not equal** → \`internal\`
   - This trigger only fires when the user is NOT an employee

3. **Update the Google Tag's firing trigger**
   - Open the Google Tag you created in Challenge 1-1
   - Change its Firing Trigger to the new conditional trigger (not "All Pages")`,
    objectives: [
      'Create a Data Layer Variable named "dlv_userType" that reads the "userType" key',
      'Create a Page View trigger that excludes userType = "internal"',
      'Link the Google Tag to the new conditional trigger',
    ],
    mockWebsite: 'ecommerce',
    hints: [
      'Data Layer Variables read values your developers push via window.dataLayer.push()',
      'The Data Layer Variable Name field must exactly match what the dev team pushes: "userType"',
      'Use "does not equal" to EXCLUDE something — "equals" would do the opposite!',
    ],
    successCriteria: [
      {
        id: '1-3-a',
        description: 'A Data Layer Variable for "userType" exists',
        check: (ws: WorkspaceState) => {
          return ws.variables.some(
            (v) =>
              v.type === 'DataLayer' &&
              (v.config as DataLayerVariableConfig).dataLayerVariableName.toLowerCase() === 'usertype'
          );
        },
        failureMessage:
          "No Data Layer Variable for 'userType' found. Create a variable with type 'Data Layer Variable' and set the Data Layer Variable Name field to 'userType'.",
      },
      {
        id: '1-3-b',
        description: 'A Page View trigger exists with a "does not equal internal" condition',
        check: (ws: WorkspaceState) => {
          return ws.triggers.some(
            (t) =>
              t.type === 'PageView' &&
              t.conditions.some(
                (c) =>
                  c.operator === 'doesNotEqual' &&
                  c.value.toLowerCase() === 'internal'
              )
          );
        },
        failureMessage:
          "No conditional Page View trigger found. Create a Page View trigger with a condition: dlv_userType → does not equal → internal",
      },
      {
        id: '1-3-c',
        description: 'Google Tag is linked to the conditional trigger',
        check: (ws: WorkspaceState) => {
          const googleTags = findTagsByType(ws, 'GoogleTag');
          if (googleTags.length === 0) return false;
          return googleTags.some((tag) => {
            const trigger = ws.triggers.find((t) => t.id === tag.firingTriggerId);
            if (!trigger) return false;
            return (
              trigger.type === 'PageView' &&
              trigger.conditions.some(
                (c) =>
                  c.operator === 'doesNotEqual' &&
                  c.value.toLowerCase() === 'internal'
              )
            );
          });
        },
        failureMessage:
          "Your Google Tag is not connected to the conditional trigger. Open the Google Tag and update its Firing Trigger to the new Page View trigger (not 'All Pages').",
      },
    ],
  },
];

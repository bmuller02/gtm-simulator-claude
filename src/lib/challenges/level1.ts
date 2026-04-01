import { ChallengeDefinition } from '@/lib/types/challenge';
import { WorkspaceState, GA4ConfigurationConfig, GA4EventConfig, DataLayerVariableConfig } from '@/lib/types/gtm';
import {
  findTagByType, tagExists, triggerExists, findTriggerByType,
  findDataLayerVariable, triggerHasCondition, tagLinkedToTriggerType,
  getGA4Config, ga4EventTagWithName, findTagsByType
} from '@/lib/validation/engine';

export const level1Challenges: ChallengeDefinition[] = [
  // ─── Challenge 1-1: Track All Page Views ─────────────────────────────────
  {
    id: '1-1',
    level: 1,
    index: 1,
    title: 'Track All Page Views with GA4',
    scenario:
      "A marketing team at a growing e-commerce brand needs to start measuring website traffic. Your job is to install Google Analytics 4 on their site using Google Tag Manager. Every page a visitor loads should be tracked.",
    instructions: `## Your Task
Set up basic GA4 page view tracking by creating:

1. **A GA4 Configuration Tag**
   - Tag type: **GA4 Configuration**
   - Measurement ID: \`G-DEMO12345\`
   - Give it a clear name like *"GA4 - Configuration"*

2. **A Page View Trigger**
   - Trigger type: **Page View**
   - Fires on: All pages (no extra conditions needed)
   - Give it a name like *"All Pages"*

3. **Link the tag to the trigger**
   - In the tag's Firing Trigger field, select your new Page View trigger`,
    objectives: [
      'Create a GA4 Configuration tag with Measurement ID G-DEMO12345',
      'Create a Page View trigger that fires on all pages',
      'Link the GA4 tag to the Page View trigger',
    ],
    mockWebsite: 'ecommerce',
    hints: [
      'Start by clicking the "+" button in the Tags panel to create a new tag.',
      'The GA4 Measurement ID always starts with "G-" followed by letters/numbers.',
      'After creating both the tag and trigger, go back to the tag and set its Firing Trigger.',
    ],
    successCriteria: [
      {
        id: '1-1-a',
        description: 'A GA4 Configuration tag exists',
        check: (ws: WorkspaceState) => tagExists(ws, 'GA4Configuration'),
        failureMessage:
          "No GA4 Configuration tag found. Create a new tag and set its type to 'GA4 Configuration'.",
      },
      {
        id: '1-1-b',
        description: 'GA4 tag has a valid Measurement ID (starts with G-)',
        check: (ws: WorkspaceState) => {
          const tag = findTagByType(ws, 'GA4Configuration');
          if (!tag) return false;
          const config = tag.config as GA4ConfigurationConfig;
          return /^G-[A-Z0-9]+$/i.test(config.measurementId || '');
        },
        failureMessage:
          "Your GA4 tag's Measurement ID is missing or invalid. It must start with 'G-' (e.g. G-DEMO12345).",
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
        description: 'GA4 Configuration tag is linked to the Page View trigger',
        check: (ws: WorkspaceState) =>
          tagLinkedToTriggerType(ws, 'GA4Configuration', 'PageView'),
        failureMessage:
          "Your GA4 tag is not connected to the Page View trigger. Open the tag, then set its Firing Trigger to your Page View trigger.",
      },
    ],
  },

  // ─── Challenge 1-2: Track Add-to-Cart Clicks ──────────────────────────────
  {
    id: '1-2',
    level: 1,
    index: 2,
    title: 'Track Add-to-Cart Button Clicks',
    scenario:
      'The same e-commerce brand wants to know how many visitors are clicking the "Add to Cart" button on product pages. You need to fire a GA4 event every time this button is clicked.',
    instructions: `## Your Task
Track clicks on the "Add to Cart" button by creating:

1. **A Click Trigger**
   - Trigger type: **Click**
   - Add a condition: **Click Element** → **contains** → \`.add-to-cart\`
   - This targets any element with the class \`add-to-cart\`

2. **A GA4 Event Tag**
   - Tag type: **GA4 Event**
   - Event name: \`add_to_cart\`
   - Link it to your new Click trigger`,
    objectives: [
      'Create a Click trigger targeting elements with class .add-to-cart',
      'Create a GA4 Event tag with event name "add_to_cart"',
      'Link the GA4 Event tag to the Click trigger',
    ],
    mockWebsite: 'ecommerce',
    hints: [
      'Click triggers fire when a user clicks on an element matching your condition.',
      'The Click Element condition checks the CSS selector of the clicked element.',
      'Use the mock website to test: click "Add to Cart" and see if the event fires.',
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
        description: 'Click trigger targets the .add-to-cart element',
        check: (ws: WorkspaceState) => {
          const trigger = findTriggerByType(ws, 'Click');
          if (!trigger) return false;
          return trigger.conditions.some(
            (c) =>
              c.variable === 'Click Element' &&
              c.value.toLowerCase().includes('add-to-cart')
          );
        },
        failureMessage:
          "Your Click trigger doesn't target the right element. Add a condition: Click Element → contains → .add-to-cart",
      },
      {
        id: '1-2-c',
        description: 'A GA4 Event tag with event name "add_to_cart" exists',
        check: (ws: WorkspaceState) =>
          ga4EventTagWithName(ws, 'add_to_cart') !== undefined,
        failureMessage:
          "No GA4 Event tag found with event name 'add_to_cart'. Create a GA4 Event tag and set the event name to 'add_to_cart'.",
      },
      {
        id: '1-2-d',
        description: 'GA4 Event tag is linked to the Click trigger',
        check: (ws: WorkspaceState) =>
          tagLinkedToTriggerType(ws, 'GA4Event', 'Click'),
        failureMessage:
          "Your GA4 Event tag is not connected to the Click trigger. Open the tag and set its Firing Trigger to your Click trigger.",
      },
    ],
  },

  // ─── Challenge 1-3: Exclude Internal Traffic ──────────────────────────────
  {
    id: '1-3',
    level: 1,
    index: 3,
    title: 'Exclude Internal Traffic from Analytics',
    scenario:
      "The marketing team noticed that employee traffic is inflating their GA4 numbers. The dev team already pushes a data layer variable `userType` with the value `'internal'` for employees. You need to modify the tracking so GA4 only fires for external visitors.",
    instructions: `## Your Task
Prevent internal employee traffic from being tracked:

1. **Create a Data Layer Variable**
   - Type: **Data Layer Variable**
   - Variable name: \`userType\`
   - This reads the value your devs push to the data layer

2. **Create a conditional Page View trigger**
   - Type: **Page View**
   - Add a condition: **dlv_userType** → **does not equal** → \`internal\`
   - This trigger only fires when the user is NOT an employee

3. **Update your GA4 Configuration tag**
   - Change its Firing Trigger to the new conditional trigger (not "All Pages")`,
    objectives: [
      'Create a Data Layer Variable named "userType"',
      'Create a Page View trigger that excludes userType = "internal"',
      'Link the GA4 Configuration tag to the new conditional trigger',
    ],
    mockWebsite: 'ecommerce',
    hints: [
      'Data Layer Variables read values your developers push via window.dataLayer.push()',
      'The variable name must exactly match what the dev team pushes: "userType"',
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
          "No Data Layer Variable for 'userType' found. Create a variable with type 'Data Layer Variable' and variable name 'userType'.",
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
          "No conditional Page View trigger found. Create a Page View trigger with a condition: [your userType variable] → does not equal → internal",
      },
      {
        id: '1-3-c',
        description: 'GA4 Configuration tag is linked to the conditional trigger',
        check: (ws: WorkspaceState) => {
          const ga4Tag = findTagByType(ws, 'GA4Configuration');
          if (!ga4Tag) return false;
          const trigger = ws.triggers.find((t) => t.id === ga4Tag.firingTriggerId);
          if (!trigger) return false;
          return (
            trigger.type === 'PageView' &&
            trigger.conditions.some(
              (c) =>
                c.operator === 'doesNotEqual' &&
                c.value.toLowerCase() === 'internal'
            )
          );
        },
        failureMessage:
          "Your GA4 tag is not connected to the conditional trigger. Update its Firing Trigger to use the new Page View trigger (not 'All Pages').",
      },
    ],
  },
];

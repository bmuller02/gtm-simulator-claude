import { ChallengeDefinition } from '@/lib/types/challenge';
import { WorkspaceState, GA4EventConfig, DataLayerVariableConfig, DOMElementVariableConfig } from '@/lib/types/gtm';
import {
  tagExists, triggerExists, findTriggerByType, variableExists,
  findVariableByType, ga4EventTagWithName, tagLinkedToTriggerType,
  ga4EventTagHasCustomDimension, findTagByType, findTagsByType
} from '@/lib/validation/engine';

export const level2Challenges: ChallengeDefinition[] = [
  // ─── Challenge 2-1: Track Form Submissions ────────────────────────────────
  {
    id: '2-1',
    level: 2,
    index: 1,
    title: 'Track Contact Form Submissions',
    scenario:
      "A B2B SaaS company wants to track when visitors submit their contact form. They also want to capture the visitor's email address as a custom dimension to segment leads in GA4.",
    instructions: `## Your Task
Track form submissions and capture the email address:

1. **Create a DOM Element Variable**
   - Type: **DOM Element**
   - Variable Name (display name): *"DOM - Email Input Value"*
   - CSS Selector: \`input[name="email"]\`
   - Attribute Name: \`value\`
   - Tip: Switch to the **Preview Site** tab — the email field shows its CSS selector hint directly below it

2. **Create a Form Submission Trigger**
   - Type: **Form Submission**
   - Leave conditions empty (fires on all form submissions)

3. **Create a GA4 Event Tag**
   - Type: **GA4 Event**
   - Event name: \`form_submission\`
   - Add a custom dimension: key \`email\`, value → type the name of your DOM variable (e.g. \`DOM - Email Input Value\`)
   - Link it to your Form Submission trigger`,
    objectives: [
      'Create a DOM Element variable targeting input[name="email"] with attribute "value"',
      'Create a Form Submission trigger',
      'Create a GA4 Event tag with event name "form_submission" and custom dimension "email"',
    ],
    mockWebsite: 'contact',
    hints: [
      'DOM Element variables let you read any HTML attribute from any element on the page.',
      'Use the CSS selector input[name="email"] to target the email input field specifically.',
      'Custom dimensions in GA4 let you attach extra data to events — perfect for capturing user properties.',
    ],
    successCriteria: [
      {
        id: '2-1-a',
        description: 'A DOM Element variable for the email input exists',
        check: (ws: WorkspaceState) => {
          return ws.variables.some(
            (v) =>
              v.type === 'DOMElement' &&
              (v.config as DOMElementVariableConfig).cssSelector.toLowerCase().includes('email')
          );
        },
        failureMessage:
          "No DOM Element variable targeting the email input found. Create a DOM Element variable with CSS selector 'input[name=\"email\"]' and attribute 'value'.",
      },
      {
        id: '2-1-b',
        description: 'DOM Element variable captures the "value" attribute',
        check: (ws: WorkspaceState) => {
          return ws.variables.some(
            (v) =>
              v.type === 'DOMElement' &&
              (v.config as DOMElementVariableConfig).attributeName.toLowerCase() === 'value'
          );
        },
        failureMessage:
          "Your DOM Element variable isn't set to capture the 'value' attribute. Change the attribute to 'value' to read what the user typed.",
      },
      {
        id: '2-1-c',
        description: 'A Form Submission trigger exists',
        check: (ws: WorkspaceState) => triggerExists(ws, 'FormSubmission'),
        failureMessage:
          "No Form Submission trigger found. Create a trigger with type 'Form Submission'.",
      },
      {
        id: '2-1-d',
        description: 'A GA4 Event tag with event name "form_submission" exists',
        check: (ws: WorkspaceState) => ga4EventTagWithName(ws, 'form_submission') !== undefined,
        failureMessage:
          "No GA4 Event tag with event name 'form_submission' found. Create a GA4 Event tag and set the event name exactly to 'form_submission'.",
      },
      {
        id: '2-1-e',
        description: 'GA4 Event tag has a custom dimension for "email"',
        check: (ws: WorkspaceState) => {
          const tag = ga4EventTagWithName(ws, 'form_submission');
          return tag ? ga4EventTagHasCustomDimension(tag, 'email') : false;
        },
        failureMessage:
          "Your GA4 Event tag is missing the 'email' custom dimension. In the tag's custom dimensions, add a row with key 'email' and set its value to your DOM variable.",
      },
      {
        id: '2-1-f',
        description: 'GA4 Event tag is linked to the Form Submission trigger',
        check: (ws: WorkspaceState) => tagLinkedToTriggerType(ws, 'GA4Event', 'FormSubmission'),
        failureMessage:
          "Your GA4 Event tag is not connected to the Form Submission trigger. Update the tag's Firing Trigger.",
      },
    ],
  },

  // ─── Challenge 2-2: Purchase Ecommerce Tracking ───────────────────────────
  {
    id: '2-2',
    level: 2,
    index: 2,
    title: 'Track Purchase Conversions',
    scenario:
      'The e-commerce team wants to track completed purchases in GA4. Their dev team fires a custom event `purchase` through the data layer along with transaction data. You need to capture this as a GA4 purchase event with the order value.',
    instructions: `## Your Task
Set up purchase conversion tracking:

1. **Create a Data Layer Variable** for the order value
   - Type: **Data Layer Variable**
   - Variable Name (display name): *"dlv_transactionRevenue"*
   - **Data Layer Variable Name** field: \`transactionRevenue\` (this must exactly match the key the dev team pushes)
   - Leave the **Default Value** field blank

2. **Create a Custom Event Trigger**
   - Type: **Custom Event**
   - **Custom Event Name** field: \`purchase\`
   - No additional conditions are needed — the event name field IS the condition
   - This fires when developers push \`{ event: 'purchase' }\` to the data layer

3. **Create a GA4 Event Tag**
   - Type: **GA4 Event**
   - Event name: \`purchase\`
   - Add a custom dimension: key \`value\`, value → type \`dlv_transactionRevenue\` (the name of your variable)
   - Link it to your Custom Event trigger`,
    objectives: [
      'Create a Data Layer Variable named "transactionRevenue"',
      'Create a Custom Event trigger for the "purchase" event',
      'Create a GA4 Event tag with event name "purchase" and custom dimension "value"',
    ],
    mockWebsite: 'checkout',
    hints: [
      'Custom Event triggers listen for specific events fired via dataLayer.push({ event: "..." })',
      'The event name in the trigger must exactly match the event name pushed by the dev team.',
      'Custom dimensions let you send the order value alongside the purchase event to GA4.',
    ],
    successCriteria: [
      {
        id: '2-2-a',
        description: 'A Data Layer Variable for "transactionRevenue" exists',
        check: (ws: WorkspaceState) => {
          return ws.variables.some(
            (v) =>
              v.type === 'DataLayer' &&
              (v.config as DataLayerVariableConfig).dataLayerVariableName
                .toLowerCase()
                .includes('revenue') ||
              v.type === 'DataLayer' &&
              (v.config as DataLayerVariableConfig).dataLayerVariableName
                .toLowerCase()
                .includes('transaction')
          );
        },
        failureMessage:
          "No Data Layer Variable for the transaction amount found. Create one with variable name 'transactionRevenue'.",
      },
      {
        id: '2-2-b',
        description: 'A Custom Event trigger for "purchase" exists',
        check: (ws: WorkspaceState) => {
          return ws.triggers.some(
            (t) =>
              t.type === 'CustomEvent' &&
              (t.customEventName?.toLowerCase() === 'purchase' ||
                t.conditions.some(
                  (c) => c.value.toLowerCase() === 'purchase'
                ))
          );
        },
        failureMessage:
          "No Custom Event trigger for 'purchase' found. Create a Custom Event trigger and set the event name to 'purchase'.",
      },
      {
        id: '2-2-c',
        description: 'A GA4 Event tag with event name "purchase" exists',
        check: (ws: WorkspaceState) => ga4EventTagWithName(ws, 'purchase') !== undefined,
        failureMessage:
          "No GA4 Event tag with event name 'purchase' found. Create a GA4 Event tag with event name 'purchase'.",
      },
      {
        id: '2-2-d',
        description: 'GA4 Event tag has a custom dimension for order value',
        check: (ws: WorkspaceState) => {
          const tag = ga4EventTagWithName(ws, 'purchase');
          if (!tag) return false;
          const config = tag.config as GA4EventConfig;
          return !!config.customDimensions && Object.keys(config.customDimensions).length > 0;
        },
        failureMessage:
          "Your purchase tag is missing the order value. Add a custom dimension (e.g. key 'value') mapped to your transactionRevenue variable.",
      },
      {
        id: '2-2-e',
        description: 'GA4 Event tag is linked to the Custom Event trigger',
        check: (ws: WorkspaceState) => tagLinkedToTriggerType(ws, 'GA4Event', 'CustomEvent'),
        failureMessage:
          "Your GA4 purchase tag is not connected to the Custom Event trigger. Update the tag's Firing Trigger.",
      },
    ],
  },

  // ─── Challenge 2-3: Tag Sequencing (Conversion Linker) ───────────────────
  {
    id: '2-3',
    level: 2,
    index: 3,
    title: 'Implement Tag Sequencing with Conversion Linker',
    scenario:
      "The paid search team is running Google Ads campaigns and wants to track conversions. They need a Conversion Linker tag to run BEFORE the Google Ads conversion tag on the thank-you page. Tag sequencing ensures the linker sets up properly before the conversion fires.",
    instructions: `## Your Task
Set up Google Ads conversion tracking with proper tag sequencing:

1. **Create a Page View trigger for the thank-you page**
   - Type: **Page View**
   - Condition: **Page URL** → **contains** → \`/thank-you\`

2. **Create a Conversion Linker tag**
   - Type: **Conversion Linker**
   - Link it to your thank-you page trigger

3. **Create a Google Ads Conversion tag**
   - Type: **Google Ads Conversion**
   - Conversion ID: \`AW-DEMO9876\`
   - Conversion Label: \`abc123XYZ\`
   - Set **Setup Tag** (fires before this tag) → select your Conversion Linker tag
   - Link it to the same thank-you page trigger`,
    objectives: [
      'Create a Page View trigger that fires only on the /thank-you page',
      'Create a Conversion Linker tag',
      'Create a Google Ads Conversion tag with Conversion Linker as setup tag',
    ],
    mockWebsite: 'checkout',
    hints: [
      'Tag sequencing lets you guarantee one tag fires before another — critical for conversion tracking.',
      'The Conversion Linker must always fire before Google Ads tags on the same page.',
      'The "Setup Tag" field in Google Ads tags is how you configure the firing order in GTM.',
    ],
    successCriteria: [
      {
        id: '2-3-a',
        description: 'A Page View trigger with URL condition "/thank-you" exists',
        check: (ws: WorkspaceState) => {
          return ws.triggers.some(
            (t) =>
              t.type === 'PageView' &&
              t.conditions.some(
                (c) =>
                  c.variable.toLowerCase().includes('url') &&
                  (c.value.toLowerCase().includes('thank') || c.value.toLowerCase().includes('/thank-you'))
              )
          );
        },
        failureMessage:
          "No Page View trigger for '/thank-you' found. Create a Page View trigger with condition: Page URL → contains → /thank-you",
      },
      {
        id: '2-3-b',
        description: 'A Conversion Linker tag exists',
        check: (ws: WorkspaceState) => tagExists(ws, 'ConversionLinker'),
        failureMessage:
          "No Conversion Linker tag found. Create a tag with type 'Conversion Linker'.",
      },
      {
        id: '2-3-c',
        description: 'A Google Ads Conversion tag exists',
        check: (ws: WorkspaceState) => tagExists(ws, 'GoogleAdsConversion'),
        failureMessage:
          "No Google Ads Conversion tag found. Create a tag with type 'Google Ads Conversion'.",
      },
      {
        id: '2-3-d',
        description: 'Google Ads tag is linked to the thank-you page trigger',
        check: (ws: WorkspaceState) => {
          const adsTag = findTagByType(ws, 'GoogleAdsConversion');
          if (!adsTag) return false;
          const trigger = ws.triggers.find((t) => t.id === adsTag.firingTriggerId);
          if (!trigger) return false;
          return (
            trigger.type === 'PageView' &&
            trigger.conditions.some(
              (c) =>
                c.variable.toLowerCase().includes('url') &&
                (c.value.toLowerCase().includes('thank') || c.value.toLowerCase().includes('/thank-you'))
            )
          );
        },
        failureMessage:
          "Your Google Ads Conversion tag is not linked to the /thank-you trigger. Make sure it fires on the thank-you page.",
      },
      {
        id: '2-3-e',
        description: 'Conversion Linker tag is linked to the thank-you page trigger',
        check: (ws: WorkspaceState) => {
          const linkerTag = findTagByType(ws, 'ConversionLinker');
          if (!linkerTag) return false;
          const trigger = ws.triggers.find((t) => t.id === linkerTag.firingTriggerId);
          if (!trigger) return false;
          return (
            trigger.type === 'PageView' &&
            trigger.conditions.some(
              (c) =>
                c.variable.toLowerCase().includes('url') &&
                (c.value.toLowerCase().includes('thank') || c.value.toLowerCase().includes('/thank-you'))
            )
          );
        },
        failureMessage:
          "Your Conversion Linker tag is not linked to the /thank-you trigger. It needs to fire on the same page as the Google Ads tag.",
      },
    ],
  },
];

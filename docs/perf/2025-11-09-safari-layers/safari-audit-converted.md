# Safari Web Inspector Audit — Converted for Cursor
_Converted on 2025-11-09T10:31:49.291766Z_
**Source file:** `Audit.audit`
**Detected format:** `json`
## Metadata
_No explicit metadata fields found; see raw header sample below._

```json
[
  "type",
  "name",
  "description",
  "tests"
]
```

## Summary
- Total extracted items: **31**
  - High: **0**, Medium: **0**, Low: **0**, Unrated: **31**

## Issues
### 1. data-custom
- **Category:** test-case
- **Source path (in audit):** `tests[1].tests[3]`

**Description**

This is an example of how custom result data is shown.
---
### 2. data-domAttributes
- **Category:** test-case
- **Source path (in audit):** `tests[1].tests[1]`

**Description**

This is an example of how result DOM attributes are highlighted on any returned DOM nodes. It will pass with all elements with an id attribute.
---
### 3. data-domNodes
- **Category:** test-case
- **Source path (in audit):** `tests[1].tests[0]`

**Description**

This is an example of how result DOM nodes are shown. It will pass with the <body> element.
---
### 4. data-errors
- **Category:** test-case
- **Source path (in audit):** `tests[1].tests[2]`

**Description**

This is an example of how errors are shown. The error was thrown manually, but execution errors will appear in the same way.
---
### 5. getActiveDescendant
- **Category:** test-case
- **Source path (in audit):** `tests[2].tests[0].tests[1]`

**Description**

This is an example test that uses WebInspectorAudit.Accessibility.getActiveDescendant to find any element that meets criteria for active descendant (“aria-activedescendant”) of the <body> element, if it exists.
---
### 6. getChildNodes
- **Category:** test-case
- **Source path (in audit):** `tests[2].tests[0].tests[2]`

**Description**

This is an example test that uses WebInspectorAudit.Accessibility.getChildNodes to find child nodes of the <body> element in the accessibility tree.
---
### 7. getComputedProperties
- **Category:** test-case
- **Source path (in audit):** `tests[2].tests[0].tests[3]`

**Description**

This is an example test that uses WebInspectorAudit.Accessibility.getComputedProperties to find a variety of accessibility information about the <body> element.
---
### 8. getControlledNodes
- **Category:** test-case
- **Source path (in audit):** `tests[2].tests[0].tests[4]`

**Description**

This is an example test that uses WebInspectorAudit.Accessibility.getControlledNodes to find all nodes controlled (“aria-controls”) by the <body> element, if any exist.
---
### 9. getElementsByComputedRole
- **Category:** test-case
- **Source path (in audit):** `tests[2].tests[0].tests[0]`

**Description**

This is an example test that uses WebInspectorAudit.Accessibility.getElementsByComputedRole to find elements with a computed role of “link”.
---
### 10. getFlowedNodes
- **Category:** test-case
- **Source path (in audit):** `tests[2].tests[0].tests[5]`

**Description**

This is an example test that uses WebInspectorAudit.Accessibility.getFlowedNodes to find all nodes flowed to (“aria-flowto”) from the <body> element, if any exist.
---
### 11. getMouseEventNode
- **Category:** test-case
- **Source path (in audit):** `tests[2].tests[0].tests[6]`

**Description**

This is an example test that uses WebInspectorAudit.Accessibility.getMouseEventNode to find the node that would handle mouse events for the <body> element, if applicable.
---
### 12. getOwnedNodes
- **Category:** test-case
- **Source path (in audit):** `tests[2].tests[0].tests[7]`

**Description**

This is an example test that uses WebInspectorAudit.Accessibility.getOwnedNodes to find all nodes owned (“aria-owns”) by the <body> element, if any exist.
---
### 13. getParentNode
- **Category:** test-case
- **Source path (in audit):** `tests[2].tests[0].tests[8]`

**Description**

This is an example test that uses WebInspectorAudit.Accessibility.getParentNode to find the parent node of the <body> element in the accessibility tree.
---
### 14. getResourceContent
- **Category:** test-case
- **Source path (in audit):** `tests[2].tests[2].tests[1]`

**Description**

This is an example test that uses WebInspectorAudit.Accessibility.getResourceContent to find the contents of the main resource.
---
### 15. getResources
- **Category:** test-case
- **Source path (in audit):** `tests[2].tests[2].tests[0]`

**Description**

This is an example test that uses WebInspectorAudit.Accessibility.getResources to find basic information about each resource.
---
### 16. getSelectedChildNodes
- **Category:** test-case
- **Source path (in audit):** `tests[2].tests[0].tests[9]`

**Description**

This is an example test that uses WebInspectorAudit.Accessibility.getSelectedChildNodes to find all child nodes that are selected (“aria-selected”) of the <body> element in the accessibility tree.
---
### 17. hasEventListeners
- **Category:** test-case
- **Source path (in audit):** `tests[2].tests[1].tests[0]`

**Description**

This is an example test that uses WebInspectorAudit.Accessibility.hasEventListeners to find data indicating whether the <body> element has any event listeners.
---
### 18. hasEventListeners-click
- **Category:** test-case
- **Source path (in audit):** `tests[2].tests[1].tests[1]`

**Description**

This is an example test that uses WebInspectorAudit.Accessibility.hasEventListenersClick to find data indicating whether the <body> element has any click event listeners.
---
### 19. level-error
- **Category:** test-case
- **Source path (in audit):** `tests[0].tests[3]`

**Description**

This is what the result of a test that threw an error with no data looks like.
---
### 20. level-fail
- **Category:** test-case
- **Source path (in audit):** `tests[0].tests[2]`

**Description**

This is what the result of a failing test with no data looks like.
---
### 21. level-pass
- **Category:** test-case
- **Source path (in audit):** `tests[0].tests[0]`

**Description**

This is what the result of a passing test with no data looks like.
---
### 22. level-unsupported
- **Category:** test-case
- **Source path (in audit):** `tests[0].tests[4]`

**Description**

This is what the result of an unsupported test with no data looks like.
---
### 23. level-warn
- **Category:** test-case
- **Source path (in audit):** `tests[0].tests[1]`

**Description**

This is what the result of a warning test with no data looks like.
---
### 24. unsupported
- **Category:** test-case
- **Source path (in audit):** `tests[3]`

**Description**

This is an example of a test that will not run because it is unsupported.
---
### 25. Accessibility
- **Category:** test-group
- **Source path (in audit):** `tests[2].tests[0]`

**Description**

These are example tests that demonstrate how to use WebInspectorAudit.Accessibility to get information about the accessibility tree.
---
### 26. DOM
- **Category:** test-group
- **Source path (in audit):** `tests[2].tests[1]`

**Description**

These are example tests that demonstrate how to use WebInspectorAudit.DOM to get information about DOM nodes.
---
### 27. Demo Audit
- **Category:** test-group

**Description**

These are example tests that demonstrate the functionality and structure of audits.
---
### 28. Resources
- **Category:** test-group
- **Source path (in audit):** `tests[2].tests[2]`

**Description**

These are example tests that demonstrate how to use WebInspectorAudit.Resources to get information about loaded resources.
---
### 29. Result Data
- **Category:** test-group
- **Source path (in audit):** `tests[1]`

**Description**

These are example tests that demonstrate all of the different types of data that can be returned with the test result.
---
### 30. Result Levels
- **Category:** test-group
- **Source path (in audit):** `tests[0]`

**Description**

These are all of the different test result levels.
---
### 31. Specially Exposed Data
- **Category:** test-group
- **Source path (in audit):** `tests[2]`

**Description**

These are example tests that demonstrate how to use WebInspectorAudit to access information not normally available to JavaScript.
---

## Appendix: Raw Payload (truncated preview)

```json
{
  "type": "test-group",
  "name": "Demo Audit",
  "description": "These are example tests that demonstrate the functionality and structure of audits.",
  "tests": [
    {
      "type": "test-group",
      "name": "Result Levels",
      "description": "These are all of the different test result levels.",
      "tests": [
        {
          "type": "test-case",
          "name": "level-pass",
          "description": "This is what the result of a passing test with no data looks like.",
          "test": "function() {\n    return {level: \"pass\"};\n}"
        },
        {
          "type": "test-case",
          "name": "level-warn",
          "description": "This is what the result of a warning test with no data looks like.",
          "test": "function() {\n    return {level: \"warn\"};\n}"
        },
        {
          "type": "test-case",
          "name": "level-fail",
          "description": "This is what the result of a failing test with no data looks like.",
          "test": "function() {\n    return {level: \"fail\"};\n}"
        },
        {
          "type": "test-case",
          "name": "level-error",
          "description": "This is what the result of a test that threw an error with no data looks like.",
          "test": "function() {\n    return {level: \"error\"};\n}"
        },
        {
          "type": "test-case",
          "name": "level-unsupported",
          "description": "This is what the result of an unsupported test with no data looks like.",
          "test": "function() {\n    return {level: \"unsupported\"};\n}"
        }
      ]
    },
    {
      "type": "test-group",
      "name": "Result Data",
      "description": "These are example tests that demonstrate all of the different types of data that can be returned with the test result.",
      "tests": [
        {
          "type": "test-case",
          "name": "data-domNodes",
          "description": "This is an example of how result DOM nodes are shown. It will pass with the <body> element.",
          "test": "function() {\n    return {level: \"pass\", domNodes: [document.body]};\n}"
        },
        {
          "type": "test-case",
          "name": "data-domAttributes",
          "description": "This is an example of how result DOM attributes are highlighted on any returned DOM nodes. It will pass with all elements with an id attribute.",
          "test": "function() {\n    return {level: \"pass\", domNodes: Array.from(document.querySelectorAll(\"[id]\")), domAttributes: [\"id\"]};\n}"
        },
        {
          "type": "test-case",
          "name": "data-errors",
          "description": "This is an example of how errors are shown. The error was thrown manually, but execution errors will appear in the same way.",
          "test": "function() {\n    throw Error(\"this error was thrown from inside the audit test code.\");\n}"
        },
        {
          "type": "test-case",
          "name": "data-custom",
          "description": "This is an example of how custom result data is shown.",
          "supports": 3,
          "test": "function() {\n    return {level: \"pass\", a: 1, b: [2], c: {key: 3}};\n}"
        }
      ]
    },
    {
      "type": "test-group",
      "name": "Specially Exposed Data",
      "description": "These are example tests that demonstrate how to use WebInspectorAudit to access information not normally available to JavaScript.",
      "supports": 1,
      "tests": [
        {
          "type": "test-group",
          "name": "Accessibility",
          "description": "These are example tests that demonstrate how to use WebInspectorAudit.Accessibility to get information about the accessibility tree.",
          "supports": 1,
          "tests": [
            {
              "type": "test-case",
              "name": "getElementsByComputedRole",
              "description": "This is an example test that uses WebInspectorAudit.Accessibility.getElementsByComputedRole to find elements with a computed ro
... (truncated) ...
```

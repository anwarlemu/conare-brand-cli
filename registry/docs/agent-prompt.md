---
name: agent-prompt
title: Agent prompt
type: registry:product
group: product
description: "Connect a coding agent over MCP: the agent at work on top, the prompt in a box that opens, then Copy prompt with the one-click installs and the API call beside it. The agent signs in with OAuth, so no key is shown."
use_for: "The agents page, whenever an agent is connected."
never:
  - "Pasting an API key into the prompt"
  - "Two copy buttons as the page's main action"
source: "conare-web app/components/console/agents/Connect.vue, agents/ConnectViz.vue, agent/Split.vue (take 2), app/composables/useAgentPrompt.ts, app/assets/css/console2.css (.v2-agentwork, .v2-promptbox, .v2-split), docs-viz.css"
files:
  - components/product/AgentPrompt.vue
  - components/product/AgentWindow.vue
  - components/product/AgentSplit.vue
examples:
  - "Product | The agents page's panel"
---

Build the prompt in your app (it names the MCP server and the namespaces connected) and pass it with the request
`code`. `installs` are the one-click links the prompt can't do (Cursor's and VS Code's install links); without them the
split has no arrow. `AgentWindow` plays the website's agent window once as it renders; `AgentSplit` works on its own.
The branch's panel also scatters seeded cells over the dark panel (`cell-burst`, batch 3); this one shows the grain only.

<script setup lang="ts">
import CodeBlock from '@/components/ui/CodeBlock.vue'
import Table from '@/components/ui/Table.vue'

// The figma command: it never calls Figma. It writes the files and prints the Figma MCP calls an agent makes, in order.
useHead({ title: 'Figma | Conare design system' })
const actions = [
  ['tokens', 'Every token as a Figma variable, typed and scoped, linked to its CSS variable, in two modes (Light and Dark); tokens.json and use_figma scripts that create or update them. On a plan with one mode per collection the script makes one collection per mode.', 'figma tokens --file <key>'],
  ['push image', 'A share image as SVG and PNG, with the steps that import it as editable layers (or upload it).', 'figma push image hero --headline "..." --size og'],
  ['push slide', 'A deck slide, the same way.', 'figma push slide cover --title "..."'],
  ['push illustration', 'An illustration subject as editable vectors.', 'figma push illustration stacks --size 1500x500'],
  ['push asset', 'Any SVG, PNG, JPEG, WebP, GIF or self-contained HTML file.', 'figma push asset logo.svg'],
  ['push component', 'A library example captured from a running docs site as static HTML for html_to_figma (needs playwright-core and a Chromium).', 'figma push component button --url http://localhost:3201'],
  ['push page', 'A page, from a URL or a saved HTML file.', 'figma push page app.html'],
  ['pull', 'The calls that read a frame (variables and design context) and save them for check.', 'figma pull "https://figma.com/design/<key>/<name>?node-id=1-2"'],
  ['check', 'Every color, font, size, radius and spacing in saved MCP output that is not a brand token, with the nearest token. Exits 1 on findings.', 'figma check variables.json design.txt'],
]
const sample = `$ npx conare-ds figma tokens
203 variables (Light, Dark) and 0 effect styles; 4 tokens have no Figma type.
  wrote figma/tokens.json
  wrote figma/tokens-1.js
Figma MCP steps, in order:
  1. whoami
  2. create_new_file {"fileName":"Conare apply brand tokens as variables","editorType":"design","planKey":"<plan key>"}
  3. create_session {"fileKey":"<fileKey>","description":"apply brand tokens as variables"}
  4. use_figma {"fileKey":"<fileKey>","sessionId":"<sessionId>","code":"<contents of figma/tokens-1.js>","skillNames":"figma-use,figma-generate-library"}
  5. get_variable_defs {"fileKey":"<fileKey>","nodeId":"<a node bound to the variables>"}`
</script>

<template>
  <div class="mx-auto flex w-full max-w-page-wide flex-col gap-10 px-4 pt-8 pb-16 md:px-8 md:pt-10 md:pb-20">
    <PageHead title="Figma" description="Bring the brand into Figma and check Figma work against it, through the Figma MCP tools. The CLI never calls Figma itself: each action writes its files and prints the exact tool calls, in order, for an agent to make. Pass --json for the same as data." />

    <section class="flex flex-col gap-4" aria-labelledby="actions">
      <SectionHead id="actions" title="Actions" />
      <Table framed label="figma actions">
        <thead><tr><th>Action</th><th>What it writes</th><th>Example</th></tr></thead>
        <tbody>
          <tr v-for="[a, what, ex] in actions" :key="a"><td class="type-code-sm whitespace-nowrap">{{ a }}</td><td>{{ what }}</td><td class="type-code-sm">npx conare-ds {{ ex }}</td></tr>
        </tbody>
      </Table>
    </section>

    <section class="flex flex-col gap-4" aria-labelledby="flow">
      <SectionHead id="flow" title="How a run goes" />
      <ol class="flex max-w-170 list-decimal flex-col gap-2 pl-5 type-ui text-fg-soft">
        <li>Run the action. It writes files under <code class="type-code-sm">figma/</code> (or <code class="type-code-sm">--out</code>) and prints the steps.</li>
        <li>The agent makes the calls in order: a session first (and a new file only when there is no <code class="type-code-sm">--file</code>), then <code class="type-code-sm">use_figma</code> with each script, <code class="type-code-sm">upload_assets</code> or <code class="type-code-sm">html_to_figma</code>, then one screenshot to confirm.</li>
        <li>Run <code class="type-code-sm">figma tokens</code> first in a new file, so pushed layers can bind to the variables.</li>
        <li>For Figma work coming back, <code class="type-code-sm">figma pull</code> lists the reads; save their output and run <code class="type-code-sm">figma check</code>. Build with library components and tokens, never the raw values.</li>
      </ol>
      <CodeBlock :code="sample" label="Shell" />
    </section>
  </div>
</template>

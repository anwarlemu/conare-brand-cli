<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import Field from '@/components/ui/Field.vue'
import Form from '@/components/ui/Form.vue'
import Input from '@/components/ui/Input.vue'
import NativeSelect from '@/components/ui/NativeSelect.vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import { useForm } from '@/composables/useForm'
// Creating an API key: a name, where it can search and when it expires. Send it empty to see the errors; a name of
// "taken" shows the server's answer.
const created = ref('')
const { values, errors, sending, failure, touch, submit, reset } = useForm(
  { name: '', namespace: '', expires: '90', readOnly: true },
  {
    name: v => (!String(v).trim() ? 'Give the key a name.' : /\s/.test(String(v)) ? 'Use letters, numbers and dashes, no spaces.' : undefined),
    namespace: v => (!v ? 'Pick where it can search.' : undefined),
  },
)
function send() {
  void submit(async (v) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    if (v.name === 'taken') throw new Error('A key with that name already exists.')
    created.value = v.name
  })
}
</script>

<template>
  <div class="w-100 max-w-full">
    <Form v-if="!created" label="create an API key" :failure="failure" @submit="send">
      <Field v-slot="{ id, hintId }" label="Name" hint="Letters, numbers and dashes." :error="errors.name">
        <Input :id="id" v-model="values.name" :invalid="!!errors.name" :aria-describedby="hintId" autocomplete="off" placeholder="production-agent" @blur="touch('name')" />
      </Field>
      <Field v-slot="{ id, hintId }" label="Namespace" :error="errors.namespace">
        <NativeSelect :id="id" v-model="values.namespace" mono :invalid="!!errors.namespace" :aria-describedby="hintId" @blur="touch('namespace')">
          <option value="" disabled>Pick a namespace</option><option>contracts</option><option>slack</option><option>sec-filings</option>
        </NativeSelect>
      </Field>
      <Field v-slot="{ id }" label="Expires">
        <NativeSelect :id="id" v-model="values.expires"><option value="30">In 30 days</option><option value="90">In 90 days</option><option value="never">Never</option></NativeSelect>
      </Field>
      <Checkbox v-model="values.readOnly" label="Read only" hint="It can search but not add or delete documents." />
      <template #actions>
        <Button variant="ghost" @click="reset">Clear</Button>
        <PixelButton type="submit" :disabled="sending">{{ sending ? 'Creating' : 'Create key' }}</PixelButton>
      </template>
    </Form>
    <div v-else class="flex flex-col items-start gap-3 border border-edge p-4" role="status">
      <p class="type-ui">Key <span class="font-code text-meta">{{ created }}</span> created.</p>
      <Button @click="created = ''; reset()">Create another</Button>
    </div>
  </div>
</template>

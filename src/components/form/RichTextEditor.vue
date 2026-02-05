<template>
  <div>
    <label v-if="label" class="text-core-800 mb-1.5 block text-sm font-medium">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div
      class="border-core-50 bg-core-25 focus-within:border-primary-300 focus-within:ring-primary-300 overflow-hidden rounded-xl border focus-within:ring-1"
    >
      <!-- Toolbar -->
      <div v-if="editor" class="border-core-50 flex items-center gap-1 border-b px-3 py-2">
        <button
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold transition-colors"
          :class="
            editor.isActive('bold')
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-500 hover:bg-gray-100'
          "
          @click="editor.chain().focus().toggleBold().run()"
        >
          B
        </button>
        <button
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded-md text-sm italic transition-colors"
          :class="
            editor.isActive('italic')
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-500 hover:bg-gray-100'
          "
          @click="editor.chain().focus().toggleItalic().run()"
        >
          I
        </button>
        <button
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded-md text-sm underline transition-colors"
          :class="
            editor.isActive('underline')
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-500 hover:bg-gray-100'
          "
          @click="editor.chain().focus().toggleUnderline().run()"
        >
          U
        </button>

        <div class="mx-1 h-4 w-px bg-gray-200" />

        <button
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
          :class="
            editor.isActive('bulletList')
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-500 hover:bg-gray-100'
          "
          @click="editor.chain().focus().toggleBulletList().run()"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="2.5" cy="4" r="1.5" fill="currentColor" />
            <circle cx="2.5" cy="8" r="1.5" fill="currentColor" />
            <circle cx="2.5" cy="12" r="1.5" fill="currentColor" />
            <line
              x1="6"
              y1="4"
              x2="14"
              y2="4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <line
              x1="6"
              y1="8"
              x2="14"
              y2="8"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <line
              x1="6"
              y1="12"
              x2="14"
              y2="12"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <button
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
          :class="
            editor.isActive('orderedList')
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-500 hover:bg-gray-100'
          "
          @click="editor.chain().focus().toggleOrderedList().run()"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <text
              x="1"
              y="5.5"
              fill="currentColor"
              font-size="5"
              font-weight="600"
              font-family="sans-serif"
            >
              1
            </text>
            <text
              x="1"
              y="9.5"
              fill="currentColor"
              font-size="5"
              font-weight="600"
              font-family="sans-serif"
            >
              2
            </text>
            <text
              x="1"
              y="13.5"
              fill="currentColor"
              font-size="5"
              font-weight="600"
              font-family="sans-serif"
            >
              3
            </text>
            <line
              x1="6"
              y1="4"
              x2="14"
              y2="4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <line
              x1="6"
              y1="8"
              x2="14"
              y2="8"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <line
              x1="6"
              y1="12"
              x2="14"
              y2="12"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <!-- Editor Content -->
      <EditorContent :editor="editor" class="rich-text-editor" />
    </div>
    <div v-if="hint" class="mt-1 flex items-center text-sm text-gray-500">
      {{ hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Placeholder from "@tiptap/extension-placeholder"
import { watch } from "vue"

interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  required?: boolean
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "",
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: false,
      codeBlock: false,
      blockquote: false,
      horizontalRule: false,
      code: false,
    }),
    Underline,
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
  ],
  editorProps: {
    attributes: {
      class: "p-3 text-sm text-core-800 min-h-[100px] focus:outline-none",
    },
  },
  onUpdate: ({ editor }) => {
    emit("update:modelValue", editor.getHTML())
  },
})

watch(
  () => props.modelValue,
  (value) => {
    if (editor.value && editor.value.getHTML() !== value) {
      editor.value.commands.setContent(value || "", false)
    }
  },
)
</script>

<style>
.rich-text-editor .tiptap {
  min-height: 100px;
  outline: none;
}

.rich-text-editor .tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: var(--color-core-400, #9ca3af);
  pointer-events: none;
  height: 0;
}

.rich-text-editor .tiptap ul {
  list-style-type: disc;
  padding-left: 1.5rem;
}

.rich-text-editor .tiptap ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
}

.rich-text-editor .tiptap li {
  margin-bottom: 0.25rem;
}
</style>

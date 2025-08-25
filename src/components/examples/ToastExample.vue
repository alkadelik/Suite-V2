<template>
  <div class="space-y-8 p-6">
    <div>
      <h1 class="mb-4 text-2xl font-bold text-gray-900">Toast System Demo</h1>
      <p class="text-gray-600">
        This demonstrates the custom toast notification system similar to vue-toastify.
      </p>
    </div>

    <!-- Basic Toast Examples -->
    <section>
      <h2 class="mb-4 text-lg font-semibold text-gray-800">Basic Toast Types</h2>
      <div class="flex flex-wrap gap-3">
        <AppButton label="Success Toast" color="success" @click="showSuccessToast" />
        <AppButton label="Error Toast" color="error" @click="showErrorToast" />
        <AppButton label="Info Toast" color="primary" @click="showInfoToast" />
      </div>
    </section>

    <!-- Advanced Toast Examples -->
    <section>
      <h2 class="mb-4 text-lg font-semibold text-gray-800">Advanced Examples</h2>
      <div class="flex flex-wrap gap-3">
        <AppButton
          label="Toast with Message"
          variant="outlined"
          color="primary"
          @click="showDetailedToast"
        />
        <AppButton
          label="Persistent Toast"
          variant="outlined"
          color="alt"
          @click="showPersistentToast"
        />
        <AppButton
          label="Custom Duration"
          variant="outlined"
          color="success"
          @click="showCustomDurationToast"
        />
      </div>
    </section>

    <!-- Bulk Actions -->
    <section>
      <h2 class="mb-4 text-lg font-semibold text-gray-800">Bulk Actions</h2>
      <div class="flex flex-wrap gap-3">
        <AppButton
          label="Show Multiple Toasts"
          variant="text"
          color="primary"
          @click="showMultipleToasts"
        />
        <AppButton label="Clear All Toasts" variant="text" color="error" @click="clearAll" />
      </div>
    </section>

    <!-- Usage Examples -->
    <section class="rounded-lg bg-gray-50 p-6">
      <h2 class="mb-4 text-lg font-semibold text-gray-800">Usage Examples</h2>
      <div class="space-y-4">
        <div>
          <h3 class="mb-2 text-sm font-medium text-gray-700">Basic Usage:</h3>
          <pre
            class="overflow-x-auto rounded bg-gray-900 p-3 text-sm text-gray-100"
          ><code>import { toast } from '@/composables/useToast'

// Simple notifications
toast.success('Operation completed!')
toast.error('Something went wrong')
toast.info('Here is some information')</code></pre>
        </div>

        <div>
          <h3 class="mb-2 text-sm font-medium text-gray-700">With Options:</h3>
          <pre
            class="overflow-x-auto rounded bg-gray-900 p-3 text-sm text-gray-100"
          ><code>toast.success('File uploaded!', {
  message: 'Your file has been uploaded successfully.',
  duration: 3000
})

toast.error('Upload failed', {
  message: 'Please check your connection and try again.',
  persistent: true // Won't auto-dismiss
})</code></pre>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import AppButton from "@/components/AppButton.vue"
import { toast } from "@/composables/useToast"

const showSuccessToast = () => {
  toast.success("Operation completed successfully!")
}

const showErrorToast = () => {
  toast.error("An error occurred")
}

const showInfoToast = () => {
  toast.info("Here is some useful information")
}

const showDetailedToast = () => {
  toast.success("Your document has been uploaded and processed successfully.", {
    title: "File uploaded!",
  })
}

const showPersistentToast = () => {
  toast.info("This toast will stay until manually dismissed.", {
    title: "Important Notice",
    persistent: true,
  })
}

const showCustomDurationToast = () => {
  toast.success("This will disappear in 2 seconds.", {
    title: '"Quick notification"',
    duration: 2000,
  })
}

const showMultipleToasts = () => {
  toast.info("First notification")
  setTimeout(() => toast.success("Second notification"), 500)
  setTimeout(() => toast.error("Third notification"), 1000)
}

const clearAll = () => {
  toast.clear()
}
</script>

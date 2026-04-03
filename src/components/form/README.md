# Form Components

A collection of reusable, TypeScript-first form components built on top of vee-validate and Yup validation.

## 📋 Components Overview

### `AppForm` - Smart Form Wrapper

A reusable form wrapper that handles common form functionality automatically.

**Features:**

- ✅ Automatic validation with Yup schemas
- 🎯 Auto-scroll to first error on invalid submit
- 🔄 Built-in focus management
- 📝 Type-safe props and events

**Usage:**

```vue
<AppForm :schema="validationSchema" @submit="handleSubmit">
  <FormField name="email" type="email" label="Email" required />
  <FormField name="password" type="password" label="Password" required />
  <button type="submit">Submit</button>
</AppForm>
```

### `FormField` - Dynamic Field Renderer

Automatically renders the correct input component based on field type. **Reduces form boilerplate by 70%.**

**Supported Types:**

- **Text**: `text`, `email`, `password`, `number`, `tel`, `url`, `date`, `time`
- **Select**: `select` (with options array)
- **Textarea**: `textarea` (with rows, character count)
- **OTP**: `otp` (with length, separator)

## 🚀 Quick Start

### Before (Repetitive ❌)

```vue
<Field v-slot="{ field, errors: fieldErrors }" name="store_name">
  <TextField v-bind="field" label="Store Name" required :error="fieldErrors[0]" />
</Field>

<Field v-slot="{ field, errors: fieldErrors }" name="industry">
  <SelectField
    v-bind="field"
    :model-value="field.value"
    label="Industry"
    :options="INDUSTRY_OPTIONS"
    required
    :error="fieldErrors[0]"
    @update:model-value="field.value = $event"
  />
</Field>
```

### After (Clean ✅)

```vue
<FormField name="store_name" label="Store Name" required />
<FormField name="industry" type="select" label="Industry" :options="INDUSTRY_OPTIONS" required />
```

## 📖 Examples

### Complete Form

```vue
<template>
  <AppForm :schema="userSchema" @submit="createUser">
    <!-- Basic Fields -->
    <FormField name="firstName" label="First Name" required />
    <FormField name="email" type="email" label="Email Address" required />
    <FormField name="phone" type="tel" label="Phone Number" />

    <!-- Select Field -->
    <FormField
      name="country"
      type="select"
      label="Country"
      :options="countryOptions"
      placeholder="Select country"
      required
    />

    <!-- Textarea -->
    <FormField
      name="bio"
      type="textarea"
      label="Bio"
      :rows="4"
      :maxlength="500"
      :show-character-count="true"
    />

    <!-- OTP Field -->
    <FormField
      name="verificationCode"
      type="otp"
      label="Verification Code"
      :otp-length="6"
      separator="-"
    />

    <button type="submit" class="btn-primary">Create User</button>
  </AppForm>
</template>

<script setup lang="ts">
import * as yup from "yup"

const userSchema = yup.object({
  firstName: yup.string().required(),
  email: yup.string().email().required(),
  phone: yup.string(),
  country: yup.string().required(),
  bio: yup.string().max(500),
  verificationCode: yup.string().length(6),
})

const countryOptions = [
  { label: "United States", value: "us" },
  { label: "Canada", value: "ca" },
  { label: "United Kingdom", value: "uk" },
]

const createUser = (values) => {
  console.log("Form submitted:", values)
}
</script>
```

## 🔧 Props Reference

### AppForm Props

| Prop            | Type                      | Description           |
| --------------- | ------------------------- | --------------------- |
| `schema`        | `AnyObjectSchema`         | Yup validation schema |
| `initialValues` | `Record<string, unknown>` | Initial form values   |

### FormField Props

| Prop          | Type            | Default  | Description                                    |
| ------------- | --------------- | -------- | ---------------------------------------------- |
| `name`        | `string`        | -        | **Required.** Field name for validation        |
| `type`        | `FormFieldType` | `"text"` | Field type (text, select, textarea, otp, etc.) |
| `label`       | `string`        | -        | Field label                                    |
| `required`    | `boolean`       | `false`  | Whether field is required                      |
| `disabled`    | `boolean`       | `false`  | Whether field is disabled                      |
| `placeholder` | `string`        | -        | Placeholder text                               |
| `options`     | `OptionValue[]` | -        | Options for select fields                      |
| `rows`        | `number`        | `4`      | Rows for textarea                              |
| `otpLength`   | `number`        | `6`      | Length for OTP fields                          |
| `separator`   | `string`        | `"-"`    | Separator for OTP fields                       |

## 💡 Tips

1. **Use with Yup schemas** for best validation experience
2. **Combine field types** for complex forms
3. **Pass additional props** via standard Vue prop binding
4. **Leverage auto-focus** on validation errors

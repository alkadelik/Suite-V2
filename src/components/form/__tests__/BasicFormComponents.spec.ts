import { defineComponent } from "vue"
import { mount, shallowMount } from "@vue/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { object, string } from "yup"

const validationMocks = vi.hoisted(() => ({ scrollToFirstInvalidField: vi.fn() }))
vi.mock("@/utils/validations", () => ({
  onInvalidSubmit: validationMocks.scrollToFirstInvalidField,
}))

import AppForm from "@components/form/AppForm.vue"
import Checkbox from "@components/form/Checkbox.vue"
import FieldGroupError from "@components/form/FieldGroupError.vue"
import OtpField from "@components/form/OtpField.vue"
import PasswordStrength from "@components/form/PasswordStrength.vue"
import RadioInputField from "@components/form/RadioInputField.vue"
import StepperField from "@components/form/StepperField.vue"
import Switch from "@components/form/Switch.vue"
import TextAreaField from "@components/form/TextAreaField.vue"
import TimeField from "@components/form/TimeField.vue"

const IconStub = defineComponent({
  name: "Icon",
  props: { name: String },
  template: '<span class="icon-stub" :data-name="name" />',
})

const AppButtonStub = defineComponent({
  name: "AppButton",
  props: { icon: String, disabled: Boolean },
  emits: ["click"],
  template:
    '<button type="button" :data-icon="icon" :disabled="disabled" @click="$emit(\'click\', $event)" />',
})

const FormStub = defineComponent({
  name: "FormStub",
  emits: ["submit", "invalid-submit"],
  methods: {
    submitValid() {
      this.$emit("submit", { name: "Ada" })
    },
    submitInvalid() {
      this.$emit("invalid-submit", { errors: { name: "Required" } })
    },
  },
  template:
    '<form><slot :errors="{}" :meta="{ valid: true }" :values="{ name: \'Ada\' }" :submit-count="0" :set-field-value="() => undefined" :validate-field="() => undefined" /></form>',
})

describe("basic reusable form components", () => {
  beforeEach(() => vi.clearAllMocks())

  it("AppForm exposes form state, emits valid values, and tracks invalid attempts", async () => {
    const wrapper = shallowMount(AppForm, {
      props: { schema: object({ name: string().required() }), initialValues: { name: "" } },
      slots: {
        default: `<template #default="{ values, submitAttempted, invalidSubmitCount }">
          <span class="value">{{ values.name }}</span>
          <span class="attempted">{{ submitAttempted }}</span>
          <span class="invalid-count">{{ invalidSubmitCount }}</span>
        </template>`,
      },
      global: { stubs: { Form: FormStub } },
    })
    const form = wrapper.findComponent(FormStub)
    expect(wrapper.find(".value").text()).toBe("Ada")
    expect(wrapper.find(".attempted").text()).toBe("false")
    ;(form.vm as unknown as { submitInvalid: () => void }).submitInvalid()
    await wrapper.vm.$nextTick()
    expect(validationMocks.scrollToFirstInvalidField).toHaveBeenCalledWith({
      errors: { name: "Required" },
    })
    expect(wrapper.find(".attempted").text()).toBe("true")
    expect(wrapper.find(".invalid-count").text()).toBe("1")
    ;(form.vm as unknown as { submitValid: () => void }).submitValid()
    expect(wrapper.emitted("submit")).toEqual([[{ name: "Ada" }]])
  })

  it("Checkbox renders label/slot, sizing, color, disabled state, and model updates", async () => {
    const wrapper = mount(Checkbox, {
      props: {
        modelValue: false,
        label: "Record expense",
        required: true,
        checkPosition: "right",
        checkColor: "#123456",
        size: 18,
      },
    })
    expect(wrapper.text()).toContain("Record expense")
    expect(wrapper.classes()).toContain("flex-row-reverse")
    const input = wrapper.find("input")
    expect(input.attributes("style")).toContain("accent-color: #123456")
    expect(input.attributes("style")).toContain("width: 18px")
    await input.setValue(true)
    expect(wrapper.emitted("update:modelValue")).toEqual([[true]])

    await (
      wrapper as unknown as { setProps: (props: { disabled: boolean }) => Promise<void> }
    ).setProps({ disabled: true })
    expect(input.attributes()).toHaveProperty("disabled")
    expect(wrapper.find("label").classes()).toContain("cursor-not-allowed")
  })

  it("FieldGroupError marks its validation target and capitalizes errors", () => {
    const wrapper = shallowMount(FieldGroupError, {
      props: { target: "variants", error: "select at least one variant", class: "custom-group" },
      slots: { default: "Variant controls" },
      global: { stubs: { Icon: IconStub } },
    })
    expect(wrapper.attributes("data-validation-target")).toBe("variants")
    expect(wrapper.classes()).toContain("custom-group")
    expect(wrapper.text()).toContain("Variant controls")
    expect(wrapper.text()).toContain("Select at least one variant")
  })

  it("RadioInputField renders metadata and emits only enabled, writable choices", async () => {
    const options = [
      { label: "Yes", value: true, description: "Enable it" },
      { label: "No", value: false, disabled: true },
      { label: "Later", value: "later" },
    ]
    const wrapper = mount(RadioInputField, {
      props: {
        modelValue: true,
        label: "Available?",
        options,
        required: true,
        hint: "Choose one",
        error: "Selection required",
        orientation: "vertical",
      },
    })
    expect(wrapper.text()).toContain("Available?")
    expect(wrapper.text()).toContain("Enable it")
    expect(wrapper.text()).toContain("Choose one")
    expect(wrapper.text()).toContain("Selection required")
    expect(wrapper.find("div.flex.gap-4").classes()).toContain("!flex-col")
    expect(wrapper.findAll("input")[0].attributes()).toHaveProperty("checked")
    expect(wrapper.findAll("input")[1].attributes()).toHaveProperty("disabled")

    await wrapper.findAll("input")[2].setValue()
    expect(wrapper.emitted("update:modelValue")).toEqual([["later"]])
    await wrapper.setProps({ readonly: true })
    await wrapper.findAll("input")[0].trigger("change")
    expect(wrapper.emitted("update:modelValue")).toHaveLength(1)
  })

  it("Switch exposes accessible state, sizes, toggles, and respects disabled", async () => {
    const wrapper = mount(Switch, {
      props: { modelValue: true, label: "Active", size: "xs" },
    })
    const button = wrapper.find('[role="switch"]')
    expect(wrapper.text()).toContain("Active")
    expect(button.attributes("aria-checked")).toBe("true")
    expect(button.classes()).toContain("h-4")
    await button.trigger("click")
    expect(wrapper.emitted("update:modelValue")).toEqual([[false]])
    await wrapper.setProps({ disabled: true })
    await button.trigger("click")
    expect(wrapper.emitted("update:modelValue")).toHaveLength(1)
  })

  it("TextAreaField handles input/focus/blur, counts characters, errors, and auto-resize", async () => {
    const wrapper = shallowMount(TextAreaField, {
      props: {
        modelValue: "Hello",
        label: "Notes",
        required: true,
        hint: "Optional context",
        maxlength: 20,
        showCharacterCount: true,
        autoResize: true,
      },
      global: { stubs: { Icon: IconStub } },
    })
    expect(wrapper.text()).toContain("Notes")
    expect(wrapper.text()).toContain("Optional context")
    expect(wrapper.text()).toContain("5/20")
    const textarea = wrapper.find("textarea")
    Object.defineProperty(textarea.element, "scrollHeight", { configurable: true, value: 96 })
    await textarea.setValue("Updated")
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["Updated"])
    expect(textarea.attributes("style")).toContain("height: 96px")
    await textarea.trigger("focus")
    await textarea.trigger("blur")
    expect(wrapper.emitted("focus")).toHaveLength(1)
    expect(wrapper.emitted("blur")).toHaveLength(1)

    await wrapper.setProps({ error: "notes are invalid" })
    expect(wrapper.text()).toContain("Notes are invalid")
    expect(wrapper.text()).not.toContain("Optional context")
  })

  it("TimeField formats 24-hour values, emits raw time, and opens the native picker", async () => {
    const wrapper = mount(TimeField, { props: { modelValue: "13:05", label: "From" } })
    expect(wrapper.text()).toContain("01:05 PM")
    const input = wrapper.find("input")
    const showPicker = vi.fn()
    Object.defineProperty(input.element, "showPicker", { configurable: true, value: showPicker })
    await input.trigger("click")
    expect(showPicker).toHaveBeenCalledOnce()
    await input.setValue("09:30")
    expect(wrapper.emitted("update:modelValue")).toEqual([["09:30"]])

    await wrapper.setProps({ modelValue: "bad" })
    expect(wrapper.text()).toContain("--:-- --")
  })

  it("StepperField sanitizes typed values and supports bounded increment/decrement", async () => {
    const wrapper = shallowMount(StepperField, {
      props: {
        modelValue: "2",
        label: "Quantity",
        prefix: "₦",
        suffix: "units",
        hint: "Choose quantity",
      },
      global: { stubs: { Icon: IconStub, AppButton: AppButtonStub } },
    })
    expect(wrapper.text()).toContain("₦")
    expect(wrapper.text()).toContain("units")
    const input = wrapper.find("input")
    await input.setValue("1a.2.3")
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["1.23"])
    const buttons = wrapper.findAllComponents(AppButtonStub)
    await buttons[1].trigger("click")
    await buttons[0].trigger("click")
    expect(wrapper.emitted("update:modelValue")?.slice(-2)).toEqual([["3"], ["1"]])

    await wrapper.setProps({ modelValue: 0 })
    await buttons[0].trigger("click")
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["0"])
  })

  it("PasswordStrength reports weak, medium, and strong criteria", async () => {
    const wrapper = shallowMount(PasswordStrength, {
      props: { modelValue: "abc" },
      global: { stubs: { Icon: IconStub } },
    })
    expect(wrapper.text()).toContain("Too weak")
    const setPassword = (modelValue: string) =>
      (
        wrapper as unknown as {
          setProps: (props: { modelValue: string }) => Promise<void>
        }
      ).setProps({ modelValue })
    await setPassword("Abcdefgh")
    expect(wrapper.text()).toContain("Could be better")
    await setPassword("Abcdefg!")
    expect(wrapper.text()).toContain("Strong Password")
    expect(wrapper.findAllComponents(IconStub)).toHaveLength(4)
  })

  it("OtpField initializes, filters input, advances focus, pastes, and resets", async () => {
    const wrapper = shallowMount(OtpField, {
      attachTo: document.body,
      props: { modelValue: "12", length: 4, label: "Code", error: "invalid code" },
      global: { stubs: { Icon: IconStub } },
    })
    await wrapper.vm.$nextTick()
    const inputs = wrapper.findAll("input")
    expect(inputs).toHaveLength(4)
    expect(inputs[0].element.value).toBe("1")
    expect(inputs[1].element.value).toBe("2")
    expect(wrapper.text()).toContain("—")
    expect(wrapper.text()).toContain("Invalid code")

    await inputs[2].setValue("x")
    expect(wrapper.emitted("update:modelValue")).toBeUndefined()
    await inputs[2].setValue("3")
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["123"])
    expect(document.activeElement).toBe(inputs[3].element)

    await inputs[0].trigger("paste", {
      clipboardData: { getData: () => "9a87" },
    })
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["987"])
    await wrapper.setProps({ modelValue: "" })
    expect(inputs.every((input) => input.element.value === "")).toBe(true)
    wrapper.unmount()
  })
})

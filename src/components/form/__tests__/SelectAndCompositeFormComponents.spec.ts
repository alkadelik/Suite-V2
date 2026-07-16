import { defineComponent } from "vue"
import { mount, shallowMount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  handleChange: vi.fn(),
  getPlacePredictions: vi.fn(),
}))

vi.mock("@vueuse/core", () => ({
  useMediaQuery: () => ({ value: false }),
  onClickOutside: vi.fn(),
}))
vi.mock("@/composables/useClickOutside", () => ({ useClickOutside: vi.fn() }))

import GooglePlacesAutocomplete from "@components/GooglePlacesAutocomplete.vue"
import FormField from "@components/form/FormField.vue"
import InputTagsField from "@components/form/InputTagsField.vue"
import PhoneInput from "@components/form/PhoneInput.vue"
import SelectField from "@components/form/SelectField.vue"
import SelectTagsField from "@components/form/SelectTagsField.vue"

const IconStub = defineComponent({
  name: "Icon",
  props: { name: String },
  template: '<span class="icon-stub" :data-name="name" />',
})

const FieldStub = defineComponent({
  name: "Field",
  props: { name: String },
  methods: {
    handleChange(value: unknown) {
      mocks.handleChange(value)
    },
  },
  template:
    '<div class="field-stub"><slot :field="{ value: \'initial\', onBlur: () => undefined, onInput: () => undefined, onChange: () => undefined }" :errors="[\'Field error\']" :handle-change="handleChange" /></div>',
})

const componentStub = (name: string) =>
  defineComponent({
    name,
    inheritAttrs: false,
    props: {
      modelValue: { type: null },
      label: String,
      options: Array,
      error: String,
      required: Boolean,
      disabled: Boolean,
      placement: String,
      type: String,
    },
    emits: ["update:modelValue"],
    template:
      '<div class="control-stub" :data-control="$options.name" @click="$emit(\'update:modelValue\', \'changed\')">{{ label }}</div>',
  })

const fieldStubs = {
  TextField: componentStub("TextField"),
  SelectField: componentStub("SelectField"),
  SelectTagsField: componentStub("SelectTagsField"),
  TextAreaField: componentStub("TextAreaField"),
  FileUploadField: componentStub("FileUploadField"),
  OtpField: componentStub("OtpField"),
  RadioInputField: componentStub("RadioInputField"),
  StepperField: componentStub("StepperField"),
  PhoneInput: componentStub("PhoneInput"),
  DateTimeField: componentStub("DateTimeField"),
}

describe("select, tag, and composite form components", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getPlacePredictions.mockImplementation(
      (_request: unknown, callback: (items: unknown[]) => void) =>
        callback([
          { description: "12 Admiralty Way, Lagos", place_id: "place-1" },
          { description: "13 Admiralty Way, Lagos", place_id: "place-2" },
        ]),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Reflect.deleteProperty(window, "google")
    document.head
      .querySelectorAll('script[src*="maps.googleapis.com"]')
      .forEach((script) => script.remove())
  })

  it("InputTagsField adds, rejects duplicates/limits, removes, clears, and supports weight tags", async () => {
    const wrapper = shallowMount(InputTagsField, {
      props: {
        modelValue: [{ label: "Red", value: "red" }],
        label: "Colours",
        clearable: true,
        maxTags: 2,
      },
      global: { stubs: { Icon: IconStub } },
    })
    expect(wrapper.text()).toContain("Red")
    const input = wrapper.find("input")
    await input.setValue("Blue")
    await input.trigger("keydown", { key: "Enter" })
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([
      [
        { label: "Red", value: "red" },
        { label: "Blue", value: "Blue" },
      ],
    ])

    await input.setValue("RED")
    await input.trigger("keydown", { key: "Enter" })
    expect(wrapper.emitted("update:modelValue")).toHaveLength(1)
    await wrapper.find("span button").trigger("click")
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([[]])
    await wrapper.findAll("button").at(-1)!.trigger("click")
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([[]])

    const weight = shallowMount(InputTagsField, {
      props: { modelValue: [], isWeightAttribute: true },
      global: { stubs: { Icon: IconStub } },
    })
    const weightInput = weight.find("input")
    await weightInput.setValue("1a.2.3")
    expect(weightInput.element.value).toBe("1.23")
    await weightInput.trigger("keydown", { key: "Enter" })
    expect(weight.emitted("update:modelValue")).toEqual([[[{ label: "1.23 kg", value: "1.23" }]]])
  })

  it("SelectField handles single selection, search events, clear, and loading/empty states", async () => {
    const options = [
      { label: "Lagos", value: "lagos" },
      { label: "Abuja", value: "abuja", icon: "location" },
    ]
    const wrapper = mount(SelectField, {
      props: { options, label: "State", searchable: true, clearable: true, modelValue: null },
      global: { stubs: { Icon: IconStub, Teleport: true, Transition: false } },
    })
    expect(wrapper.text()).toContain("Select option...")
    await wrapper.find(".relative.w-full").trigger("click")
    const search = wrapper.find('input[placeholder="Search options..."]')
    expect(search.exists()).toBe(true)
    await search.setValue("Abu")
    expect(wrapper.emitted("search-change")?.at(-1)).toEqual(["Abu"])
    const abuja = wrapper
      .findAll(".max-h-48 > div")
      .find((option) => option.text().includes("Abuja"))
    expect(abuja).toBeDefined()
    await abuja!.trigger("click")
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([options[1]])

    await wrapper.setProps({ modelValue: options[1] })
    expect(wrapper.text()).toContain("Abuja")
    const clear = wrapper.findAll("button").find((button) => button.text() === "×")
    await clear!.trigger("click")
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([null])

    await wrapper.setProps({ modelValue: null, loading: true })
    await wrapper.find(".relative.w-full").trigger("click")
    expect(wrapper.text()).toContain("Loading...")
  })

  it("SelectField supports multiple chips, removal, select all, and done", async () => {
    const options = ["Small", "Medium", "Large"]
    const wrapper = mount(SelectField, {
      props: {
        options,
        multiple: true,
        modelValue: ["Small", "Medium"],
        maxChipsDisplay: 1,
        clearable: true,
      },
      global: { stubs: { Icon: IconStub, Teleport: true, Transition: false } },
    })
    expect(wrapper.text()).toContain("Small")
    expect(wrapper.text()).toContain("+1 more")
    await wrapper.find(".relative.w-full").trigger("click")
    const selectAll = wrapper.findAll("button").find((button) => button.text() === "Select All")
    await selectAll!.trigger("click")
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["Small", "Medium", "Large"]])
    const chipRemove = wrapper.find(".bg-primary-100 button")
    await chipRemove.trigger("click")
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["Medium"]])
  })

  it("SelectTagsField filters available options, adds/removes values, and clears", async () => {
    const options = [
      { label: "Retail", value: "retail" },
      { label: "Wholesale", value: "wholesale", color: "blue" as const },
    ]
    const wrapper = mount(SelectTagsField, {
      props: {
        options,
        modelValue: ["retail"],
        label: "Channels",
        searchable: true,
        clearable: true,
      },
      global: { stubs: { Icon: IconStub, Transition: false } },
    })
    expect(wrapper.text()).toContain("Retail")
    expect(wrapper.text()).toContain("1 item selected")
    await wrapper.find(".relative.w-full").trigger("click")
    const search = wrapper.find('input[placeholder="Search options..."]')
    await search.setValue("whole")
    expect(wrapper.text()).toContain("Wholesale")
    expect(wrapper.text()).not.toContain("No options found")
    const option = wrapper.findAll(".max-h-48 > div").find((item) => item.text() === "Wholesale")
    await option!.trigger("click")
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["retail", "wholesale"]])
    await wrapper.find("span button").trigger("click")
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([[]])
    const clear = wrapper.findAll("button").find((button) => button.text() === "×")
    await clear!.trigger("click")
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([[]])
  })

  it("PhoneInput detects incoming countries, sanitizes local input, and changes dial codes", async () => {
    const wrapper = shallowMount(PhoneInput, {
      props: { modelValue: "+447700900123", label: "Phone", name: "phone" },
      global: { stubs: { Icon: IconStub } },
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain("+44")
    const phoneInput = wrapper.find('input[inputmode="tel"]')
    expect((phoneInput.element as HTMLInputElement).value).toBe("7700900123")
    await phoneInput.setValue("0812-34abc")
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["+4481234"])

    await wrapper.find("button").trigger("click")
    const search = wrapper.find('input[placeholder="Search country..."]')
    await search.setValue("Ghana")
    const ghana = wrapper.findAll("button").find((button) => button.text().includes("Ghana"))
    await ghana!.trigger("click")
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["+23381234"])
  })

  it("GooglePlacesAutocomplete requests restricted suggestions and emits selection", async () => {
    Object.defineProperty(window, "google", {
      configurable: true,
      value: {
        maps: {
          places: {
            AutocompleteService: class {
              getPlacePredictions = mocks.getPlacePredictions
            },
          },
        },
      },
    })
    const wrapper = mount(GooglePlacesAutocomplete, {
      props: { modelValue: "", label: "Address", required: true, countryRestriction: "ng" },
    })
    const input = wrapper.find("input")
    await input.setValue("Admiralty")
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["Admiralty"])
    expect(mocks.getPlacePredictions).toHaveBeenCalledWith(
      { input: "Admiralty", componentRestrictions: { country: "ng" } },
      expect.any(Function),
    )
    expect(wrapper.text()).toContain("12 Admiralty Way, Lagos")
    await wrapper.findAll(".cursor-pointer")[0].trigger("click")
    expect(wrapper.emitted("selected")?.[0]?.[0]).toMatchObject({ place_id: "place-1" })
    expect(input.element.value).toBe("12 Admiralty Way, Lagos")
  })

  it("GooglePlacesAutocomplete loads the Places script when Google is unavailable", () => {
    let appendedScript: HTMLScriptElement | undefined
    vi.spyOn(document.head, "appendChild").mockImplementation((node) => {
      appendedScript = node as HTMLScriptElement
      return node
    })
    mount(GooglePlacesAutocomplete)
    expect(appendedScript?.src).toContain("maps.googleapis.com")
    expect(appendedScript?.src).toContain("libraries=places")
  })

  it.each([
    ["text", "TextField"],
    ["select", "SelectField"],
    ["tags", "SelectTagsField"],
    ["textarea", "TextAreaField"],
    ["file", "FileUploadField"],
    ["otp", "OtpField"],
    ["radio", "RadioInputField"],
    ["stepper", "StepperField"],
    ["tel", "PhoneInput"],
    ["datetime", "DateTimeField"],
  ] as const)(
    "FormField routes type=%s through %s and vee-validate",
    async (type, componentName) => {
      const wrapper = shallowMount(FormField, {
        props: {
          name: "first_name",
          type,
          required: true,
          disabled: true,
          options: ["Small", { label: "Large", value: "large", color: "blue" }],
          radioOptions: [{ label: "Yes", value: "yes" }],
        },
        global: { stubs: { Field: FieldStub, ...fieldStubs } },
      })
      const control = wrapper.findComponent({ name: componentName })
      expect(control.exists()).toBe(true)
      expect(control.props("label")).toBe("First Name")
      expect(control.props("error")).toBe("Field error")
      expect(control.props("required")).toBe(true)
      if (type !== "datetime") expect(control.props("disabled")).toBe(true)
      await control.trigger("click")
      if (type === "datetime") expect(mocks.handleChange).not.toHaveBeenCalled()
      else expect(mocks.handleChange).toHaveBeenCalledWith("changed")
    },
  )

  it("FormField normalizes primitive and rich tag options", () => {
    const wrapper = shallowMount(FormField, {
      props: {
        name: "channels",
        type: "tags",
        options: ["Retail", { label: "Wholesale", value: 2, color: "blue", meta: "kept" }],
      },
      global: { stubs: { Field: FieldStub, ...fieldStubs } },
    })
    expect(wrapper.findComponent({ name: "SelectTagsField" }).props("options")).toEqual([
      { label: "Retail", value: "Retail" },
      { label: "Wholesale", value: 2, color: "blue", meta: "kept" },
    ])
  })
})

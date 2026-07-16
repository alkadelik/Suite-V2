import { defineComponent } from "vue"
import { mount, shallowMount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  convertAndCompressImage: vi.fn(),
  toastError: vi.fn(),
  toastInfo: vi.fn(),
  createObjectURL: vi.fn(() => "blob:preview"),
  revokeObjectURL: vi.fn(),
  editorHtml: "<p>Initial</p>",
  editorOnUpdate: undefined as
    | undefined
    | ((payload: { editor: { getHTML: () => string } }) => void),
  setContent: vi.fn(),
  focus: vi.fn(),
  toggleBold: vi.fn(),
  toggleItalic: vi.fn(),
  toggleUnderline: vi.fn(),
  toggleBulletList: vi.fn(),
  toggleOrderedList: vi.fn(),
}))

vi.mock("@/composables/useImageConverter", () => ({
  useImageConverter: () => ({ convertAndCompressImage: mocks.convertAndCompressImage }),
}))
vi.mock("@/composables/useToast", () => ({
  toast: { error: mocks.toastError, info: mocks.toastInfo },
}))
vi.mock("@tiptap/vue-3", async () => {
  const { ref } = await import("vue")
  const chain = {
    focus: () => {
      mocks.focus()
      return chain
    },
    toggleBold: () => {
      mocks.toggleBold()
      return chain
    },
    toggleItalic: () => {
      mocks.toggleItalic()
      return chain
    },
    toggleUnderline: () => {
      mocks.toggleUnderline()
      return chain
    },
    toggleBulletList: () => {
      mocks.toggleBulletList()
      return chain
    },
    toggleOrderedList: () => {
      mocks.toggleOrderedList()
      return chain
    },
    run: () => true,
  }
  const editor = {
    isActive: () => false,
    chain: () => chain,
    getHTML: () => mocks.editorHtml,
    commands: { setContent: mocks.setContent },
  }
  return {
    useEditor: (options: {
      onUpdate?: (payload: { editor: { getHTML: () => string } }) => void
    }) => {
      mocks.editorOnUpdate = options.onUpdate
      return ref(editor)
    },
    EditorContent: defineComponent({
      name: "EditorContent",
      template: '<div class="editor-content-stub" />',
    }),
  }
})
vi.mock("@tiptap/starter-kit", () => ({ default: { configure: () => ({}) } }))
vi.mock("@tiptap/extension-underline", () => ({ default: {} }))
vi.mock("@tiptap/extension-placeholder", () => ({ default: { configure: () => ({}) } }))

import ColorPickerField from "@components/form/ColorPickerField.vue"
import DateTimeField from "@components/form/DateTimeField.vue"
import FileUploadField from "@components/form/FileUploadField.vue"
import MultiFileInput from "@components/form/MultiFileInput.vue"
import ProductImageUploader from "@components/form/ProductImageUploader.vue"
import RichTextEditor from "@components/form/RichTextEditor.vue"

const IconStub = defineComponent({
  name: "Icon",
  props: { name: String },
  template: '<span class="icon-stub" :data-name="name" />',
})

const ChipStub = defineComponent({
  name: "Chip",
  props: { label: String },
  template: '<span class="chip-stub">{{ label }}</span>',
})

const SketchStub = defineComponent({
  name: "Sketch",
  props: { modelValue: String },
  emits: ["update:modelValue"],
  template:
    "<button class=\"sketch-stub\" @click=\"$emit('update:modelValue', { hex: '#ABCDEF' })\">{{ modelValue }}</button>",
})

const DropdownStub = defineComponent({
  name: "Dropdown",
  emits: ["hide"],
  methods: {
    hide() {
      this.$emit("hide")
    },
  },
  template: '<div class="dropdown-stub"><slot/><slot name="popper" :hide="hide"/></div>',
})

const setFiles = (input: HTMLInputElement, files: File[]) => {
  Object.defineProperty(input, "files", { configurable: true, value: files })
}

describe("advanced reusable form components", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.convertAndCompressImage.mockImplementation((file: File) => Promise.resolve(file))
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: mocks.createObjectURL,
      revokeObjectURL: mocks.revokeObjectURL,
    })
  })

  afterEach(() => {
    document.body.style.overflow = ""
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it("ColorPickerField normalizes values and supports mouse, keyboard, color, and close paths", async () => {
    const wrapper = mount(ColorPickerField, {
      props: { modelValue: "#abc", label: "Brand colour", required: true, hint: "Pick one" },
      global: {
        stubs: { Icon: IconStub, Sketch: SketchStub, Teleport: true, Transition: false },
      },
    })
    const trigger = wrapper.find('button[aria-haspopup="true"]')
    expect(wrapper.text()).toContain("#AABBCC")
    expect(trigger.attributes("aria-expanded")).toBe("false")
    await trigger.trigger("keydown", { key: "Enter" })
    expect(wrapper.emitted("open")).toHaveLength(1)
    expect(document.body.style.overflow).toBe("hidden")
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    await wrapper.find(".sketch-stub").trigger("click")
    expect(wrapper.emitted("update:modelValue")).toEqual([["#ABCDEF"]])
    await wrapper.find('button[aria-label="Close color picker"]').trigger("click")
    expect(wrapper.emitted("close")).toHaveLength(1)
    expect(document.body.style.overflow).toBe("")

    await wrapper.setProps({ disabled: true })
    await trigger.trigger("click")
    expect(wrapper.emitted("open")).toHaveLength(1)
  })

  it("DateTimeField formats values, blocks minimum dates, changes time/date, and clears", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 16, 10, 0))
    const initial = new Date(2026, 6, 16, 13, 30).toISOString()
    const wrapper = mount(DateTimeField, {
      props: {
        modelValue: initial,
        label: "Starts at",
        clearable: true,
        minDate: new Date(2026, 6, 10),
      },
      global: { stubs: { Dropdown: DropdownStub, VDropdown: DropdownStub, Icon: IconStub } },
    })
    expect(wrapper.text()).toContain("16th Jul, 2026 - 01:30 PM")
    expect(
      wrapper.findAll("button").filter((button) => button.attributes("aria-label")),
    ).toHaveLength(44)
    const disabledDay = wrapper.find('button[aria-label="9 July 2026"]')
    expect(disabledDay.attributes()).toHaveProperty("disabled")
    await disabledDay.trigger("click")
    expect(wrapper.emitted("update:modelValue")).toBeUndefined()

    await wrapper.find('button[aria-label="20 July 2026"]').trigger("click")
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toContain("2026-07-20")
    const selects = wrapper.findAll("select")
    await selects[1].setValue("45")
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toContain(":45:")
    const clear = wrapper.findAll("button").find((button) => button.text() === "Clear")
    await clear!.trigger("click")
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([null])
    expect(wrapper.findComponent(DropdownStub).emitted("hide")).toHaveLength(1)
  })

  it("FileUploadField accepts files/drop, truncates long names, previews URLs, and removes", async () => {
    const wrapper = shallowMount(FileUploadField, {
      props: { modelValue: null, label: "Document" },
      global: { stubs: { Icon: IconStub } },
    })
    const longName = `${"a".repeat(120)}.pdf`
    const file = new File(["content"], longName, { type: "application/pdf" })
    const input = wrapper.find('input[type="file"]')
    setFiles(input.element as HTMLInputElement, [file])
    await input.trigger("change")
    const emittedFile = wrapper.emitted("update:modelValue")?.[0]?.[0] as File
    expect(emittedFile.name.length).toBe(99)
    expect(wrapper.text()).toContain(emittedFile.name)

    await wrapper.find("button").trigger("click")
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([null])

    await wrapper.setProps({ modelValue: "https://cdn.example.com/photo.jpg" })
    expect(wrapper.find("img").attributes("src")).toBe("https://cdn.example.com/photo.jpg")
  })

  it("MultiFileInput enforces gated slots, validates/caps files, converts, emits primary, and removes", async () => {
    const wrapper = shallowMount(MultiFileInput, {
      props: {
        numberOfImages: 3,
        modelValue: [],
        productImageMode: true,
        enabledSlots: 2,
        showMakePrimaryButton: true,
      },
      global: { stubs: { Icon: IconStub, Chip: ChipStub } },
    })
    expect(wrapper.findAll('input[type="file"]')).toHaveLength(3)
    expect(wrapper.text()).toContain("Bloom")
    const valid = new File(["image"], "one.png", { type: "image/png" })
    const second = new File(["image"], "two.jpg", { type: "image/jpeg" })
    const excess = new File(["image"], "three.webp", { type: "image/webp" })
    const firstInput = wrapper.findAll('input[type="file"]')[0]
    setFiles(firstInput.element as HTMLInputElement, [valid, second, excess])
    await firstInput.trigger("change")
    await wrapper.vm.$nextTick()
    expect(mocks.toastInfo).toHaveBeenCalledWith("Too many files selected. 1 file will be ignored.")
    expect(mocks.convertAndCompressImage).toHaveBeenCalledTimes(2)
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual([valid, second, null])

    const actionButtons = wrapper.findAll("button")
    await actionButtons[0].trigger("click")
    expect(wrapper.emitted("make-primary")).toEqual([[0]])
    await actionButtons[1].trigger("click")
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual([null, second, null])

    const invalid = new File(["text"], "bad.txt", { type: "text/plain" })
    const secondInput = wrapper.findAll('input[type="file"]')[1]
    setFiles(secondInput.element as HTMLInputElement, [invalid])
    await secondInput.trigger("change")
    expect(mocks.toastError).toHaveBeenCalledWith(expect.stringContaining("is not allowed"))
  })

  it("ProductImageUploader converts, previews, rejects oversized files, and removes new uploads", async () => {
    const wrapper = shallowMount(ProductImageUploader, {
      props: { modelValue: null, label: "Product image", showPrimaryLabel: true },
      global: { stubs: { Icon: IconStub, Chip: ChipStub } },
    })
    const video = new File(["video"], "clip.mp4", { type: "video/mp4" })
    const input = wrapper.find('input[type="file"]')
    setFiles(input.element as HTMLInputElement, [video])
    await input.trigger("change")
    await wrapper.vm.$nextTick()
    expect(mocks.convertAndCompressImage).toHaveBeenCalledWith(video)
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([video])
    expect(wrapper.find("video").attributes("src")).toBe("blob:preview")
    expect(wrapper.text()).toContain("Primary")
    await wrapper.find("button").trigger("click")
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([null])

    const oversized = new File(["x"], "large.png", { type: "image/png" })
    Object.defineProperty(oversized, "size", { configurable: true, value: 16 * 1024 * 1024 })
    setFiles(input.element as HTMLInputElement, [oversized])
    await input.trigger("change")
    expect(mocks.toastError).toHaveBeenCalledWith(expect.stringContaining("15MB limit"))
  })

  it("ProductImageUploader treats URL models as edit mode and invokes the file chooser", async () => {
    const wrapper = shallowMount(ProductImageUploader, {
      props: { modelValue: "https://cdn.example.com/product.png" },
      global: { stubs: { Icon: IconStub, Chip: ChipStub } },
    })
    expect(wrapper.find("img").attributes("src")).toBe("https://cdn.example.com/product.png")
    const click = vi.spyOn(wrapper.find('input[type="file"]').element as HTMLInputElement, "click")
    await wrapper.find("button").trigger("click")
    expect(click).toHaveBeenCalledOnce()
  })

  it("RichTextEditor configures toolbars, emits updates, executes commands, and syncs external HTML", async () => {
    const wrapper = shallowMount(RichTextEditor, {
      props: {
        modelValue: "<p>Initial</p>",
        label: "Description",
        required: true,
        hint: "Format it",
      },
    })
    expect(wrapper.text()).toContain("Description")
    expect(wrapper.text()).toContain("Format it")
    const buttons = wrapper.findAll("button")
    await buttons[0].trigger("click")
    await buttons[1].trigger("click")
    await buttons[2].trigger("click")
    expect(mocks.toggleBold).toHaveBeenCalledOnce()
    expect(mocks.toggleItalic).toHaveBeenCalledOnce()
    expect(mocks.toggleUnderline).toHaveBeenCalledOnce()

    mocks.editorHtml = "<p>Updated</p>"
    mocks.editorOnUpdate?.({ editor: { getHTML: () => mocks.editorHtml } })
    expect(wrapper.emitted("update:modelValue")).toEqual([["<p>Updated</p>"]])
    await wrapper.setProps({ modelValue: "<p>External</p>" })
    expect(mocks.setContent).toHaveBeenCalledWith("<p>External</p>", { emitUpdate: false })
  })
})

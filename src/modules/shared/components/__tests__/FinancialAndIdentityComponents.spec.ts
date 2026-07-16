import { defineComponent } from "vue"
import { mount, shallowMount } from "@vue/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  banks: { value: { data: { data: [{ name: "Access Bank", code: "044" }] } } },
  resolveAccount: vi.fn(),
  createBankAccount: vi.fn(),
  submitKYC: vi.fn(),
  toastSuccess: vi.fn(),
  displayError: vi.fn(),
}))

vi.mock("@/composables/useFormatCurrency", () => ({
  useFormatCurrency: () => ({ format: (value: number) => `NGN ${value.toLocaleString("en-US")}` }),
}))
vi.mock("@/composables/useToast", () => ({ toast: { success: mocks.toastSuccess } }))
vi.mock("@/utils/error-handler", () => ({ displayError: mocks.displayError }))
vi.mock("@modules/shared/api", async () => {
  const { computed } = await import("vue")
  return {
    useGetSupportedBanks: () => ({ data: computed(() => mocks.banks.value) }),
    useResolveBankAccount: () => ({
      mutate: mocks.resolveAccount,
      isPending: computed(() => false),
    }),
    useCreateBankAccount: () => ({
      mutate: mocks.createBankAccount,
      isPending: computed(() => false),
    }),
    useSubmitKYC: () => ({ mutate: mocks.submitKYC, isPending: computed(() => false) }),
  }
})

import BankAccountModal from "@modules/shared/components/BankAccountModal.vue"
import ExpenseRecordCard from "@modules/shared/components/ExpenseRecordCard.vue"
import VerifyIdentityModal from "@modules/shared/components/VerifyIdentityModal.vue"

const CheckboxStub = defineComponent({
  name: "Checkbox",
  props: { modelValue: Boolean },
  emits: ["update:modelValue"],
  template:
    '<button class="checkbox-stub" @click="$emit(\'update:modelValue\', !modelValue)">{{ modelValue }}</button>',
})

const ModalStub = defineComponent({
  name: "Modal",
  props: { open: Boolean, title: String },
  emits: ["close"],
  template:
    '<section v-if="open"><button class="modal-close" @click="$emit(\'close\')"/><slot /></section>',
})

const AppButtonStub = defineComponent({
  name: "AppButton",
  props: { label: String, disabled: Boolean },
  template: '<button :disabled="disabled">{{ label }}</button>',
})

const AppFormStub = defineComponent({
  name: "AppForm",
  emits: ["submit"],
  data: () => ({ values: {} as Record<string, unknown> }),
  template:
    '<form @submit.prevent="$emit(\'submit\', values)"><slot :values="values"/><button class="form-submit" type="submit">submit</button></form>',
})

describe("reusable financial and identity components", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.banks.value = { data: { data: [{ name: "Access Bank", code: "044" }] } }
  })

  it("ExpenseRecordCard calculates comma-formatted costs, supports copy overrides, and emits its checkbox model", async () => {
    const wrapper = mount(ExpenseRecordCard, {
      props: {
        modelValue: true,
        quantity: 3,
        unitCost: "1,250.50",
        title: "Track purchase",
        description: "Include it in reporting",
        amountLabel: "Recorded total",
      },
      global: { stubs: { Checkbox: CheckboxStub } },
    })

    expect(wrapper.text()).toContain("Track purchase")
    expect(wrapper.text()).toContain("Include it in reporting")
    expect(wrapper.text()).toContain("Recorded total: NGN 3,751.5")
    await wrapper.findComponent(CheckboxStub).trigger("click")
    expect(wrapper.emitted("update:modelValue")).toEqual([[false]])

    await wrapper.setProps({ quantity: 0, missingAmountText: "Enter cost details" })
    expect(wrapper.text()).toContain("Enter cost details")
    await wrapper.setProps({ modelValue: false })
    expect(wrapper.text()).not.toContain("Enter cost details")
  })

  it("BankAccountModal exposes bank options, resolves complete account details, and submits the mapped payload", async () => {
    mocks.resolveAccount.mockImplementation((_payload, options) =>
      options.onSuccess({ data: { data: { data: { account_name: "Ada Lovelace" } } } }),
    )
    mocks.createBankAccount.mockImplementation((_payload, options) => options.onSuccess())
    const wrapper = mount(BankAccountModal, {
      props: { modelValue: true },
      global: {
        stubs: { Modal: ModalStub, AppForm: AppFormStub, AppButton: AppButtonStub },
      },
    })

    const fields = wrapper.findAllComponents({ name: "FormField" })
    expect(fields[1].props("options")).toEqual([{ label: "Access Bank", value: "044" }])

    const form = wrapper.findComponent(AppFormStub)
    await form.setData({
      values: {
        account_number: "0123456789",
        bank_code: { label: "Access Bank", value: "044" },
      },
    })
    expect(mocks.resolveAccount).toHaveBeenCalledWith(
      { account_number: "0123456789", bank_code: "044" },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: mocks.displayError }),
    )
    expect(wrapper.text()).toContain("Ada Lovelace")

    form.vm.$emit("submit", {
      account_number: "0123456789",
      bank_code: { label: "Access Bank", value: "044" },
    })
    await wrapper.vm.$nextTick()
    expect(mocks.createBankAccount).toHaveBeenCalledWith(
      { account_number: "0123456789", bank_code: "044", bank_name: "Access Bank" },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    )
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Bank account details saved!")
    expect(wrapper.emitted("update:modelValue")).toEqual([[false]])
    expect(wrapper.emitted("refresh")).toHaveLength(1)
  })

  it("BankAccountModal clears resolution state for incomplete input and displays a missing-name response", async () => {
    mocks.resolveAccount.mockImplementation((_payload, options) =>
      options.onSuccess({ data: { data: { data: {} } } }),
    )
    const wrapper = mount(BankAccountModal, {
      props: { modelValue: true },
      global: { stubs: { Modal: ModalStub, AppForm: AppFormStub, AppButton: AppButtonStub } },
    })
    const form = wrapper.findComponent(AppFormStub)
    await form.setData({
      values: { account_number: "0123456789", bank_code: { label: "Bank", value: "001" } },
    })
    expect(wrapper.text()).toContain("No account name found.")
    await form.setData({ values: { account_number: "12", bank_code: null } })
    expect(wrapper.text()).not.toContain("No account name found.")
  })

  it("VerifyIdentityModal builds the KYC FormData and completes the modal lifecycle", async () => {
    mocks.submitKYC.mockImplementation((_payload, options) => options.onSuccess())
    const wrapper = shallowMount(VerifyIdentityModal, {
      props: { modelValue: true },
      global: { stubs: { Modal: ModalStub, AppForm: AppFormStub, AppButton: AppButtonStub } },
    })
    const document = new File(["identity"], "identity.png", { type: "image/png" })
    const form = wrapper.findComponent(AppFormStub)
    form.vm.$emit("submit", {
      id_type: { value: "national_id" },
      id_document: document,
      id_number: "A1234",
      bvn: "12345678901",
    })
    await wrapper.vm.$nextTick()

    const payload = mocks.submitKYC.mock.calls[0][0] as FormData
    expect(payload.get("doc_type")).toBe("national_id")
    expect(payload.get("doc_number")).toBe("A1234")
    expect(payload.get("bvn")).toBe("12345678901")
    expect(payload.get("file")).toBe(document)
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Identity verification submitted successfully!")
    expect(wrapper.emitted("update:modelValue")).toEqual([[false]])
    expect(wrapper.emitted("refresh")).toHaveLength(1)
  })

  it("bank and identity modals forward close events", async () => {
    for (const Component of [BankAccountModal, VerifyIdentityModal]) {
      const wrapper = shallowMount(Component, {
        props: { modelValue: true },
        global: { stubs: { Modal: ModalStub, AppForm: AppFormStub, AppButton: AppButtonStub } },
      })
      await wrapper.find(".modal-close").trigger("click")
      expect(wrapper.emitted("update:modelValue")).toEqual([[false]])
    }
  })
})

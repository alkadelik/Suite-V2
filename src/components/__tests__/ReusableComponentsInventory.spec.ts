import { describe, expect, it } from "vitest"

const componentModules = {
  ...import.meta.glob("../**/*.vue"),
  ...import.meta.glob("../../modules/shared/components/**/*.vue"),
}

const testedComponents = [
  "src/components/AppButton.vue",
  "src/components/AppSection.vue",
  "src/components/Avatar.vue",
  "src/components/BackButton.vue",
  "src/components/Chip.vue",
  "src/components/Collapsible.vue",
  "src/components/ConfirmationModal.vue",
  "src/components/Container.vue",
  "src/components/DataTable.vue",
  "src/components/DeleteConfirmationModal.vue",
  "src/components/DonutChart.vue",
  "src/components/Drawer.vue",
  "src/components/DropdownMenu.vue",
  "src/components/EmptyState.vue",
  "src/components/GooglePlacesAutocomplete.vue",
  "src/components/Icon.vue",
  "src/components/IconHeader.vue",
  "src/components/InfoBox.vue",
  "src/components/ListFilterDrawer.vue",
  "src/components/LoadingIcon.vue",
  "src/components/MessageModal.vue",
  "src/components/MetricsGrid.vue",
  "src/components/Modal.vue",
  "src/components/NotificationItem.vue",
  "src/components/NotificationModal.vue",
  "src/components/NotificationsDrawer.vue",
  "src/components/PageHeader.vue",
  "src/components/PageSummaryCards.vue",
  "src/components/ProductAvatar.vue",
  "src/components/ProductSelectionItem.vue",
  "src/components/SectionHeader.vue",
  "src/components/StatCard.vue",
  "src/components/StepperWizard.vue",
  "src/components/StorefrontNotLiveBanner.vue",
  "src/components/SuccessModal.vue",
  "src/components/SummaryCards.vue",
  "src/components/Tabs.vue",
  "src/components/WarningBox.vue",
  "src/components/WhatsNewModal.vue",
  "src/components/core/LogoutModal.vue",
  "src/components/core/SupportModal.vue",
  "src/components/core/ToastContainer.vue",
  "src/components/form/AppForm.vue",
  "src/components/form/Checkbox.vue",
  "src/components/form/ColorPickerField.vue",
  "src/components/form/DateTimeField.vue",
  "src/components/form/FieldGroupError.vue",
  "src/components/form/FileUploadField.vue",
  "src/components/form/FormField.vue",
  "src/components/form/InputTagsField.vue",
  "src/components/form/MultiFileInput.vue",
  "src/components/form/OtpField.vue",
  "src/components/form/PasswordStrength.vue",
  "src/components/form/PhoneInput.vue",
  "src/components/form/ProductImageUploader.vue",
  "src/components/form/RadioInputField.vue",
  "src/components/form/RichTextEditor.vue",
  "src/components/form/SelectField.vue",
  "src/components/form/SelectTagsField.vue",
  "src/components/form/StepperField.vue",
  "src/components/form/Switch.vue",
  "src/components/form/TextAreaField.vue",
  "src/components/form/TextField.vue",
  "src/components/form/TimeField.vue",
  "src/modules/shared/components/BankAccountModal.vue",
  "src/modules/shared/components/ConfigureDeliveryModal.vue",
  "src/modules/shared/components/ConfigurePickupModal.vue",
  "src/modules/shared/components/ConsentBanner.vue",
  "src/modules/shared/components/ExpenseRecordCard.vue",
  "src/modules/shared/components/ManageManualDeliveryModal.vue",
  "src/modules/shared/components/ManageShipBubbleModal.vue",
  "src/modules/shared/components/ShipbubbleAccountSetup.vue",
  "src/modules/shared/components/TrialActivationModal.vue",
  "src/modules/shared/components/VerifyIdentityModal.vue",
  "src/modules/shared/components/WelcomeToTeamModal.vue",
  "src/modules/shared/components/dashboard/AwarenessRail.vue",
  "src/modules/shared/components/dashboard/DashboardGreeting.vue",
  "src/modules/shared/components/dashboard/HealthVitalCard.vue",
  "src/modules/shared/components/dashboard/HealthVitalsStrip.vue",
  "src/modules/shared/components/dashboard/OrdersInFlightPanel.vue",
  "src/modules/shared/components/dashboard/PopupRow.vue",
  "src/modules/shared/components/dashboard/PopupsPanel.vue",
  "src/modules/shared/components/dashboard/QuickActionRow.vue",
  "src/modules/shared/components/dashboard/QuickOverviewModal.vue",
  "src/modules/shared/components/dashboard/ReceivableRow.vue",
  "src/modules/shared/components/dashboard/ReceivablesPanel.vue",
  "src/modules/shared/components/dashboard/SeeAllDrawer.vue",
  "src/modules/shared/components/dashboard/TaskCard.vue",
  "src/modules/shared/components/dashboard/TaskCardAggregate.vue",
  "src/modules/shared/components/dashboard/TaskCardFlat.vue",
  "src/modules/shared/components/dashboard/TaskRow.vue",
  "src/modules/shared/components/dashboard/UrgencyBars.vue",
  "src/modules/shared/components/dashboard/Worklist.vue",
  "src/modules/shared/components/skeletons/ConfigureDeliverySkeleton.vue",
  "src/modules/shared/components/skeletons/OnboardingSkeleton.vue",
] as const

const discoveredComponents = Object.keys(componentModules)
  .map((path) => {
    if (path.startsWith("../../modules/")) return `src/${path.slice(6)}`
    return path.replace(/^\.\.\//, "src/components/")
  })
  .sort()

describe("reusable component test inventory", () => {
  it("keeps every reusable Vue component in the audited test matrix", () => {
    expect(discoveredComponents).toEqual([...testedComponents].sort())
  })

  it("does not contain duplicate inventory entries", () => {
    expect(new Set(testedComponents).size).toBe(testedComponents.length)
  })
})

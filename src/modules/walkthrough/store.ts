import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { getWalkthrough, WALKTHROUGH_RELEASE_VERSION } from "./registry"
import type {
  WalkthroughCommand,
  WalkthroughEvent,
  WalkthroughId,
  WalkthroughProgress,
} from "./types"

type UserProgress = Partial<Record<WalkthroughId, WalkthroughProgress>>

export const useWalkthroughStore = defineStore(
  "walkthroughs",
  () => {
    const releaseSeenByUser = ref<Record<string, Record<string, boolean>>>({})
    const progressByUser = ref<Record<string, UserProgress>>({})

    const activeId = ref<WalkthroughId | null>(null)
    const activeUserId = ref<string | null>(null)
    const command = ref<WalkthroughCommand | null>(null)
    const commandNonce = ref(0)
    const completedId = ref<WalkthroughId | null>(null)

    const activeProgress = computed(() => {
      if (!activeId.value || !activeUserId.value) return null
      return progressByUser.value[activeUserId.value]?.[activeId.value] ?? null
    })

    const activeDefinition = computed(() =>
      activeId.value ? getWalkthrough(activeId.value) : null,
    )

    const activeStep = computed(() => {
      const definition = activeDefinition.value
      const progress = activeProgress.value
      if (!definition || !progress || progress.status !== "active") return null
      return definition.steps[progress.stepIndex] ?? null
    })

    function ensureUser(userId: string): UserProgress {
      progressByUser.value[userId] ??= {}
      return progressByUser.value[userId]
    }

    function hasSeenRelease(userId: string): boolean {
      return releaseSeenByUser.value[userId]?.[WALKTHROUGH_RELEASE_VERSION] === true
    }

    function markReleaseSeen(userId: string): void {
      releaseSeenByUser.value[userId] ??= {}
      releaseSeenByUser.value[userId][WALKTHROUGH_RELEASE_VERSION] = true
    }

    function start(id: WalkthroughId, userId: string): void {
      const definition = getWalkthrough(id)
      activeId.value = id
      activeUserId.value = userId
      command.value = null
      completedId.value = null
      ensureUser(userId)[id] = {
        version: definition.version,
        status: "active",
        stepIndex: 0,
        updatedAt: Date.now(),
        context: {},
      }
    }

    function resumeForUser(userId: string): void {
      const progress = ensureUser(userId)
      const resumable = (Object.entries(progress) as [WalkthroughId, WalkthroughProgress][]).find(
        ([id, value]) => value.status === "active" && value.version === getWalkthrough(id).version,
      )
      activeUserId.value = userId
      activeId.value = resumable?.[0] ?? null
    }

    function updateActive(patch: Partial<WalkthroughProgress>): void {
      if (!activeId.value || !activeUserId.value || !activeProgress.value) return
      ensureUser(activeUserId.value)[activeId.value] = {
        ...activeProgress.value,
        ...patch,
        updatedAt: Date.now(),
      }
    }

    function advance(): void {
      const definition = activeDefinition.value
      const progress = activeProgress.value
      if (!definition || !progress) return
      if (progress.stepIndex >= definition.steps.length - 1) {
        complete()
        return
      }
      updateActive({ stepIndex: progress.stepIndex + 1 })
    }

    function back(): void {
      const progress = activeProgress.value
      if (!progress || progress.stepIndex === 0) return
      updateActive({ stepIndex: progress.stepIndex - 1 })
    }

    function complete(): void {
      const id = activeId.value
      updateActive({ status: "completed" })
      activeId.value = null
      command.value = null
      completedId.value = id
    }

    function dismiss(): void {
      updateActive({ status: "dismissed" })
      activeId.value = null
      command.value = null
    }

    function report(event: WalkthroughEvent, payload?: { uid?: string }): void {
      if (event === "pickup-settings-saved" && activeId.value === "pickup-times") {
        complete()
        return
      }
      const step = activeStep.value
      if (!step || step.advanceOn !== event) return
      if (event === "discount-created") {
        if (!payload?.uid) return
        updateActive({
          context: { ...activeProgress.value?.context, createdDiscountUid: payload.uid },
        })
      }
      advance()
    }

    function requestCommand(nextCommand: WalkthroughCommand): void {
      command.value = nextCommand
      commandNonce.value += 1
    }

    function clearCommand(): void {
      command.value = null
    }

    function clearCompletion(): void {
      completedId.value = null
    }

    return {
      releaseSeenByUser,
      progressByUser,
      activeId,
      activeUserId,
      activeProgress,
      activeDefinition,
      activeStep,
      command,
      commandNonce,
      completedId,
      hasSeenRelease,
      markReleaseSeen,
      start,
      resumeForUser,
      advance,
      back,
      complete,
      dismiss,
      report,
      requestCommand,
      clearCommand,
      clearCompletion,
    }
  },
  {
    persist: {
      paths: ["releaseSeenByUser", "progressByUser"],
    },
  },
)

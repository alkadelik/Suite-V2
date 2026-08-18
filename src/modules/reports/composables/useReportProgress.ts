import { computed, onScopeDispose, ref, toValue, watch, type MaybeRefOrGetter } from "vue"

export type TReportStep = { label: string; icon: string }
export type TReportStepState = "done" | "active" | "pending"

/** Reports typically land in ~30s, so the checklist is paced across that window. */
const DEFAULT_DURATION = 30_000
/** Multiple of the expected window after which we tell the user it's running late. */
const OVERDUE_MULTIPLIER = 3
/** Beat between the last step ticking green and the report being revealed. */
const REVEAL_DELAY = 900
const TICK = 500

type TOptions = {
  /** Expected total generation time, spread evenly across the steps. */
  duration?: number
  /** Epoch ms the generation actually started — lets progress survive a remount. */
  startedAt?: MaybeRefOrGetter<number | null | undefined>
  revealDelay?: number
}

/**
 * Drives the "generating report" checklist: steps tick over from first to last on a
 * timer while the report is being built, then all complete together once it lands.
 */
export function useReportProgress(
  steps: MaybeRefOrGetter<TReportStep[]>,
  isActive: MaybeRefOrGetter<boolean>,
  options: TOptions = {},
) {
  const { duration = DEFAULT_DURATION, revealDelay = REVEAL_DELAY } = options

  const elapsed = ref(0)
  const isComplete = ref(false)
  let ticker: ReturnType<typeof setInterval> | null = null
  let revealTimer: ReturnType<typeof setTimeout> | null = null
  let startTime = 0

  const stepCount = computed(() => toValue(steps).length || 1)
  const stepDuration = computed(() => duration / stepCount.value)

  const currentStep = computed(() => {
    if (isComplete.value) return stepCount.value
    // The last step holds until the report actually arrives, rather than completing
    // on the timer and leaving the user staring at a finished list with no report.
    return Math.min(stepCount.value - 1, Math.floor(elapsed.value / stepDuration.value))
  })

  const stepStates = computed<TReportStepState[]>(() =>
    toValue(steps).map((_, index) => {
      if (index < currentStep.value) return "done"
      if (index === currentStep.value) return "active"
      return "pending"
    }),
  )

  /** Capped below 100 while running — only a delivered report finishes the bar. */
  const progress = computed(() => {
    if (isComplete.value) return 100
    return Math.min(95, Math.round((elapsed.value / duration) * 100))
  })

  const isOverdue = computed(
    () => !isComplete.value && elapsed.value > duration * OVERDUE_MULTIPLIER,
  )

  const stopTicker = () => {
    if (ticker) clearInterval(ticker)
    ticker = null
  }

  const clearReveal = () => {
    if (revealTimer) clearTimeout(revealTimer)
    revealTimer = null
  }

  const start = () => {
    clearReveal()
    stopTicker()
    isComplete.value = false
    startTime = toValue(options.startedAt) || Date.now()
    elapsed.value = Date.now() - startTime
    ticker = setInterval(() => {
      elapsed.value = Date.now() - startTime
    }, TICK)
  }

  const reset = () => {
    stopTicker()
    clearReveal()
    isComplete.value = false
    elapsed.value = 0
  }

  /** Tick every step green, then resolve once the reveal beat has passed. */
  const finish = () =>
    new Promise<void>((resolve) => {
      stopTicker()
      isComplete.value = true
      clearReveal()
      revealTimer = setTimeout(() => {
        revealTimer = null
        resolve()
      }, revealDelay)
    })

  watch(
    () => toValue(isActive),
    (active) => (active ? start() : reset()),
    { immediate: true },
  )

  onScopeDispose(() => {
    stopTicker()
    clearReveal()
  })

  return { stepStates, currentStep, progress, isOverdue, isComplete, elapsed, finish, reset }
}

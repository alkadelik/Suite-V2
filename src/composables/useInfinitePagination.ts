import { useInfiniteScroll } from "@vueuse/core"
import { ref, toValue, type MaybeRefOrGetter } from "vue"

export const useInfinitePagination = (
  fetchNextPage: () => Promise<unknown>,
  hasNextPage: MaybeRefOrGetter<boolean | undefined>,
  distance = 10,
) => {
  const el = ref<HTMLElement | null>(null)

  useInfiniteScroll(
    el,
    async () => {
      if (toValue(hasNextPage)) {
        await fetchNextPage()
      }
    },
    { distance },
  )

  return { el }
}

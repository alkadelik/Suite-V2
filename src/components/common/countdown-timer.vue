<!-- components/common/countdown-timer.vue -->
<template>
  <span v-if="timeLeft > 0" class="text-sm text-gray-400">
    Resend available in {{ formattedTime }}
  </span>
</template>

<script setup>
import { ref, watch, computed, onBeforeUnmount } from "vue";

const props = defineProps({
  duration: { type: Number, default: 60 }, // in seconds
  start: { type: Boolean, default: false },
});

const emit = defineEmits(["finished"]);

const timeLeft = ref(0);
let timer = null;

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60);
  const seconds = timeLeft.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
});

watch(
  () => props.start,
  (shouldStart) => {
    if (shouldStart) {
      timeLeft.value = props.duration;
      clearInterval(timer);
      timer = setInterval(() => {
        timeLeft.value -= 1;
        if (timeLeft.value <= 0) {
          clearInterval(timer);
          emit("finished");
        }
      }, 1000);
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>

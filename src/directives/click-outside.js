// clickOutside.js (Utility Function)
export function onClickOutside(element, handler, options = {}) {
  const { capture = false, controls } = options;

  const handleClick = (event) => {
    if (controls && controls.value === false) return;
    if (!element.contains(event.target)) {
      handler(event);
    }
  };

  document.addEventListener("click", handleClick, capture);

  return () => {
    document.removeEventListener("click", handleClick, capture);
  };
}

// vClickOutside.js (Vue Directive)
export const vClickOutside = {
  mounted(el, binding) {
    const capture = !binding.modifiers.bubble;
    const handler = Array.isArray(binding.value) ? binding.value[0] : binding.value;
    const options = Object.assign(
      { capture },
      Array.isArray(binding.value) ? binding.value[1] : {},
    );

    if (typeof handler === "function") {
      el.__clickOutsideCleanup = onClickOutside(el, handler, options);
    } else {
      console.warn("v-click-outside: provided value must be a function or [function, options]");
    }
  },
  unmounted(el) {
    if (el.__clickOutsideCleanup) {
      el.__clickOutsideCleanup();
    }
  },
};

// Alias for consistency
export const VClickOutside = vClickOutside;

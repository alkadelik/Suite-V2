export const vTooltip = {
  mounted(el, binding) {
    const position = binding.modifiers.right
      ? "right"
      : binding.modifiers.left
        ? "left"
        : binding.modifiers.bottom
          ? "bottom"
          : "top"; // default

    const tooltip = document.createElement("div");
    tooltip.className = `
      tooltip-content
      fixed z-50 bg-white text-brand-400 text-xs text-sm px-2 py-1 rounded
      opacity-0 transition-opacity pointer-events-none
      max-w-xs break-words
    `;

    tooltip.textContent = binding.value;

    // Create arrow
    const arrow = document.createElement("div");
    arrow.className = "tooltip-arrow absolute w-2 h-2 bg-white rotate-45";
    tooltip.appendChild(arrow);

    document.body.appendChild(tooltip);
    el._tooltip = tooltip;

    const showTooltip = () => {
      const elRect = el.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      let top = 0,
        left = 0;

      switch (position) {
        case "right":
          top = elRect.top + elRect.height / 2 - tooltipRect.height / 2 + window.scrollY;
          left = elRect.right + 8 + window.scrollX;
          arrow.style.top = "50%";
          arrow.style.left = "-4px";
          arrow.style.transform = "translateY(-50%) rotate(45deg)";
          break;
        case "left":
          top = elRect.top + elRect.height / 2 - tooltipRect.height / 2 + window.scrollY;
          left = elRect.left - tooltipRect.width - 8 + window.scrollX;
          arrow.style.top = "50%";
          arrow.style.left = "100%";
          arrow.style.transform = "translateY(-50%) rotate(45deg)";
          break;
        case "bottom":
          top = elRect.bottom + 8 + window.scrollY;
          left = elRect.left + elRect.width / 2 - tooltipRect.width / 2 + window.scrollX;
          arrow.style.top = "-4px";
          arrow.style.left = "50%";
          arrow.style.transform = "translateX(-50%) rotate(45deg)";
          break;
        case "top":
        default:
          top = elRect.top - tooltipRect.height - 8 + window.scrollY;
          left = elRect.left + elRect.width / 2 - tooltipRect.width / 2 + window.scrollX;
          arrow.style.top = "100%";
          arrow.style.left = "50%";
          arrow.style.transform = "translateX(-50%) rotate(45deg)";
          break;
      }

      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
      tooltip.classList.add("opacity-100");
    };

    const hideTooltip = () => {
      tooltip.classList.remove("opacity-100");
    };

    el.addEventListener("mouseenter", showTooltip);
    el.addEventListener("mouseleave", hideTooltip);
    window.addEventListener("scroll", hideTooltip, true);

    el._tooltipCleanup = () => {
      tooltip.remove();
      el.removeEventListener("mouseenter", showTooltip);
      el.removeEventListener("mouseleave", hideTooltip);
      window.removeEventListener("scroll", hideTooltip, true);
    };
  },

  updated(el, binding) {
    if (el._tooltip) {
      el._tooltip.firstChild.textContent = binding.value;
    }
  },

  unmounted(el) {
    el._tooltipCleanup?.();
    delete el._tooltip;
  },
};

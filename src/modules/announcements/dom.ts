export function hasVisibleModalDialog(): boolean {
  return Array.from(
    document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]'),
  ).some((element) => {
    const rect = element.getBoundingClientRect()
    const style = getComputedStyle(element)
    const rendered =
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    const intersectsViewport =
      rect.right > 0 &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.top < window.innerHeight
    return rendered && intersectsViewport
  })
}

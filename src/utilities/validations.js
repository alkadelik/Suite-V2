const ctrlKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];

/** numbers only */
export const keyPressNumberOnly = (e) => {
  if (!ctrlKeys.includes(e.key) && !/[0-9]/.test(e.key)) {
    e.preventDefault();
  }
};

/** Alphabets, numbers and dash only */
export const keyPressAlphaNumbericDashOnly = (e) => {
  if (!ctrlKeys.includes(e.key) && !/^[a-zA-Z0-9-]/.test(e.key)) {
    e.preventDefault();
  }
};

export const slugify = (value) => {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // replace all non-alphanumerics with dashes
    .replace(/-+/g, "-") // collapse multiple dashes
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes
};

export const onInvalidSubmit = ({ errors }) => {
  const firstErrorFieldName = Object.keys(errors)[0];
  const el = document.querySelector(`[name="${firstErrorFieldName}"]`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

export function createTranslator(locale) {
  const dictionary = window.__APP_I18N__?.[locale] ?? {};
  return (key) => dictionary[key] ?? key;
}

export function applyI18nToDocument(translate) {
  document.title = translate("meta.title");

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (!key) {
      return;
    }

    node.textContent = translate(key);
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((node) => {
    const raw = node.getAttribute("data-i18n-attr");
    if (!raw) {
      return;
    }

    raw
      .split(";")
      .map((segment) => segment.trim())
      .filter(Boolean)
      .forEach((segment) => {
        const [attr, key] = segment.split(":").map((part) => part.trim());
        if (!attr || !key) {
          return;
        }

        node.setAttribute(attr, translate(key));
      });
  });
}

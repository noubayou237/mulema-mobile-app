/**
 * Utility to localize theme names based on common mappings
 * or provided translations.
 */

export const getThemeName = (theme, t) => {
  if (!theme) return "—";
  
  // 1. Prioritize theme.name_en if English language is active
  const isEn = t("common.theLanguage") === "en";
  if (isEn && theme.name_en) return theme.name_en;

  // 2. Manual mapping for common French names if English is active
  if (isEn) {
    const name = (theme.name || "").toLowerCase();
    
    // Exact or partial matches for key themes
    if (name.includes("salutation")) return t("themes.greetings");
    if (name.includes("famille")) return t("themes.family");
    if (name.includes("animaux")) return t("themes.animals");
    if (name.includes("nourriture") || name.includes("cuisine")) return t("themes.food");
    if (name.includes("vêtement") || name.includes("habits")) return t("themes.clothing");
    if (name.includes("vie sociale")) return "Social Life";
    if (name.includes("nature")) return t("themes.nature");
    if (name.includes("maison")) return t("themes.home");
    if (name.includes("travail")) return t("themes.work");
    if (name.includes("sport")) return t("themes.sports");
    if (name.includes("couleur")) return t("themes.colors");
    if (name.includes("chiffre")) return t("themes.numbers");
    if (name.includes("jour")) return t("themes.days");
    if (name.includes("pronom")) return "Pronouns";
  }

  // 3. Fallback to default name
  return theme.name || "—";
};

import { Check, ChevronDown } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLanguage } from "@/i18n/LanguageContext";

const OPTIONS = [
  { value: "de", labelKey: "nav.german" },
  { value: "en", labelKey: "nav.english" },
];

export default function LanguageSelector({ mobile = false }) {
  const { language, setLanguage, t } = useLanguage();

  if (mobile) {
    return (
      <div className="w-full max-w-xs" aria-label={t("nav.languageMenu")}>
        <p className="mb-3 text-center text-[10px] uppercase tracking-[0.25em] text-lunar">{t("nav.language")}</p>
        <div className="grid grid-cols-2 gap-3">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setLanguage(option.value)}
              aria-pressed={language === option.value}
              className={`min-h-11 border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 ${language === option.value ? "border-gold bg-gold/10 text-gold" : "border-white/15 text-lunar hover:border-white/40 hover:text-ivory"}`}
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="hidden lg:inline-flex min-h-11 min-w-14 items-center justify-center gap-1 border border-white/15 px-3 text-xs tracking-[0.14em] text-ivory transition-colors hover:border-gold/50 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
        aria-label={t("nav.languageMenu")}
      >
        {language.toUpperCase()} <ChevronDown size={14} aria-hidden="true" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={8} align="end" className="z-[80] min-w-40 border border-white/15 bg-secondary p-1.5 shadow-xl">
          {OPTIONS.map((option) => (
            <DropdownMenu.Item
              key={option.value}
              onSelect={() => setLanguage(option.value)}
              className="flex min-h-11 cursor-pointer select-none items-center justify-between gap-4 px-3 text-sm text-lunar outline-none transition-colors hover:bg-white/5 hover:text-ivory focus:bg-white/5 focus:text-ivory"
            >
              {t(option.labelKey)}
              {language === option.value && <Check size={15} className="text-gold" aria-hidden="true" />}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

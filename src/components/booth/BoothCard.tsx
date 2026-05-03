"use client";
import { Booth } from "@/types";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

/** Props for the BoothCard component */
interface BoothCardProps {
  /** The booth data object to display */
  booth: Booth;
  /** Whether this booth is currently selected in the list */
  isSelected?: boolean;
  /** Click handler for booth selection */
  onClick?: () => void;
}

/**
 * Displays a polling booth information card with name, address,
 * booth number, and accessibility facility badges.
 * Supports selected state styling and click interaction.
 *
 * @param {BoothCardProps} props - Component props.
 * @returns {React.ReactElement} The rendered booth card.
 */
export function BoothCard({ booth, isSelected, onClick }: BoothCardProps) {
  const { t, language } = useLanguage();

  return (
    <article
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${booth.name}, Booth ${booth.number}, ${booth.address}`}
      className={`p-3 rounded-xl border cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500 ${
        isSelected
          ? "border-saffron-500 bg-saffron-500/5 shadow-md"
          : "border-[var(--border-color)] bg-[var(--bg-card)] hover:border-saffron-500/50"
      }`}
      data-testid="booth-card"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-[var(--text-primary)] text-sm">
          {booth.name}
        </h3>
        <span
          className="pill-badge bg-[var(--bg-glass)]"
          data-testid="booth-number"
        >
          {language === "en" ? "Booth" : "बूथ"} {booth.number}
        </span>
      </div>
      <p className="text-xs text-[var(--text-secondary)] mb-2 flex items-start gap-1">
        <MapPin
          className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-red-500"
          aria-hidden="true"
        />
        <span>{booth.address}</span>
      </p>

      {/* Accessibility badges */}
      <div
        className="flex flex-wrap gap-1 mt-2"
        data-testid="accessibility-badges"
        role="list"
        aria-label="Booth accessibility features"
      >
        {booth.accessibility.ramp && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 border border-green-500/20"
            role="listitem"
          >
            {t("booth.accessibility.ramp")}
          </span>
        )}
        {booth.accessibility.wheelchair && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
            role="listitem"
          >
            {t("booth.accessibility.wheelchair") || "Wheelchair"}
          </span>
        )}
        {booth.accessibility.drinkingWater && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20"
            role="listitem"
          >
            {t("booth.accessibility.water")}
          </span>
        )}
        {booth.accessibility.toilets && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 border border-purple-500/20"
            role="listitem"
          >
            {t("booth.accessibility.toilet")}
          </span>
        )}
        {booth.accessibility.shade && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20"
            role="listitem"
          >
            {t("booth.accessibility.shade") || "Shade"}
          </span>
        )}
      </div>
    </article>
  );
}

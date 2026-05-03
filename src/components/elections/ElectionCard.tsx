"use client";
import { Election } from "@/types";
import { getElectionStatus } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";

/** Props for the ElectionCard component */
interface ElectionCardProps {
  /** The election data object to display */
  election: Election;
}

/**
 * Displays a summary card for a single election with status badge,
 * seat count, and announcement status. Uses date-aware status
 * determination via getElectionStatus utility.
 *
 * @param {ElectionCardProps} props - Component props.
 * @returns {React.ReactElement} The rendered election card.
 */
export function ElectionCard({ election }: ElectionCardProps) {
  const { t } = useLanguage();
  const status = getElectionStatus(election.electionDate);

  return (
    <article
      className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-glass)] hover:border-saffron-500/30 transition-all focus-within:ring-2 focus-within:ring-saffron-500"
      aria-label={`${election.name} - ${status.label}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="font-bold text-[var(--text-primary)]"
          data-testid="election-name"
        >
          {election.name.split(" Assembly")[0]}
        </span>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`pill-badge text-[0.6rem] flex items-center gap-1 ${
              status.color === "orange"
                ? "pill-badge-accent"
                : "pill-badge-green"
            }`}
            data-testid="status-badge"
            role="status"
            aria-live="polite"
          >
            {status.pulse && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"
                aria-hidden="true"
              />
            )}
            {status.label}
          </span>
          {!election.isAnnounced && (
            <span
              className="text-[0.55rem] text-orange-500 font-bold uppercase tracking-tighter"
              aria-label="Schedule not yet announced"
            >
              Schedule Not Announced
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-[var(--text-secondary)]">
        {election.totalSeats} {t("elections.seats")} - {election.year}
      </p>
    </article>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";

/**
 * Mobile bottom navigation links configuration.
 * @constant
 */
const mobileLinks = [
  { href: "/", key: "home", icon: "" },
  { href: "/booth-finder", key: "boothFinder", icon: "" },
  { href: "/ai-assistant", key: "aiChat", icon: "" },
  { href: "/dashboard", key: "dashboard", icon: "" },
];

/**
 * Bottom navigation bar for mobile viewport.
 * Provides quick access to primary platform features.
 * Hidden on medium+ screens via CSS media query.
 * Implements proper ARIA navigation landmark and current page indication.
 *
 * @returns {React.ReactElement} The rendered mobile navigation bar.
 */
export default function MobileNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav
      className="mobile-nav fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-color)] bg-[var(--bg-card)] backdrop-blur-xl safe-area-bottom md:hidden"
      aria-label="Mobile navigation"
      role="navigation"
    >
      <div className="flex items-center justify-around py-2 pb-[max(8px,env(safe-area-inset-bottom))]">
        {mobileLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500 ${
                isActive
                  ? "text-saffron-500"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span className="text-xl leading-none" aria-hidden="true">
                {link.icon}
              </span>
              <span
                className={`text-[0.6rem] font-semibold ${isActive ? "text-saffron-500" : ""}`}
              >
                {t(`nav.${link.key}`)}
              </span>
              {isActive && (
                <div
                  className="absolute bottom-1 w-6 h-0.5 rounded-full bg-saffron-500"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-6xl text-[var(--color-ink-1)]">404</p>
      <p className="mt-3 text-[var(--color-ink-3)]">Page not found.</p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-full bg-[var(--color-brand-orange)] px-5 py-2.5 text-white shadow-[var(--shadow-cta)]"
      >
        Back home
      </Link>
    </main>
  );
}

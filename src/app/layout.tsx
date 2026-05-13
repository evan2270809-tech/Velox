// The real <html> shell lives in [locale]/layout.tsx.
// This passthrough exists so Next.js can mount nested route groups under /[locale].

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

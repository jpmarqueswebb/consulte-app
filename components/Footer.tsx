const GOOGLE_REVIEW_URL = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL;

/** Link discreto e fixo para a ficha de negócio da Ariadne no Google — sem coleta de avaliação no app. */
export function Footer({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  if (!GOOGLE_REVIEW_URL) return null;

  const corTexto =
    variant === 'dark' ? 'text-white/85 hover:text-white' : 'text-gray-400 hover:text-gray-600';

  return (
    <footer className="w-full px-4 py-4 text-center">
      <a
        href={GOOGLE_REVIEW_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${corTexto}`}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L10 1.5z" />
        </svg>
        Avalie a Ariadne no Google
      </a>
    </footer>
  );
}

export function BotaoAgendar({ link }: { link: string }) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-blue px-5 py-3 text-sm font-medium text-brand-blue hover:bg-brand-bg"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.5A2.75 2.75 0 0118.25 6.75v8.5A2.75 2.75 0 0115.5 18h-11a2.75 2.75 0 01-2.75-2.75v-8.5A2.75 2.75 0 014.5 4H5V2.75A.75.75 0 015.75 2zm-1.25 7.5v5.75c0 .69.56 1.25 1.25 1.25h11c.69 0 1.25-.56 1.25-1.25V9.5h-13.5z"
          clipRule="evenodd"
        />
      </svg>
      Agendar online
    </a>
  );
}

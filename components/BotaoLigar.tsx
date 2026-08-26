import { linkLigar } from '@/lib/formatacao';

export function BotaoLigar({ telefone }: { telefone: string }) {
  return (
    <a
      href={linkLigar(telefone)}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-blue px-5 py-3 text-sm font-medium text-white hover:bg-brand-blue-dark"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
        <path d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-.836 1.66l-1.06.53a11.06 11.06 0 005.516 5.516l.53-1.06a1.5 1.5 0 011.66-.836l3.223.716A1.5 1.5 0 0116.5 14.35V15.5a1.5 1.5 0 01-1.5 1.5h-1.5C7.1 17 3 12.9 3 8V6.5a1.5 1.5 0 01-1-1.5v-1.5z" />
      </svg>
      Ligar
    </a>
  );
}

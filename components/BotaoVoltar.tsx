import Link from 'next/link';

/**
 * Link "Voltar" exibido no topo esquerdo das páginas 2 a 5 do funil.
 * Recebe a URL da etapa anterior explicitamente (em vez de usar o histórico
 * do navegador), pra funcionar corretamente mesmo quando a página é aberta
 * direto por um link compartilhado, sem uma página anterior no histórico.
 */
export function BotaoVoltar({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-left text-lg font-semibold text-white/90 transition-colors hover:text-white sm:text-xl"
    >
      <img
        src="/Seta%20voltar.svg"
        alt=""
        aria-hidden="true"
        className="h-7 w-7 -scale-x-100 sm:h-8 sm:w-8"
      />
      Voltar
    </Link>
  );
}

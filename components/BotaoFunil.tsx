'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useState, useTransition } from 'react';
import { BOTAO_FUNIL_CLASSES, BOTAO_FUNIL_CONTINUAR_CLASSES } from '@/lib/fluxo';

type BotaoFunilProps = {
  children?: ReactNode;
  href?: string;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  variante?: 'inicial' | 'continuar';
  className?: string;
};

export function BotaoFunil({
  children,
  href,
  onClick,
  disabled = false,
  variante = 'continuar',
  className = '',
}: BotaoFunilProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingLocal, setLoadingLocal] = useState(false);

  const baseClasses = variante === 'inicial' ? BOTAO_FUNIL_CLASSES : BOTAO_FUNIL_CONTINUAR_CLASSES;
  const carregando = isPending || loadingLocal;

  async function handleClick() {
    if (disabled || carregando) return;

    if (onClick) {
      setLoadingLocal(true);
      try {
        await onClick();
      } finally {
        // Se houver navegação subsequente, o estado pode continuar carregando
      }
    } else if (href) {
      setLoadingLocal(true);
      startTransition(() => {
        router.push(href);
      });
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || carregando}
      className={`${baseClasses} inline-flex items-center justify-center gap-3 ${className}`}
    >
      {carregando ? (
        <>
          <svg
            className="h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>CARREGANDO...</span>
        </>
      ) : (
        (children ?? (variante === 'inicial' ? 'CLIQUE AQUI' : 'CLIQUE PARA CONTINUAR'))
      )}
    </button>
  );
}

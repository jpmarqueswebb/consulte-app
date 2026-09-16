'use client';

import { useState } from 'react';

export function BotaoCopiarLink({
  urlRelativa,
  textoBotao = 'Copiar Link',
}: {
  urlRelativa: string;
  textoBotao?: string;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      const urlCompleta = typeof window !== 'undefined'
        ? `${window.location.origin}${urlRelativa}`
        : urlRelativa;

      await navigator.clipboard.writeText(urlCompleta);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Fallback
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      title="Copiar link exclusivo do terminal para enviar ao parceiro"
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs ${
        copiado
          ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200'
          : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
      }`}
    >
      {copiado ? (
        <>
          <svg className="h-3.5 w-3.5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>Link Copiado!</span>
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5 text-brand-sky" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span>{textoBotao}</span>
        </>
      )}
    </button>
  );
}

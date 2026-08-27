'use client';

import { useEffect, useRef, useState } from 'react';

interface Opcao {
  id: string;
  label: string;
}

/** "Select" customizado (mesmo estilo do dropdown de sugestões da busca), usado nas páginas 3 e 4. */
export function SeletorOpcao({
  opcoes,
  valor,
  onSelecionar,
  placeholder = 'Escolha um',
}: {
  opcoes: Opcao[];
  valor: string | null;
  onSelecionar: (id: string) => void;
  placeholder?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selecionada = opcoes.find((o) => o.id === valor);

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-full border border-white/40 bg-white/90 px-6 py-4 text-left text-base text-brand-navy shadow-lg backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-brand-blue/30 sm:px-7 sm:py-5 sm:text-lg"
      >
        <span className={selecionada ? 'font-medium' : 'text-gray-500'}>
          {selecionada ? selecionada.label : placeholder}
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-5 w-5 shrink-0 text-brand-blue transition-transform ${aberto ? 'rotate-180' : ''}`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 01 0-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {aberto && (
        <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-white/40 bg-white/95 shadow-xl backdrop-blur-md">
          {opcoes.map((opcao) => (
            <li key={opcao.id}>
              <button
                type="button"
                onClick={() => {
                  onSelecionar(opcao.id);
                  setAberto(false);
                }}
                className="w-full cursor-pointer px-6 py-3 text-left text-base text-gray-700 hover:bg-brand-bg/80 sm:text-lg"
              >
                {opcao.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

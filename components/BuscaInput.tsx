'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { Especialidade } from '@/types/database';

export function BuscaInput({
  termoInicial = '',
  tamanho = 'grande',
  parametrosExtras = {},
}: {
  termoInicial?: string;
  tamanho?: 'grande' | 'compacto';
  /** Parâmetros do funil (rede, operadora, cidade) a repassar pra página de resultados. */
  parametrosExtras?: Record<string, string>;
}) {
  const [termo, setTermo] = useState(termoInicial);
  const [sugestoes, setSugestoes] = useState<Especialidade[]>([]);
  const [aberto, setAberto] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      if (!termo.trim()) {
        setSugestoes([]);
        return;
      }
      try {
        const res = await fetch(`/api/sugestoes?q=${encodeURIComponent(termo)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setSugestoes(data.especialidades ?? []);
        setIndiceAtivo(-1);
      } catch {
        // busca cancelada (digitação seguinte) ou falha de rede — ignora, próxima tecla tenta de novo
      }
    }, 200);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [termo]);

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, []);

  function irParaEspecialidade(nome: string) {
    setAberto(false);
    const params = new URLSearchParams({ especialidade: nome, ...parametrosExtras });
    router.push(`/busca?${params.toString()}`);
  }

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    if (indiceAtivo >= 0 && sugestoes[indiceAtivo]) {
      irParaEspecialidade(sugestoes[indiceAtivo].nome_normalizado);
      return;
    }
    if (!termo.trim()) return;
    irParaEspecialidade(termo.trim());
  }

  function aoTeclar(e: React.KeyboardEvent) {
    if (!aberto || sugestoes.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndiceAtivo((i) => (i + 1) % sugestoes.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndiceAtivo((i) => (i <= 0 ? sugestoes.length - 1 : i - 1));
    } else if (e.key === 'Escape') {
      setAberto(false);
    }
  }

  const grande = tamanho === 'grande';

  return (
    <div ref={containerRef} className={`relative ${grande ? '' : 'max-w-md'}`}>
      <form onSubmit={buscar} className="flex gap-2">
        <input
          type="text"
          value={termo}
          onChange={(e) => {
            setTermo(e.target.value);
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          onKeyDown={aoTeclar}
          placeholder="Busque por especialidade, ex: pediatra, coração, olhos..."
          autoComplete="off"
          className={`w-full rounded-full border border-white/40 bg-white/90 text-brand-navy placeholder:text-gray-500 backdrop-blur-md focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30 ${
            grande ? 'px-5 py-3.5 text-sm sm:text-base' : 'px-4 py-2.5 text-sm'
          }`}
          autoFocus={grande}
        />
        <button
          type="submit"
          className={`efeito-brilho shrink-0 rounded-full bg-gradient-to-r from-brand-blue via-brand-blue-dark to-brand-navy font-semibold text-white transition-colors hover:brightness-110 ${
            grande ? 'px-5 py-3.5 text-sm sm:min-w-[260px] sm:px-8 sm:text-base' : 'px-5 py-2.5 text-sm'
          }`}
        >
          Buscar
        </button>
      </form>

      {aberto && sugestoes.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-white/40 bg-white/85 shadow-xl backdrop-blur-md">
          {sugestoes.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => irParaEspecialidade(s.nome_normalizado)}
                className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm ${
                  i === indiceAtivo ? 'bg-brand-bg/80 text-brand-navy' : 'text-gray-700 hover:bg-white/60'
                }`}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-brand-blue">
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                    clipRule="evenodd"
                  />
                </svg>
                {s.nome_normalizado}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';

interface Indicacao {
  nome: string;
  mensagem: string;
}

/** Mock — substituir por indicações reais quando o backend estiver disponível. */
const INDICACOES_MOCK: Indicacao[] = [
  {
    nome: 'Maria Fernandes',
    mensagem:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
  },
  {
    nome: 'João Pedro Alves',
    mensagem:
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.',
  },
  {
    nome: 'Camila Souza',
    mensagem:
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto.',
  },
];

export function QuemIndica() {
  const [aberto, setAberto] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;

    function aoClicarFora(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    function aoPressionarEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false);
    }

    document.addEventListener('mousedown', aoClicarFora);
    document.addEventListener('keydown', aoPressionarEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('mousedown', aoClicarFora);
      document.removeEventListener('keydown', aoPressionarEsc);
      document.body.style.overflow = '';
    };
  }, [aberto]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-brand-blue/20 bg-brand-bg p-4 text-left transition hover:border-brand-blue/40 hover:bg-brand-sky/20"
      >
        <span className="text-sm font-medium text-brand-navy">Quem indica</span>
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-brand-blue">
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.94 10 7.23 5.29a.75.75 0 111.06-1.06l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 01-1.08-.02z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {aberto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div
            ref={modalRef}
            className="flex max-h-[75vh] w-full max-w-sm flex-col rounded-2xl bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-xl font-bold text-brand-navy">Quem indica</h2>
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar"
                className="cursor-pointer rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path
                    fillRule="evenodd"
                    d="M4.22 4.22a.75.75 0 011.06 0L10 8.94l4.72-4.72a.75.75 0 111.06 1.06L11.06 10l4.72 4.72a.75.75 0 11-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 01-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-6">
              {INDICACOES_MOCK.map((indicacao, i) => (
                <div key={indicacao.nome} className={i > 0 ? 'mt-8' : ''}>
                  <p className="text-sm font-semibold text-brand-navy">{indicacao.nome}</p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{indicacao.mensagem}</p>
                  {i < INDICACOES_MOCK.length - 1 && <hr className="mt-8 border-gray-200" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

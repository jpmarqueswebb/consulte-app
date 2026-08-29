'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

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
  // Direção e altura do menu, decididas na abertura conforme o espaço livre na
  // viewport: em telas baixas (ou com a barra perto do rodapé, como no mobile) o
  // menu abre pra cima e limita a altura, em vez de espremer as opções no pé da tela.
  const [menu, setMenu] = useState({ paraCima: false, maxAltura: 360 });
  const containerRef = useRef<HTMLDivElement>(null);
  const selecionada = opcoes.find((o) => o.id === valor);

  const posicionarMenu = useCallback(() => {
    const alvo = containerRef.current?.getBoundingClientRect();
    if (!alvo) return;
    const margem = 16;
    const espacoAbaixo = window.innerHeight - alvo.bottom - margem;
    const espacoAcima = alvo.top - margem;
    const paraCima = espacoAbaixo < 240 && espacoAcima > espacoAbaixo;
    const disponivel = paraCima ? espacoAcima : espacoAbaixo;
    setMenu({ paraCima, maxAltura: Math.max(168, Math.min(disponivel, 360)) });
  }, []);

  function alternar() {
    if (!aberto) posicionarMenu();
    setAberto((v) => !v);
  }

  useEffect(() => {
    function aoClicarFora(e: Event) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', aoClicarFora);
    document.addEventListener('touchstart', aoClicarFora);
    return () => {
      document.removeEventListener('mousedown', aoClicarFora);
      document.removeEventListener('touchstart', aoClicarFora);
    };
  }, []);

  useEffect(() => {
    if (!aberto) return;
    posicionarMenu();
    window.addEventListener('resize', posicionarMenu);
    return () => window.removeEventListener('resize', posicionarMenu);
  }, [aberto, posicionarMenu]);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={alternar}
        className="campo-funil flex w-full cursor-pointer items-center justify-between gap-3 rounded-full border border-white/40 bg-white/90 text-left text-brand-navy shadow-lg backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
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
        <ul
          style={{ maxHeight: menu.maxAltura }}
          className={`absolute z-30 w-full overflow-y-auto overscroll-contain rounded-2xl border border-white/40 bg-white shadow-2xl ${
            menu.paraCima ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {opcoes.map((opcao) => (
            <li key={opcao.id}>
              <button
                type="button"
                onClick={() => {
                  onSelecionar(opcao.id);
                  setAberto(false);
                }}
                className="campo-funil-opcao w-full cursor-pointer text-left text-gray-700 hover:bg-brand-bg/80"
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

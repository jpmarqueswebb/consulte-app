'use client';

import { useEffect, useRef, useState } from 'react';

const NUMERO = process.env.NEXT_PUBLIC_WHATSAPP_CORRETORA;
const MENSAGEM = 'Olá, vim do app Consulte e gostaria de contratar um plano.';

const DURACAO_BALAO_MS = 8_000;
const INTERVALO_MIN_MS = 20_000;
const INTERVALO_MAX_MS = 30_000;

function proximoIntervalo() {
  return INTERVALO_MIN_MS + Math.random() * (INTERVALO_MAX_MS - INTERVALO_MIN_MS);
}

/**
 * Botão flutuante de contato comercial com a corretora (venda de plano) — não tem
 * relação com o médico/local da página atual, por isso a mensagem nunca muda.
 */
export function WhatsAppFloatButton() {
  const [balaoVisivel, setBalaoVisivel] = useState(false);
  const [jaClicou, setJaClicou] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (jaClicou) return;

    function agendarProximo() {
      timeoutRef.current = setTimeout(() => {
        setBalaoVisivel(true);
        timeoutRef.current = setTimeout(() => {
          setBalaoVisivel(false);
          agendarProximo();
        }, DURACAO_BALAO_MS);
      }, proximoIntervalo());
    }

    agendarProximo();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [jaClicou]);

  if (!NUMERO) return null;

  const href = `https://wa.me/${NUMERO}?text=${encodeURIComponent(MENSAGEM)}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      <div
        role="status"
        className={`rounded-xl bg-white px-3 py-2 text-sm font-medium text-brand-navy shadow-lg transition-opacity duration-700 ease-in-out ${
          balaoVisivel ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        Quer contratar um plano?
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contato via WhatsApp"
        onClick={() => {
          setJaClicou(true);
          setBalaoVisivel(false);
        }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-colors hover:bg-green-700"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
          <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.27 4.9L2 22l5.25-1.38a9.96 9.96 0 0 0 4.79 1.22h.01c5.52 0 10-4.48 10-10s-4.48-10-10-10zm5.87 14.24c-.25.7-1.45 1.33-2 1.42-.51.08-1.15.11-1.86-.12-.43-.13-.98-.32-1.69-.62-2.97-1.28-4.91-4.28-5.06-4.48-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.17 1.04-2.47.27-.3.6-.37.8-.37.2 0 .4 0 .58.01.19.01.44-.07.68.52.25.6.85 2.07.92 2.22.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.18-.31.4-.44.53-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.36 1.46.3.15.48.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.66-.15.27.1 1.72.81 2.01.96.3.15.5.22.57.34.08.13.08.72-.17 1.42z" />
        </svg>
      </a>
    </div>
  );
}

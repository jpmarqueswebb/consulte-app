'use client';

import { useRouter } from 'next/navigation';

type AdminHeaderProps = {
  titulo?: string;
  subtitulo?: string;
  hrefVoltar?: string;
  mostrarVoltar?: boolean;
};

export function AdminHeader({
  titulo,
  subtitulo,
  hrefVoltar,
  mostrarVoltar = false,
}: AdminHeaderProps) {
  const router = useRouter();
  const deveMostrarVoltar = mostrarVoltar || Boolean(hrefVoltar);

  function voltar() {
    if (hrefVoltar) {
      router.push(hrefVoltar);
    } else {
      router.back();
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
      <div className="flex items-center gap-3">
        {deveMostrarVoltar && (
          <button
            type="button"
            onClick={voltar}
            title="Voltar à página anterior"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md shadow-sm transition-all hover:scale-102 cursor-pointer shrink-0"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Voltar</span>
          </button>
        )}

        <div>
          {titulo && (
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
              {titulo}
            </h1>
          )}
          {subtitulo && (
            <p className="text-xs sm:text-sm text-white/70 mt-0.5 font-normal">
              {subtitulo}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

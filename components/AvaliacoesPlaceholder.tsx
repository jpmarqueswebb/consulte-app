/** Integração com avaliações do Google ainda não existe — reserva o espaço já com o layout final. */
export function AvaliacoesPlaceholder() {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">Avaliações no Google</p>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-500">
          Em breve
        </span>
      </div>
      <div className="mt-2 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-gray-300">
            <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L10 1.5z" />
          </svg>
        ))}
        <span className="ml-1 text-xs text-gray-400">sem avaliações ainda</span>
      </div>
    </div>
  );
}

export function MapaEmbed({ endereco, cidade }: { endereco: string | null; cidade?: string }) {
  if (!endereco) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-gray-400">
          <path
            d="M12 21s-7-6.5-7-11.5A7 7 0 0119 9.5C19 14.5 12 21 12 21z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <p className="text-xs text-gray-400">Mapa disponível assim que o endereço for cadastrado</p>
      </div>
    );
  }

  const query = encodeURIComponent(cidade ? `${endereco}, ${cidade}` : endereco);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <iframe
        title="Mapa"
        className="h-40 w-full"
        loading="lazy"
        src={`https://maps.google.com/maps?q=${query}&output=embed`}
      />
    </div>
  );
}

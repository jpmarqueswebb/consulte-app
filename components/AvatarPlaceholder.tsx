function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

/**
 * Placeholder de foto do profissional (upload de foto está fora do escopo do MVP).
 * Mostra as iniciais do nome sobre um fundo da marca até haver uma foto real.
 */
export function AvatarPlaceholder({ nome, size = 48 }: { nome: string; size?: number }) {
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue-light to-brand-blue font-semibold text-white"
    >
      {iniciais(nome)}
    </div>
  );
}

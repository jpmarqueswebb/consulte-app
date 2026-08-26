/** Remove tudo que não é dígito de um telefone. */
export function apenasDigitos(telefone: string): string {
  return telefone.replace(/\D/g, '');
}

/** Formata um telefone brasileiro (com DDD) para exibição: (31) 99999-9999 ou (31) 9999-9999. */
export function formatarTelefone(telefone: string): string {
  const digitos = apenasDigitos(telefone);

  if (digitos.length === 11) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  }
  if (digitos.length === 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return telefone;
}

/** Monta o link de discagem (funciona em celular via tel:). */
export function linkLigar(telefone: string): string {
  return `tel:+55${apenasDigitos(telefone)}`;
}

/**
 * Monta o link do WhatsApp (wa.me) a partir de um número com DDD.
 * Não deve ser chamado para números marcados como `whatsapp_valido = false`
 * sem antes avisar o usuário — a tela que consome isso decide como tratar.
 */
export function linkWhatsApp(telefone: string, mensagem?: string): string {
  const digitos = apenasDigitos(telefone);
  const url = `https://wa.me/55${digitos}`;
  return mensagem ? `${url}?text=${encodeURIComponent(mensagem)}` : url;
}

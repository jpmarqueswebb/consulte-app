'use client';

import { useState } from 'react';
import Image from 'next/image';

type ValidadorParceiroProps = {
  slug: string;
  parceiroNome: string;
};

type RespostaCliente = {
  id: string;
  nome: string;
  cpf: string;
  tipo: string;
  titular_nome?: string;
  foto_url?: string | null;
  status: 'ativo' | 'inativo';
};

export function ValidadorParceiro({ slug, parceiroNome }: ValidadorParceiroProps) {
  const [termo, setTermo] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [resultadoStatus, setResultadoStatus] = useState<'ativo' | 'inativo' | 'nao_encontrado' | null>(null);
  const [clienteEncontrado, setClienteEncontrado] = useState<RespostaCliente | null>(null);

  function formatarCpfOuTexto(valor: string) {
    const apenasDigitos = valor.replace(/\D/g, '');
    if (apenasDigitos.length === 11 && valor.length <= 14) {
      return `${apenasDigitos.slice(0, 3)}.${apenasDigitos.slice(3, 6)}.${apenasDigitos.slice(6, 9)}-${apenasDigitos.slice(9, 11)}`;
    }
    return valor;
  }

  async function handleValidar(e: React.FormEvent) {
    e.preventDefault();
    if (!termo.trim()) return;

    setCarregando(true);
    setErro(null);
    setResultadoStatus(null);
    setClienteEncontrado(null);

    try {
      const res = await fetch('/api/parceiro/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, termo: termo.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || 'Erro ao validar cliente.');
        return;
      }

      if (data.resultado === 'ativo' || data.resultado === 'inativo') {
        setResultadoStatus(data.resultado);
        setClienteEncontrado(data.cliente);
      } else {
        setResultadoStatus('nao_encontrado');
      }
    } catch {
      setErro('Erro de conexão ao consultar. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  function limparConsulta() {
    setTermo('');
    setResultadoStatus(null);
    setClienteEncontrado(null);
    setErro(null);
  }

  return (
    <div className="w-full space-y-6">
      {/* Formulário Principal de Validação */}
      <div className="rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-left">
        {/* Texto Explicativo Grande e Claro */}
        <div className="mb-6 text-center sm:text-left border-b border-white/15 pb-4">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
            CONSULTAR DESCONTO DO CLIENTE
          </h2>
          <p className="mt-2 text-sm sm:text-base text-white/80 leading-relaxed">
            Digite o <strong>CPF</strong> ou o <strong>Nome completo</strong> apresentado pelo cliente para verificar na hora se o benefício está ativo.
          </p>
        </div>

        <form onSubmit={handleValidar} className="space-y-4">
          <div>
            <label htmlFor="termo" className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-2">
              CPF ou Nome do Cliente:
            </label>
            <input
              id="termo"
              type="text"
              value={termo}
              onChange={(e) => setTermo(formatarCpfOuTexto(e.target.value))}
              placeholder="Ex.: 000.000.000-00 ou Maria de Lourdes"
              className="w-full rounded-2xl border border-white/30 bg-white px-5 py-4 text-base sm:text-lg font-bold text-brand-navy placeholder-gray-400 focus:border-brand-sky focus:outline-none focus:ring-4 focus:ring-brand-sky/20 shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={carregando || !termo.trim()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-blue via-brand-blue-dark to-brand-navy px-6 py-4 text-base font-bold text-white shadow-xl transition-all hover:scale-102 hover:brightness-110 disabled:opacity-50 cursor-pointer"
          >
            {carregando ? (
              <>
                <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Consultando base de dados...</span>
              </>
            ) : (
              <span>Verificar Desconto</span>
            )}
          </button>
        </form>

        {erro && (
          <div className="mt-4 rounded-xl bg-rose-500/20 border border-rose-400/40 p-3.5 text-xs sm:text-sm text-rose-100 flex items-center gap-2">
            <svg className="h-5 w-5 text-rose-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{erro}</span>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* RESULTADO: CLIENTE ATIVO (DESCONTO LIBERADO)                          */}
      {/* ===================================================================== */}
      {resultadoStatus === 'ativo' && clienteEncontrado && (
        <div className="rounded-3xl border-2 border-emerald-400 bg-emerald-950/70 p-6 sm:p-7 shadow-2xl backdrop-blur-xl text-left animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-emerald-500/30">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white font-black text-xl shadow-lg">
                ✓
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block">
                  Status Confirmado
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  CLIENTE ATIVO
                </h3>
              </div>
            </div>

            <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500 text-white shadow-md uppercase tracking-wider">
              Desconto Liberado
            </span>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Foto para conferência no balcão */}
            <div className="h-28 w-24 rounded-2xl overflow-hidden bg-emerald-900/50 border-2 border-emerald-400/60 relative shrink-0 flex items-center justify-center shadow-md">
              {clienteEncontrado.foto_url ? (
                <Image
                  src={clienteEncontrado.foto_url}
                  alt={clienteEncontrado.nome}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="text-center text-emerald-300 text-[10px] p-2 font-medium">
                  Sem foto no cadastro
                </div>
              )}
            </div>

            <div className="flex-1 space-y-1.5 text-center sm:text-left">
              <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-300 block">
                Nome do Credenciado
              </span>
              <p className="text-lg sm:text-xl font-black text-white leading-snug">
                {clienteEncontrado.nome}
              </p>

              <div className="text-xs sm:text-sm text-emerald-100/90 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                <span>CPF: <strong className="text-white">{clienteEncontrado.cpf}</strong></span>
                <span>Vínculo: <strong className="text-white">{clienteEncontrado.tipo}</strong></span>
                {clienteEncontrado.titular_nome && (
                  <span className="w-full text-xs text-emerald-300/80">
                    Titular responsável: {clienteEncontrado.titular_nome}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-200">
            <span className="italic text-center sm:text-left">
              Desconto autorizado para atendimento na unidade <strong>{parceiroNome}</strong>.
            </span>
            <button
              type="button"
              onClick={limparConsulta}
              className="px-4 py-2 rounded-xl bg-emerald-500/30 hover:bg-emerald-500/50 border border-emerald-400/40 text-white font-bold transition-all cursor-pointer"
            >
              Nova Consulta
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* RESULTADO: CLIENTE INATIVO (DESCONTO BLOQUEADO)                       */}
      {/* ===================================================================== */}
      {resultadoStatus === 'inativo' && clienteEncontrado && (
        <div className="rounded-3xl border-2 border-rose-400 bg-rose-950/70 p-6 sm:p-7 shadow-2xl backdrop-blur-xl text-left animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 pb-4 border-b border-rose-500/30">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500 text-white font-black text-xl shadow-lg">
              ✕
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300 block">
                Atenção Atendente
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                CLIENTE NÃO ESTÁ ATIVO
              </h3>
            </div>
          </div>

          <p className="mt-4 text-sm text-rose-100 leading-relaxed">
            O cadastro de <strong>{clienteEncontrado.nome}</strong> (CPF: {clienteEncontrado.cpf}) consta como <strong>inativo ou com plano suspenso</strong> na Consulte Corretora.
          </p>
          <p className="mt-2 text-xs font-bold text-rose-300">
            O desconto de parceiro NÃO está autorizado no momento.
          </p>

          <div className="mt-5 pt-4 border-t border-rose-500/30 flex justify-end">
            <button
              type="button"
              onClick={limparConsulta}
              className="px-4 py-2 rounded-xl bg-rose-500/30 hover:bg-rose-500/50 border border-rose-400/40 text-white font-bold transition-all cursor-pointer"
            >
              Nova Consulta
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* RESULTADO: NÃO ENCONTRADO                                             */}
      {/* ===================================================================== */}
      {resultadoStatus === 'nao_encontrado' && (
        <div className="rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-7 text-center shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 text-white">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-brand-sky font-black text-xl mb-3">
            ?
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white uppercase">
            NENHUM CLIENTE ENCONTRADO
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-white/80 max-w-md mx-auto">
            Não localizamos nenhum beneficiário ativo com o dado informado (<strong>{termo}</strong>).
          </p>
          <p className="mt-2 text-xs text-brand-sky">
            Dica para o atendente: Solicite ao cliente que apresente a Carteirinha Digital na tela do celular para conferir o CPF correto.
          </p>

          <div className="mt-5">
            <button
              type="button"
              onClick={limparConsulta}
              className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/25 text-xs font-bold text-white transition-all cursor-pointer"
            >
              Fazer Nova Busca
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

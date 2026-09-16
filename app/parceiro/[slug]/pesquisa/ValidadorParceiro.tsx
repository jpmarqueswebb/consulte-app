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
    <div className="space-y-6">
      {/* Formulário de Busca */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Validar Desconto de Cliente
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Digite o CPF (ou o Nome completo) apresentado pelo cliente para checar se ele está ativo na base da Consulte Corretora.
        </p>

        <form onSubmit={handleValidar} className="space-y-3">
          <div>
            <label htmlFor="termo" className="block text-xs font-semibold text-slate-700 mb-1">
              CPF ou Nome do Cliente:
            </label>
            <input
              id="termo"
              type="text"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Ex.: 123.456.789-00 ou Maria da Silva"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>

          <button
            type="submit"
            disabled={carregando || !termo.trim()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-blue-dark disabled:opacity-50 cursor-pointer"
          >
            {carregando ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Consultando na base...</span>
              </>
            ) : (
              <span>Verificar Benefício</span>
            )}
          </button>
        </form>

        {erro && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            {erro}
          </div>
        )}
      </div>

      {/* Resultado: CLIENTE ATIVO */}
      {resultadoStatus === 'ativo' && clienteEncontrado && (
        <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/70 p-6 shadow-md animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-lg">
                ✓
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Status Confirmado
                </span>
                <h3 className="text-lg font-black text-emerald-900 leading-tight">
                  CLIENTE ATIVO
                </h3>
              </div>
            </div>

            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">
              Desconto Liberado
            </span>
          </div>

          <div className="mt-4 flex items-start gap-4">
            {/* Foto para conferência visual */}
            <div className="h-20 w-18 rounded-xl overflow-hidden bg-emerald-200/50 border-2 border-emerald-300 relative shrink-0 flex items-center justify-center">
              {clienteEncontrado.foto_url ? (
                <Image
                  src={clienteEncontrado.foto_url}
                  alt={clienteEncontrado.nome}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="text-center text-emerald-700 text-[10px] p-1 font-medium">
                  Sem foto cadastrada
                </div>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                Nome Identificado
              </span>
              <p className="text-base font-bold text-slate-900 leading-snug">
                {clienteEncontrado.nome}
              </p>

              <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                <span>CPF: <strong className="text-slate-800">{clienteEncontrado.cpf}</strong></span>
                <span>Vínculo: <strong className="text-slate-800">{clienteEncontrado.tipo}</strong></span>
                {clienteEncontrado.titular_nome && (
                  <span className="w-full text-[11px] text-slate-500">
                    Titular do plano: {clienteEncontrado.titular_nome}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <span className="italic">
              Autorizado desconto conforme parceria com {parceiroNome}.
            </span>
            <button
              type="button"
              onClick={limparConsulta}
              className="text-xs font-bold text-emerald-800 underline hover:text-emerald-900"
            >
              Nova Consulta
            </button>
          </div>
        </div>
      )}

      {/* Resultado: CLIENTE INATIVO */}
      {resultadoStatus === 'inativo' && clienteEncontrado && (
        <div className="rounded-2xl border-2 border-rose-400 bg-rose-50/70 p-6 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 pb-3 border-b border-rose-200">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white font-bold text-lg">
              ✕
            </span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                Atenção
              </span>
              <h3 className="text-lg font-black text-rose-900 leading-tight">
                CLIENTE NÃO ESTÁ ATIVO
              </h3>
            </div>
          </div>

          <p className="mt-3 text-xs text-rose-800 leading-relaxed">
            O cadastro de <strong>{clienteEncontrado.nome}</strong> (CPF: {clienteEncontrado.cpf}) consta como <strong>inativo ou suspenso</strong> na Consulte Corretora.
          </p>
          <p className="mt-1 text-xs font-semibold text-rose-900">
            O desconto de parceiro NÃO pode ser concedido no momento.
          </p>

          <div className="mt-4 pt-3 border-t border-rose-200 flex justify-end">
            <button
              type="button"
              onClick={limparConsulta}
              className="text-xs font-bold text-rose-800 underline hover:text-rose-900"
            >
              Nova Consulta
            </button>
          </div>
        </div>
      )}

      {/* Resultado: NÃO ENCONTRADO */}
      {resultadoStatus === 'nao_encontrado' && (
        <div className="rounded-2xl border border-slate-300 bg-slate-100 p-6 text-center shadow-xs animate-in fade-in duration-200">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-600 font-bold mb-2">
            ?
          </div>
          <h3 className="text-base font-bold text-slate-800">
            CLIENTE NÃO ENCONTRADO NA BASE
          </h3>
          <p className="mt-1 text-xs text-slate-600 max-w-md mx-auto">
            Não foi localizado nenhum cliente ou dependente com o dado informado (<strong>{termo}</strong>).
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Dica: Peça para conferir os números do CPF ou solicitar que o cliente mostre a Carteirinha Digital no app da Consulte.
          </p>

          <div className="mt-4">
            <button
              type="button"
              onClick={limparConsulta}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              Fazer Nova Busca
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

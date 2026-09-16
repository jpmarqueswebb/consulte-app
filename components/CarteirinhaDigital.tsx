'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Beneficiario, BeneficiarioDependente } from '@/types/database';

type CarteirinhaProps = {
  titular: Beneficiario;
  dependentes: BeneficiarioDependente[];
};

export function CarteirinhaDigital({ titular, dependentes }: CarteirinhaProps) {
  const [membroAtivoId, setMembroAtivoId] = useState<string>(titular.id);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState<string | null>(null);

  // Estados locais para fotos atualizadas em tempo real
  const [fotoTitular, setFotoTitular] = useState<string | null>(titular.foto_url);
  const [fotosDependentes, setFotosDependentes] = useState<Record<string, string | null>>(
    Object.fromEntries(dependentes.map((d) => [d.id, d.foto_url]))
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const ehTitular = membroAtivoId === titular.id;
  const dependenteSelecionado = dependentes.find((d) => d.id === membroAtivoId);

  const membroAtual = ehTitular
    ? {
        id: titular.id,
        tipo: 'titular' as const,
        nome: titular.nome,
        cpf: titular.cpf,
        dataNascimento: titular.data_nascimento,
        endereco: titular.endereco,
        fotoUrl: fotoTitular,
        parentesco: 'Titular',
        status: titular.status,
      }
    : dependenteSelecionado
    ? {
        id: dependenteSelecionado.id,
        tipo: 'dependente' as const,
        nome: dependenteSelecionado.nome,
        cpf: dependenteSelecionado.cpf || 'Não informado',
        dataNascimento: dependenteSelecionado.data_nascimento,
        endereco: dependenteSelecionado.endereco || titular.endereco,
        fotoUrl: fotosDependentes[dependenteSelecionado.id],
        parentesco: dependenteSelecionado.parentesco,
        status: titular.status, // Dependente herda status do titular
      }
    : null;

  function formatarData(dataIso: string) {
    if (!dataIso) return '';
    const partes = dataIso.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataIso;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !membroAtual) return;

    setEnviandoFoto(true);
    setMensagemStatus(null);

    const formData = new FormData();
    formData.append('id', membroAtual.id);
    formData.append('tipo', membroAtual.tipo);
    formData.append('foto', file);

    try {
      const res = await fetch('/api/carteirinha/foto', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.foto_url) {
        if (ehTitular) {
          setFotoTitular(data.foto_url);
        } else {
          setFotosDependentes((prev) => ({
            ...prev,
            [membroAtual.id]: data.foto_url,
          }));
        }
        setMensagemStatus('Foto atualizada com sucesso!');
      } else {
        setMensagemStatus(data.error || 'Erro ao enviar foto.');
      }
    } catch {
      setMensagemStatus('Erro de conexão ao enviar foto.');
    } finally {
      setEnviandoFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  if (!membroAtual) return null;

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Seletor de Membros (Titular e Dependentes) */}
      {dependentes.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setMembroAtivoId(titular.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              ehTitular
                ? 'bg-brand-blue text-white shadow-md'
                : 'bg-white/80 text-brand-navy hover:bg-white border border-gray-200'
            }`}
          >
            Titular ({titular.nome.split(' ')[0]})
          </button>
          {dependentes.map((dep) => (
            <button
              key={dep.id}
              type="button"
              onClick={() => setMembroAtivoId(dep.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                membroAtivoId === dep.id
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'bg-white/80 text-brand-navy hover:bg-white border border-gray-200'
              }`}
            >
              {dep.nome.split(' ')[0]} ({dep.parentesco})
            </button>
          ))}
        </div>
      )}

      {/* Cartão da Carteirinha */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B406E] via-[#0B6BC2] to-[#085687] p-6 text-white shadow-2xl border border-white/20">
        {/* Marca d'água de fundo */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 blur-xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-40 h-40 rounded-full bg-brand-sky/10 blur-xl pointer-events-none" />

        {/* Topo do Cartão */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-4">
          <div>
            <span className="text-[10px] tracking-widest uppercase font-bold text-brand-sky">
              Clube de Vantagens
            </span>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              CONSULTE <span className="font-light text-brand-sky">BENEFÍCIOS</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                membroAtual.status === 'ativo'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  membroAtual.status === 'ativo' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              {membroAtual.status === 'ativo' ? 'ATIVO' : 'INATIVO'}
            </span>
          </div>
        </div>

        {/* Conteúdo Principal (Foto + Dados) */}
        <div className="relative z-10 mt-5 flex gap-4 items-start">
          {/* Foto e botão de upload */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative h-24 w-20 rounded-xl overflow-hidden bg-white/10 border-2 border-white/30 shadow-inner flex items-center justify-center">
              {membroAtual.fotoUrl ? (
                <Image
                  src={membroAtual.fotoUrl}
                  alt={membroAtual.nome}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-1 text-white/60">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-[9px] mt-0.5">Sem foto</span>
                </div>
              )}

              {enviandoFoto && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={enviandoFoto}
              className="px-2 py-0.5 text-[11px] font-semibold text-white/90 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
            >
              {membroAtual.fotoUrl ? 'Trocar foto' : '+ Foto'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Dados do Membro */}
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-brand-sky/90 font-medium">
                Nome do Beneficiário
              </span>
              <p className="text-base font-bold text-white leading-tight truncate">
                {membroAtual.nome}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] uppercase text-white/60 font-medium block">CPF</span>
                <span className="font-semibold text-white tracking-wide">{membroAtual.cpf}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-white/60 font-medium block">Nascimento</span>
                <span className="font-semibold text-white">
                  {formatarData(membroAtual.dataNascimento)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase text-white/60 font-medium block">Categoria</span>
              <span className="inline-block px-2 py-0.5 rounded bg-white/15 text-[11px] font-bold text-white">
                {ehTitular ? 'Titular Principal' : `Dependente: ${membroAtual.parentesco}`}
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé do Cartão */}
        <div className="relative z-10 mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/70">
          <span className="truncate max-w-[260px]">
            {membroAtual.endereco || 'Itabirito e Região'}
          </span>
          <span className="font-mono text-[10px] text-brand-sky font-bold">
            ID: {membroAtual.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
      </div>

      {mensagemStatus && (
        <p className="text-center text-xs font-medium text-brand-blue bg-brand-bg py-2 px-3 rounded-lg border border-brand-blue/20">
          {mensagemStatus}
        </p>
      )}

      {/* Ações e Informações */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-start gap-2.5 text-xs text-gray-600">
          <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <p>
            Apresente esta carteirinha ou informe seu CPF no estabelecimento parceiro para obter seu desconto exclusivo.
          </p>
        </div>

        <Link
          href="/rede"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-bg text-brand-navy hover:bg-brand-blue/10 text-xs font-bold transition-all text-center"
        >
          <svg className="w-4 h-4 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Ver Empresas Parceiras e Descontos
        </Link>
      </div>
    </div>
  );
}

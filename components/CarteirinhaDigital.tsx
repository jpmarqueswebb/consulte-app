'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Beneficiario, BeneficiarioDependente } from '@/types/database';

type CarteirinhaProps = {
  titular: Beneficiario;
  dependentes: BeneficiarioDependente[];
};

/** Logo oficial Consulte colorida para o rodapé da carteirinha */
function LogoConsulteCarteirinha({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 196 67"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Consulte"
    >
      {/* Símbolo geométrico multifacetado */}
      <rect x="174.953" y="32.9043" width="14.3433" height="14.1461" transform="rotate(-45 174.953 32.9043)" fill="#0671B9" />
      <rect x="151" y="32.4902" width="15.1716" height="15.1716" transform="rotate(-45 151 32.4902)" fill="#3382C4" />
      <path d="M184.324 21.4502L173.834 31.9403L163.146 21.2519L184.324 21.4502Z" fill="#90D4F3" />
      <path d="M163.182 21.3076L173.636 10.8533L184.272 21.4894L163.182 21.3076Z" fill="#61AADC" />
      <path d="M162.958 44.4482L173.594 33.8122L184.237 44.4551L162.958 44.4482Z" fill="#085687" />
      <path d="M184.272 44.3984L173.636 55.0345L163 44.3984H184.272Z" fill="#0570B8" />
      <path d="M161.873 21.7969L151.206 32.4642L140.57 21.8281L161.873 21.7969Z" fill="#61AADC" />
      <path d="M140 43.8281L151.163 32.6647L161.799 43.3007L140 43.8281Z" fill="#085687" />
      <path d="M152 55.3984L163.002 44.3969L173.644 55.0397L152 55.3984Z" fill="#0570B8" />
      <path d="M173.648 10.8447L163.183 21.3103L152.339 10.4663L173.648 10.8447Z" fill="#90D4F3" />

      {/* Tipografia 'consulte' em azul marinho */}
      <path d="M4.75 32.68C4.86 38.91 9.52 41.18 15.25 38.8L16.14 41.76C15.2 42.47 14.23 42.72 13.01 42.91C5.51 44.03 1.13 40.07 1 32.74C0.86 25.42 5.09 21.3 12.62 22.14C13.85 22.28 14.83 22.5 15.58 22.8L15.39 25.95C9.2 24 4.63 26.44 4.75 32.68Z" fill="#0B3C68" />
      <path d="M35.4 34.37C35.41 35.48 35.2 36.59 34.79 37.62C34.37 38.65 33.75 39.59 32.97 40.39C32.19 41.18 31.26 41.82 30.24 42.25C29.21 42.69 28.11 42.91 27 42.92L25.46 42.94C24.35 42.95 23.24 42.74 22.21 42.32C21.18 41.9 20.24 41.29 19.44 40.51C18.65 39.73 18.01 38.8 17.58 37.77C17.14 36.75 16.92 35.65 16.91 34.53L16.87 30.71C16.86 29.6 17.07 28.49 17.49 27.46C17.91 26.43 18.52 25.49 19.3 24.7C20.08 23.9 21.01 23.27 22.04 22.83C23.06 22.4 24.16 22.17 25.28 22.16L26.82 22.14C27.93 22.14 29.04 22.35 30.07 22.76C31.1 23.18 32.04 23.8 32.84 24.58C33.63 25.36 34.26 26.29 34.7 27.31C35.13 28.34 35.36 29.44 35.37 30.55L35.4 34.37ZM26.14 39.82C26.87 39.82 27.59 39.64 28.27 39.27C28.95 38.91 29.56 38.37 30.08 37.7C30.6 37.03 31.01 36.22 31.29 35.34C31.57 34.46 31.72 33.52 31.72 32.56C31.72 30.63 31.14 28.78 30.1 27.42C29.05 26.05 27.64 25.28 26.16 25.28C25.43 25.28 24.71 25.47 24.03 25.83C23.35 26.2 22.74 26.73 22.22 27.4C21.7 28.08 21.29 28.88 21.01 29.76C20.73 30.64 20.58 31.59 20.58 32.54C20.58 34.47 21.16 36.32 22.2 37.69C23.24 39.05 24.66 39.82 26.14 39.82Z" fill="#0B3C68" />
      <path d="M43.25 25.7C42.72 26.17 42.72 26.32 42.77 42.02L39.28 42.53L38.97 23.58C38.97 23.21 39.15 22.98 39.51 22.89C45.68 21.42 54.89 20.55 55.16 29.75C55.27 33.76 55.29 37.88 55.22 42.1L51.82 42.51L51.49 32.99C51.52 26.51 49.62 24.66 43.25 25.7Z" fill="#0B3C68" />
      <path d="M62.06 28.13C63.46 29.86 65.5 30.73 71.97 35.95C73.15 44.15 63.33 43.87 58.38 42.22L58.31 39.31C61.49 39.84 63.96 40.05 66.59 39.48C68.3 37.61 68.24 37.1 67.2 32.6C56.11 34.57 58.44 26.07 58.44 26.07C59.79 21.12 66.8 21.56 70.76 22.78L70.46 26.03C68.27 25.24 61.29 24.07 62.06 28.13Z" fill="#0B3C68" />
      <path d="M87.25 38.76V23.03H90.75V41.52C90.46 42.2 84.27 43.66 74.8 35.29C74.7 31.27 74.69 27.14 74.78 22.91H78.18L78.49 32.05C78.44 38.54 80.34 40.4 86.72 39.38C87.25 38.91 87.25 38.76 87.25 38.76Z" fill="#0B3C68" />
      <path d="M99.33 37.26C99.37 39.25 100.39 39.54 101.95 39.81L101.61 42.79C97.34 42.98 95.33 41.15 95.3 37.52C95.25 32.29 95.23 24.38 95.25 13.81L98.74 12.69C99.21 22.9 99.22 30.93 99.33 37.26Z" fill="#0B3C68" />
      <path d="M108.5 22.52H115.01V25.75H108.52C108.04 26.22 107.96 29.37 108.02 35.12C108.15 40.24 111.21 40.31 115.18 38.9L116.19 41.53C111.18 44.04 104.62 43.57 104.28 37.01C104.25 36.45 104.24 29.85 104.25 17.21L107.73 16.28V22.01C107.99 22.35 108.16 22.52 108.5 22.52Z" fill="#0B3C68" />
      <path d="M120.8 34.08C121.65 40.5 127.35 40.32 132.16 38.89L133.05 41.52C127.42 44.1 120.25 43.52 117.64 37.63C115.99 33.9 116.5 27.55 119.71 24.5C122.38 21.95 125.7 21.33 129.67 22.64C133.66 23.96 134.6 29.32 134.45 33.02H121.3C120.91 33.51 120.75 33.7 120.8 34.08ZM121.36 30.55L130.18 30.49V30.08C130.43 29.45 130.3 28.82 130.06 28.23C129.82 27.65 129.48 27.12 129.04 26.67C128.6 26.23 128.09 25.87 127.52 25.64C126.95 25.4 126.34 25.28 125.73 25.28C124.5 25.29 123.32 25.81 122.45 26.72C121.58 27.63 121.1 28.86 121.11 30.14V30.3L121.36 30.55Z" fill="#0B3C68" />
    </svg>
  );
}

/** Fundo sutil com linhas de ondas topográficas suaves */
function OndasFundo() {
  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none opacity-40"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 700 350"
      preserveAspectRatio="none"
    >
      <path
        d="M-50,80 C120,40 200,140 380,90 C540,50 620,130 750,70"
        fill="none"
        stroke="#BFD5ED"
        strokeWidth="1.2"
      />
      <path
        d="M-40,130 C130,90 220,200 400,150 C550,110 630,200 760,130"
        fill="none"
        stroke="#BFD5ED"
        strokeWidth="1.2"
      />
      <path
        d="M-30,190 C150,150 240,260 430,210 C580,170 650,260 770,200"
        fill="none"
        stroke="#BFD5ED"
        strokeWidth="1.2"
      />
      <path
        d="M-20,250 C170,210 260,320 460,270 C610,230 670,320 780,260"
        fill="none"
        stroke="#BFD5ED"
        strokeWidth="1.2"
      />
      <path
        d="M-10,310 C190,270 280,380 490,330 C640,290 690,380 790,320"
        fill="none"
        stroke="#BFD5ED"
        strokeWidth="1.2"
      />
    </svg>
  );
}

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

  // Gera número de inscrição consistente a partir do ID
  function gerarNumeroInscricao(id: string) {
    const limpo = id.replace(/[^0-9]/g, '');
    if (limpo.length >= 8) {
      return `${limpo.slice(0, 2)}.${limpo.slice(2, 5)}-${limpo.slice(5, 8)}`;
    }
    return '12.123-333';
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

  const numeroInscricao = gerarNumeroInscricao(membroAtual.id);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Seletor de Membros (Titular e Dependentes) */}
      {dependentes.length > 0 && (
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setMembroAtivoId(titular.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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

      {/* Status da Carteirinha */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-semibold text-white/80">
          {ehTitular ? 'Titular do Plano' : `Dependente (${membroAtual.parentesco})`}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold ${
            membroAtual.status === 'ativo'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
              : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              membroAtual.status === 'ativo' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
            }`}
          />
          {membroAtual.status === 'ativo' ? 'ATIVO' : 'INATIVO'}
        </span>
      </div>

      {/* ========================================================================= */}
      {/* CARTEIRINHA DIGITAL OFICIAL CONSULTE                                      */}
      {/* Desktop: Horizontal (idêntico à imagem 2)                                 */}
      {/* Mobile: Vertical (idêntico à imagem 3)                                    */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[26px] sm:rounded-[30px] border border-[#BFD5ED] bg-[#EDF4FC] p-4 sm:p-5 text-slate-800 shadow-2xl transition-all">
        {/* Ondas topográficas de fundo em marca d'água */}
        <OndasFundo />

        {/* Input Oculto de Foto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Container Principal: Coluna no Mobile, Linha no Desktop */}
        <div className="relative z-10 flex flex-col md:flex-row gap-4 sm:gap-5 items-stretch">
          {/* FOTO DO BENEFICIÁRIO */}
          <div className="relative w-full md:w-[220px] shrink-0">
            <div className="relative h-64 sm:h-72 md:h-full min-h-[220px] w-full rounded-2xl sm:rounded-[20px] overflow-hidden bg-slate-200/60 border border-[#BFD5ED] shadow-sm flex items-center justify-center group">
              {membroAtual.fotoUrl ? (
                <Image
                  src={membroAtual.fotoUrl}
                  alt={membroAtual.nome}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-3 text-[#7E97B5]">
                  <svg className="w-12 h-12 stroke-current" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-xs font-semibold mt-1">Sem foto</span>
                </div>
              )}

              {/* Overlay de Envio / Troca de Foto */}
              {enviandoFoto ? (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Alterar foto da carteirinha"
                  className="absolute bottom-2 right-2 rounded-lg bg-[#0B3C68]/80 hover:bg-[#0B3C68] text-white p-2 text-xs font-semibold backdrop-blur-xs transition-all opacity-80 hover:opacity-100 cursor-pointer shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* QUADRO DE DADOS COM DIVISORES EXATOS */}
          <div className="flex-1 rounded-2xl sm:rounded-[20px] border border-[#BFD5ED] bg-white/45 backdrop-blur-xs flex flex-col justify-between overflow-hidden shadow-xs">
            {/* Bloco 1: Nome do Credenciado */}
            <div className="p-4 sm:p-5 border-b border-[#BFD5ED]">
              <span className="text-[11px] sm:text-xs text-[#7E97B5] font-normal block leading-tight">
                Nome do credenciado:
              </span>
              <h2 className="mt-1 text-lg sm:text-xl md:text-2xl font-black text-[#0B3C68] tracking-tight uppercase leading-snug">
                {membroAtual.nome}
              </h2>
            </div>

            {/* Bloco 2: CPF e Nascimento */}
            {/* No Desktop: 2 colunas lado a lado com divisor vertical                    */}
            {/* No Mobile: empilhados com divisores horizontais                           */}
            <div className="border-b border-[#BFD5ED]">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#BFD5ED]">
                {/* Coluna CPF */}
                <div className="p-4 sm:p-5">
                  <span className="text-[11px] sm:text-xs text-[#7E97B5] font-normal block leading-tight">
                    CPF:
                  </span>
                  <p className="mt-1 text-base sm:text-lg md:text-xl font-black text-[#0B3C68] tracking-normal">
                    {membroAtual.cpf}
                  </p>
                </div>

                {/* Coluna Nascimento */}
                <div className="p-4 sm:p-5">
                  <span className="text-[11px] sm:text-xs text-[#7E97B5] font-normal block leading-tight">
                    Nascimento:
                  </span>
                  <p className="mt-1 text-base sm:text-lg md:text-xl font-black text-[#0B3C68] tracking-normal">
                    {formatarData(membroAtual.dataNascimento)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bloco 3: Rodapé com Nº DE INSCRIÇÃO e Logo Oficial Consulte */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-2">
              <div className="text-[11px] sm:text-xs text-[#7E97B5] font-mono tracking-wider font-semibold">
                Nº DE INSCRIÇÃO: <span className="font-bold text-[#6D8AA9]">{numeroInscricao}</span>
              </div>
              <div className="shrink-0">
                <LogoConsulteCarteirinha className="h-6 sm:h-7 w-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {mensagemStatus && (
        <p className="text-center text-xs font-medium text-brand-blue bg-white/90 py-2 px-3 rounded-lg border border-brand-blue/20 shadow-xs">
          {mensagemStatus}
        </p>
      )}

      {/* Cartão de Orientações e Ações */}
      <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-4 text-white shadow-sm space-y-3">
        <div className="flex items-start gap-2.5 text-xs text-white/90">
          <svg className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <p>
            Apresente esta carteirinha na tela do seu celular ou informe seu CPF na recepção do parceiro credenciado para usufruir dos descontos exclusivos.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={enviandoFoto}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-bold text-white transition-all text-center cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {membroAtual.fotoUrl ? 'Trocar Foto da Carteirinha' : 'Enviar Foto da Carteirinha'}
          </button>

          <Link
            href="/rede"
            className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-brand-blue text-white hover:brightness-110 text-xs font-bold transition-all text-center shadow-md"
          >
            Ver Parceiros e Benefícios
          </Link>
        </div>
      </div>
    </div>
  );
}

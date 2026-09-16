'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function ImportadorBeneficiariosCsv() {
  const [importando, setImportando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function recarregarLista() {
    setAtualizando(true);
    router.refresh();
    setTimeout(() => {
      setAtualizando(false);
    }, 600);
  }

  function processarCsv(texto: string) {
    const linhas = texto.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (linhas.length <= 1) return [];

    // Header: Nome, CPF, Data Nascimento, Endereço, Status
    const resultado = [];
    for (let i = 1; i < linhas.length; i++) {
      const colunas = linhas[i].split(/[,;]/).map((c) => c.trim().replace(/^["']|["']$/g, ''));
      if (colunas.length >= 2 && colunas[0] && colunas[1]) {
        resultado.push({
          nome: colunas[0],
          cpf: colunas[1],
          data_nascimento: colunas[2] || '',
          endereco: colunas[3] || '',
          status: colunas[4] || 'ativo',
        });
      }
    }
    return resultado;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportando(true);
    setFeedback(null);

    const leitor = new FileReader();
    leitor.onload = async (event) => {
      try {
        const conteudo = event.target?.result as string;
        const linhas = processarCsv(conteudo);

        if (linhas.length === 0) {
          setFeedback('Nenhum dado válido encontrado. O CSV deve ter colunas: Nome, CPF, DataNasc, Endereço, Status.');
          setImportando(false);
          return;
        }

        const res = await fetch('/api/admin/beneficiarios/importar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linhas }),
        });

        const data = await res.json();
        if (res.ok) {
          setFeedback(`Sucesso: ${data.importados} beneficiários importados/atualizados com sucesso!`);
          router.refresh();
        } else {
          setFeedback(data.error || 'Erro ao processar importação.');
        }
      } catch {
        setFeedback('Erro ao ler arquivo CSV.');
      } finally {
        setImportando(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    leitor.readAsText(file);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Botão Atualizar Lista */}
      <button
        type="button"
        onClick={recarregarLista}
        disabled={atualizando}
        title="Atualizar lista em tempo real"
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
      >
        <svg
          className={`h-4 w-4 ${atualizando ? 'animate-spin text-brand-sky' : 'text-white/80'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span>{atualizando ? 'Atualizando...' : 'Atualizar'}</span>
      </button>

      {/* Botão Importar CSV */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={importando}
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
      >
        <svg className="h-4 w-4 text-brand-sky" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        <span>{importando ? 'Importando...' : 'Importar Planilha (CSV)'}</span>
      </button>

      {feedback && (
        <div className="fixed bottom-5 right-5 z-50 rounded-2xl border border-white/20 bg-slate-900/95 p-4 text-xs font-semibold text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 max-w-sm flex items-start gap-2">
          <span>{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-white/60 hover:text-white ml-auto"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

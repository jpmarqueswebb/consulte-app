'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type DependenteInput = {
  nome: string;
  cpf: string;
  data_nascimento: string;
  parentesco: string;
};

export function BeneficiarioForm() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Titular
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [endereco, setEndereco] = useState('');
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');

  // Dependentes (até 4)
  const [dependentes, setDependentes] = useState<DependenteInput[]>([]);

  function adicionarDependente() {
    if (dependentes.length >= 4) return;
    setDependentes((prev) => [
      ...prev,
      { nome: '', cpf: '', data_nascimento: '', parentesco: 'Filho(a)' },
    ]);
  }

  function removerDependente(index: number) {
    setDependentes((prev) => prev.filter((_, i) => i !== index));
  }

  function atualizarDependente(index: number, campo: keyof DependenteInput, valor: string) {
    setDependentes((prev) => {
      const novos = [...prev];
      novos[index] = { ...novos[index], [campo]: valor };
      return novos;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !cpf.trim() || !dataNascimento) {
      setErro('Preencha os campos obrigatórios do titular.');
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      const res = await fetch('/api/admin/beneficiarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titular: {
            nome: nome.trim(),
            cpf: cpf.trim(),
            data_nascimento: dataNascimento,
            endereco: endereco.trim() || null,
            status,
          },
          dependentes: dependentes.filter((d) => d.nome.trim() && d.data_nascimento),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || 'Erro ao cadastrar beneficiário.');
      } else {
        router.push('/admin/beneficiarios');
        router.refresh();
      }
    } catch {
      setErro('Erro de conexão ao salvar.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {erro && (
        <div className="rounded-xl bg-rose-500/20 p-3.5 text-xs text-rose-100 border border-rose-400/40">
          {erro}
        </div>
      )}

      {/* Dados do Titular */}
      <div>
        <h2 className="text-base font-bold text-white border-b border-white/15 pb-2 mb-4">
          Dados do Titular
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do titular"
              className="w-full rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white placeholder-white/40 focus:border-brand-sky focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-brand-sky/20"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1">
              CPF *
            </label>
            <input
              type="text"
              required
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              className="w-full rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white placeholder-white/40 focus:border-brand-sky focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-brand-sky/20"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1">
              Data de Nascimento *
            </label>
            <input
              type="date"
              required
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white focus:border-brand-sky focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-brand-sky/20"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ativo' | 'inativo')}
              className="w-full rounded-xl border border-white/20 bg-slate-900/90 px-4 py-2.5 text-sm font-semibold text-white focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/20"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1">
              Endereço Completo
            </label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Rua, número, bairro, cidade - UF"
              className="w-full rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white placeholder-white/40 focus:border-brand-sky focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-brand-sky/20"
            />
          </div>
        </div>
      </div>

      {/* Dependentes */}
      <div className="pt-6 border-t border-white/15">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">
              Dependentes ({dependentes.length}/4)
            </h2>
            <p className="text-xs text-white/60">
              Cada dependente ganha uma carteirinha digital dedicada vinculada ao titular.
            </p>
          </div>

          {dependentes.length < 4 && (
            <button
              type="button"
              onClick={adicionarDependente}
              className="rounded-xl border border-brand-sky/40 bg-brand-sky/15 px-3.5 py-1.5 text-xs font-bold text-brand-sky hover:bg-brand-sky/25 transition-all cursor-pointer"
            >
              + Adicionar dependente
            </button>
          )}
        </div>

        {dependentes.map((dep, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/15 mb-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-sky">
                Dependente #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => removerDependente(idx)}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                Remover
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={dep.nome}
                  onChange={(e) => atualizarDependente(idx, 'nome', e.target.value)}
                  placeholder="Nome do dependente"
                  className="w-full rounded-xl border border-white/20 bg-white/15 px-3.5 py-2 text-sm font-semibold text-white placeholder-white/40 focus:border-brand-sky focus:bg-white/25 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">
                  Parentesco
                </label>
                <input
                  type="text"
                  value={dep.parentesco}
                  onChange={(e) => atualizarDependente(idx, 'parentesco', e.target.value)}
                  placeholder="Ex: Filho(a), Cônjuge"
                  className="w-full rounded-xl border border-white/20 bg-white/15 px-3.5 py-2 text-sm font-semibold text-white placeholder-white/40 focus:border-brand-sky focus:bg-white/25 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">
                  CPF (opcional p/ crianças)
                </label>
                <input
                  type="text"
                  value={dep.cpf}
                  onChange={(e) => atualizarDependente(idx, 'cpf', e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full rounded-xl border border-white/20 bg-white/15 px-3.5 py-2 text-sm font-semibold text-white placeholder-white/40 focus:border-brand-sky focus:bg-white/25 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  required
                  value={dep.data_nascimento}
                  onChange={(e) => atualizarDependente(idx, 'data_nascimento', e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/15 px-3.5 py-2 text-sm font-semibold text-white focus:border-brand-sky focus:bg-white/25 focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-white/15">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={salvando}
          className="rounded-xl bg-gradient-to-r from-brand-blue to-brand-navy border border-white/20 px-6 py-2.5 text-xs font-bold text-white hover:scale-102 hover:brightness-110 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
        >
          {salvando ? 'Salvando...' : 'Salvar Beneficiário'}
        </button>
      </div>
    </form>
  );
}

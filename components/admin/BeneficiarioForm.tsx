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
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
      {erro && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          {erro}
        </div>
      )}

      {/* Dados do Titular */}
      <div>
        <h2 className="text-base font-bold text-gray-900 border-b pb-2 mb-4">
          Dados do Titular
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do titular"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              CPF *
            </label>
            <input
              type="text"
              required
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Data de Nascimento *
            </label>
            <input
              type="date"
              required
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ativo' | 'inativo')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Endereço Completo
            </label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Rua, número, bairro, cidade - UF"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Dependentes */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Dependentes ({dependentes.length}/4)
            </h2>
            <p className="text-xs text-gray-500">
              Cada dependente ganha uma carteirinha digital dedicada vinculada ao titular.
            </p>
          </div>

          {dependentes.length < 4 && (
            <button
              type="button"
              onClick={adicionarDependente}
              className="rounded-lg border border-blue-600 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
            >
              + Adicionar dependente
            </button>
          )}
        </div>

        {dependentes.map((dep, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-gray-50 border border-gray-200 mb-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">
                Dependente #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => removerDependente(idx)}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Remover
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={dep.nome}
                  onChange={(e) => atualizarDependente(idx, 'nome', e.target.value)}
                  placeholder="Nome do dependente"
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Parentesco
                </label>
                <input
                  type="text"
                  value={dep.parentesco}
                  onChange={(e) => atualizarDependente(idx, 'parentesco', e.target.value)}
                  placeholder="Ex: Filho(a), Cônjuge"
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  CPF (opcional p/ crianças)
                </label>
                <input
                  type="text"
                  value={dep.cpf}
                  onChange={(e) => atualizarDependente(idx, 'cpf', e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  required
                  value={dep.data_nascimento}
                  onChange={(e) => atualizarDependente(idx, 'data_nascimento', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={salvando}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Salvar Beneficiário'}
        </button>
      </div>
    </form>
  );
}

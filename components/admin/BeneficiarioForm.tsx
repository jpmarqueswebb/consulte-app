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
  const [fotoArquivo, setFotoArquivo] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFotoArquivo(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  }

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
        // Se o usuário selecionou uma foto, faz o upload agora
        if (data.titular?.id && fotoArquivo) {
          try {
            const formData = new FormData();
            formData.append('id', data.titular.id);
            formData.append('tipo', 'titular');
            formData.append('foto', fotoArquivo);
            await fetch('/api/carteirinha/foto', {
              method: 'POST',
              body: formData,
            });
          } catch {
            // Se falhar o upload da foto, o titular já foi salvo
          }
        }

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

        {/* Upload de Imagem do Titular */}
        <div className="mb-5 flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/15">
          <div className="relative h-24 w-20 rounded-2xl overflow-hidden bg-white/10 border-2 border-white/20 flex items-center justify-center shrink-0">
            {fotoPreview ? (
              <img src={fotoPreview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center text-white/50 text-[10px] p-2">
                <svg className="w-8 h-8 mx-auto mb-1 stroke-current" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Sem foto
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <span className="block text-xs uppercase font-bold tracking-wider text-brand-sky">
              Foto da Carteirinha (Opcional)
            </span>
            <p className="text-xs text-white/70">
              Adicione a foto oficial da pessoa para visualização na Carteirinha Digital.
            </p>
            <div className="pt-1">
              <label className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-3.5 py-1.5 text-xs font-bold text-white cursor-pointer transition-all">
                <span>{fotoArquivo ? 'Trocar Foto' : '+ Selecionar Imagem'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="hidden"
                />
              </label>
              {fotoArquivo && (
                <button
                  type="button"
                  onClick={() => {
                    setFotoArquivo(null);
                    setFotoPreview(null);
                  }}
                  className="ml-2 text-xs text-rose-300 hover:underline"
                >
                  Remover
                </button>
              )}
            </div>
          </div>
        </div>

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

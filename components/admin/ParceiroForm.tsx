'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Cidade } from '@/types/database';

export function ParceiroForm({ cidades }: { cidades: Cidade[] }) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [slug, setSlug] = useState('');
  const [cidadeId, setCidadeId] = useState(cidades[0]?.id || '');
  const [categoria, setCategoria] = useState('Farmácia');
  const [descontoDescricao, setDescontoDescricao] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [endereco, setEndereco] = useState('');

  function gerarSlug(texto: string) {
    return texto
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function handleNomeChange(val: string) {
    setNome(val);
    if (!slug || slug === gerarSlug(nome)) {
      setSlug(gerarSlug(val));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !slug.trim() || !descontoDescricao.trim() || !cidadeId) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      const res = await fetch('/api/admin/parceiros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          slug: slug.trim(),
          cidade_id: cidadeId,
          categoria,
          desconto_descricao: descontoDescricao.trim(),
          telefone: telefone.trim() || null,
          whatsapp: whatsapp.trim() || null,
          endereco: endereco.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || 'Erro ao cadastrar parceiro.');
      } else {
        router.push('/admin/parceiros');
        router.refresh();
      }
    } catch {
      setErro('Erro de conexão ao salvar.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {erro && (
        <div className="rounded-xl bg-rose-500/20 p-3.5 text-xs text-rose-100 border border-rose-400/40">
          {erro}
        </div>
      )}

      <div>
        <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
          Nome da Empresa / Parceiro *
        </label>
        <input
          type="text"
          required
          value={nome}
          onChange={(e) => handleNomeChange(e.target.value)}
          placeholder="Ex: Drogarias Pacheco - Centro"
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-gray-400 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
            Identificador do Link (Slug) *
          </label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="drogarias-pacheco-centro"
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-gray-400 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm font-mono text-xs"
          />
          <span className="text-[11px] text-white/60 mt-1 block">
            Link: /parceiro/<strong>{slug || 'slug'}</strong>/pesquisa
          </span>
        </div>

        <div>
          <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
            Categoria *
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm"
          >
            <option value="Farmácia">Farmácia / Drogaria</option>
            <option value="Ótica">Ótica</option>
            <option value="Laboratório">Laboratório / Exames</option>
            <option value="Academia">Academia / Bem-estar</option>
            <option value="Clínica">Clínica Médica / Odontológica</option>
            <option value="Outros">Outros Serviços</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
          Cidade de Atendimento *
        </label>
        <select
          value={cidadeId}
          onChange={(e) => setCidadeId(e.target.value)}
          required
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm"
        >
          {cidades.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome} - {c.uf}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
          Regra de Desconto Cadastrada *
        </label>
        <input
          type="text"
          required
          value={descontoDescricao}
          onChange={(e) => setDescontoDescricao(e.target.value)}
          placeholder="Ex: Até 25% em genéricos e 10% em perfumaria"
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-gray-400 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
            Telefone de Atendimento
          </label>
          <input
            type="text"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(31) 3561-0000"
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-gray-400 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
            WhatsApp para Contato
          </label>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="(31) 98888-0000"
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-gray-400 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase font-bold tracking-wider text-brand-sky mb-1.5">
          Endereço Completo
        </label>
        <input
          type="text"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          placeholder="Rua, número, bairro, cidade - UF"
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-gray-400 border border-white/20 focus:outline-none focus:ring-4 focus:ring-brand-sky/30 shadow-sm"
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-white/15">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={salvando}
          className="rounded-xl bg-gradient-to-r from-brand-blue to-brand-navy border border-white/20 px-6 py-2.5 text-xs font-bold text-white shadow-xl hover:scale-102 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
        >
          {salvando ? 'Salvando...' : 'Salvar Empresa Parceira'}
        </button>
      </div>
    </form>
  );
}

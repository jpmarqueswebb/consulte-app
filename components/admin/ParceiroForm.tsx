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
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-gray-200">
      {erro && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          {erro}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Nome do Estabelecimento *
          </label>
          <input
            type="text"
            required
            value={nome}
            onChange={(e) => handleNomeChange(e.target.value)}
            placeholder="Ex.: Drogaria Central"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Identificador na URL (Slug) *
          </label>
          <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500">
            <span>/parceiro/</span>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(gerarSlug(e.target.value))}
              placeholder="drogaria-central"
              className="flex-1 bg-transparent px-1 font-semibold text-gray-900 focus:outline-none"
            />
            <span>/pesquisa</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Cidade *
          </label>
          <select
            value={cidadeId}
            onChange={(e) => setCidadeId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {cidades.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} / {c.uf}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Categoria *
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="Farmácia">Farmácia / Drogaria</option>
            <option value="Ótica">Ótica</option>
            <option value="Laboratório">Laboratório / Exames</option>
            <option value="Academia">Academia / Bem-estar</option>
            <option value="Alimentação">Alimentação Saudável</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Regra / Descrição do Desconto *
          </label>
          <input
            type="text"
            required
            value={descontoDescricao}
            onChange={(e) => setDescontoDescricao(e.target.value)}
            placeholder="Ex.: 20% de desconto em medicamentos genéricos e 10% nos demais"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Telefone Fixo
          </label>
          <input
            type="text"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(31) 3561-0000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            WhatsApp
          </label>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="(31) 98888-0000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
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
          {salvando ? 'Salvando...' : 'Cadastrar Empresa Parceira'}
        </button>
      </div>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Cidade, Local } from '@/types/database';

export function LocalForm({
  local,
  cidades,
  corretoraId,
}: {
  local?: Local;
  cidades: Cidade[];
  corretoraId: string;
}) {
  const [nome, setNome] = useState(local?.nome ?? '');
  const [cidadeId, setCidadeId] = useState(local?.cidade_id ?? cidades[0]?.id ?? '');
  const [endereco, setEndereco] = useState(local?.endereco ?? '');
  const [cep, setCep] = useState(local?.cep ?? '');
  const [telefonePrincipal, setTelefonePrincipal] = useState(local?.telefone_principal ?? '');
  const [whatsappPrincipal, setWhatsappPrincipal] = useState(local?.whatsapp_principal ?? '');
  const [horario, setHorario] = useState(local?.horario_funcionamento ?? '');
  const [latitude, setLatitude] = useState(local?.latitude?.toString() ?? '');
  const [longitude, setLongitude] = useState(local?.longitude?.toString() ?? '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    const supabase = createClient();
    const payload = {
      corretora_id: corretoraId,
      cidade_id: cidadeId,
      nome,
      endereco: endereco || null,
      cep: cep || null,
      telefone_principal: telefonePrincipal || null,
      whatsapp_principal: whatsappPrincipal || null,
      horario_funcionamento: horario || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      updated_at: new Date().toISOString(),
    };

    const { error } = local
      ? await supabase.from('locais').update(payload).eq('id', local.id)
      : await supabase.from('locais').insert(payload);

    setSalvando(false);

    if (error) {
      setErro(error.message);
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="flex max-w-md flex-col gap-3">
      <label className="text-sm font-medium text-gray-700">
        Nome do local
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="text-sm font-medium text-gray-700">
        Cidade
        <select
          value={cidadeId}
          onChange={(e) => setCidadeId(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {cidades.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}/{c.uf}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm font-medium text-gray-700">
        Endereço
        <input
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="text-sm font-medium text-gray-700">
        CEP
        <input
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="text-sm font-medium text-gray-700">
        Telefone principal
        <input
          value={telefonePrincipal}
          onChange={(e) => setTelefonePrincipal(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="text-sm font-medium text-gray-700">
        WhatsApp principal
        <input
          value={whatsappPrincipal}
          onChange={(e) => setWhatsappPrincipal(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="text-sm font-medium text-gray-700">
        Horário de funcionamento
        <input
          value={horario}
          onChange={(e) => setHorario(e.target.value)}
          placeholder="Seg a Sex, 8h-18h"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="flex gap-3">
        <label className="flex-1 text-sm font-medium text-gray-700">
          Latitude (opcional)
          <input
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex-1 text-sm font-medium text-gray-700">
          Longitude (opcional)
          <input
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <button
        type="submit"
        disabled={salvando}
        className="mt-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {salvando ? 'Salvando...' : 'Salvar local'}
      </button>
    </form>
  );
}

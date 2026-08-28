import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { rotuloConselho } from '@/lib/formatacao';
import { MapaEmbed } from '@/components/MapaEmbed';
import { BotaoLigar } from '@/components/BotaoLigar';
import { BotaoWhatsApp } from '@/components/BotaoWhatsApp';

export default async function LocalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: local } = await supabase.from('locais').select('*, cidades(nome, uf)').eq('id', id).maybeSingle();

  if (!local) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const l = local as any;

  const { data: vinculos } = await supabase
    .from('profissional_locais')
    .select('telefone, whatsapp, whatsapp_valido, profissionais!inner(id, nome, crm, uf_crm, tipo, situacao)')
    .eq('local_id', id)
    .eq('profissionais.situacao', 'ativo');

  return (
    <div className="min-h-screen bg-brand-bg">
      <main className="mx-auto min-h-screen max-w-lg px-4 py-6">
        <Link href="/busca" className="text-sm text-brand-blue">
          ← Voltar
        </Link>

        <h1 className="mt-4 text-xl font-bold text-brand-navy">{l.nome}</h1>
        <p className="mt-1 text-sm text-gray-600">{l.endereco ?? 'Endereço a confirmar'}</p>
        {l.horario_funcionamento && (
          <p className="mt-1 text-sm text-gray-500">{l.horario_funcionamento}</p>
        )}

        <div className="mt-3 flex flex-col gap-2">
          {l.telefone_principal && <BotaoLigar telefone={l.telefone_principal} />}
          {l.whatsapp_principal && (
            <BotaoWhatsApp telefone={l.whatsapp_principal} whatsappValido={true} />
          )}
        </div>

        <div className="mt-4">
          <MapaEmbed endereco={l.endereco} cidade={l.cidades ? `${l.cidades.nome} ${l.cidades.uf}` : undefined} />
        </div>

        {vinculos && vinculos.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-medium text-brand-navy/70">Profissionais neste local</h2>
            <div className="flex flex-col gap-2">
              {vinculos.map((v) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const prof = (v as any).profissionais;
                return (
                  <Link
                    key={prof.id}
                    href={`/profissional/${prof.id}`}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-brand-navy">{prof.nome}</span>{' '}
                    {rotuloConselho(prof.tipo, prof.crm, prof.uf_crm) && (
                      <span className="text-gray-500">
                        {rotuloConselho(prof.tipo, prof.crm, prof.uf_crm)}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

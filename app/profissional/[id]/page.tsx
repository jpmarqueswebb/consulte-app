import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AvatarPlaceholder } from '@/components/AvatarPlaceholder';
import { AvaliacoesPlaceholder } from '@/components/AvaliacoesPlaceholder';
import { MapaEmbed } from '@/components/MapaEmbed';
import { BotaoLigar } from '@/components/BotaoLigar';
import { BotaoWhatsApp } from '@/components/BotaoWhatsApp';
import { BotaoAgendar } from '@/components/BotaoAgendar';
import { Footer } from '@/components/Footer';

export default async function ProfissionalPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ voltar?: string }>;
}) {
  const { id } = await params;
  const { voltar } = await searchParams;
  const hrefVoltar = voltar ? `/busca?especialidade=${encodeURIComponent(voltar)}` : '/busca';
  const supabase = await createClient();

  const { data: profissional } = await supabase
    .from('profissionais')
    .select(
      `*,
       profissional_especialidades ( especialidades ( id, nome_normalizado ) ),
       profissional_locais ( telefone, whatsapp, whatsapp_valido, locais ( *, cidades ( nome, uf ) ) )`
    )
    .eq('id', id)
    .eq('situacao', 'ativo')
    .maybeSingle();

  if (!profissional) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = profissional as any;
  const especialidades = p.profissional_especialidades.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pe: any) => pe.especialidades.nome_normalizado as string
  );

  return (
    <div className="min-h-screen bg-brand-bg">
      <main className="mx-auto min-h-screen max-w-lg px-4 py-6">
        <Link href={hrefVoltar} className="text-sm text-brand-blue">
          ← Voltar
        </Link>

        <div className="mt-4 flex flex-col items-start text-left">
          <AvatarPlaceholder nome={p.nome} size={96} />
          <h1 className="mt-3 text-xl font-bold text-brand-navy">{p.nome}</h1>
          <p className="text-sm text-gray-500">
            CRM {p.crm}/{p.uf_crm}
          </p>
          <div className="mt-3 flex flex-wrap justify-start gap-1.5 rounded-lg bg-brand-bg px-3 py-2">
            {especialidades.map((nome: string) => (
              <span
                key={nome}
                className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-brand-navy"
              >
                {nome}
              </span>
            ))}
          </div>
        </div>

        {p.link_agendamento && (
          <div className="mt-4">
            <BotaoAgendar link={p.link_agendamento} />
          </div>
        )}

        <div className="mt-5">
          <AvaliacoesPlaceholder />
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {p.profissional_locais.map((pl: any) => {
            const local = pl.locais;
            const telefone = pl.telefone ?? local.telefone_principal;
            const whatsapp = pl.whatsapp ?? local.whatsapp_principal;

            return (
              <div key={local.id} className="rounded-xl border border-gray-200 bg-white p-6">
                <Link href={`/local/${local.id}`} className="text-sm font-semibold text-brand-navy">
                  {local.nome}
                </Link>
                <p className="mt-1 text-sm text-gray-500">
                  {local.endereco ?? 'Endereço a confirmar'}
                </p>

                <div className="mt-3 flex flex-col gap-2">
                  {telefone && <BotaoLigar telefone={telefone} />}
                  {whatsapp && (
                    <BotaoWhatsApp
                      telefone={whatsapp}
                      whatsappValido={pl.whatsapp_valido}
                      mensagem={`Olá, encontrei ${p.nome} no Consulte e gostaria de agendar uma consulta.`}
                    />
                  )}
                </div>

                <div className="mt-3">
                  <MapaEmbed
                    endereco={local.endereco}
                    cidade={local.cidades ? `${local.cidades.nome} ${local.cidades.uf}` : undefined}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}

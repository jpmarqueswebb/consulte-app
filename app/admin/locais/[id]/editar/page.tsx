import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LocalForm } from '@/components/admin/LocalForm';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function EditarLocalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: local }, { data: cidades }, {
    data: { user },
  }] = await Promise.all([
    supabase.from('locais').select('*').eq('id', id).maybeSingle(),
    supabase.from('cidades').select('*').order('nome'),
    supabase.auth.getUser(),
  ]);

  if (!local) {
    notFound();
  }

  const { data: adminUser } = user
    ? await supabase.from('admin_users').select('corretora_id').eq('id', user.id).single()
    : { data: null };

  return (
    <div>
      <AdminHeader
        titulo={`Editar Local: ${local.nome}`}
        subtitulo="Atualize endereço, telefones, WhatsApp e horários de atendimento."
        hrefVoltar="/admin"
      />
      <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-md">
        <LocalForm local={local} cidades={cidades ?? []} corretoraId={adminUser?.corretora_id ?? local.corretora_id} />
      </div>
    </div>
  );
}

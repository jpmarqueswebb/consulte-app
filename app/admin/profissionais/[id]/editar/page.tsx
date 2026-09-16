import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfissionalForm } from '@/components/admin/ProfissionalForm';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function EditarProfissionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: profissional }, { data: especialidades }, { data: locais }, { data: userData }] =
    await Promise.all([
      supabase.from('profissionais').select('*').eq('id', id).maybeSingle(),
      supabase.from('especialidades').select('*').order('nome_normalizado'),
      supabase.from('locais').select('*').order('nome'),
      supabase.auth.getUser(),
    ]);

  if (!profissional) {
    notFound();
  }

  const { data: adminUser } = userData.user
    ? await supabase.from('admin_users').select('corretora_id').eq('id', userData.user.id).single()
    : { data: null };

  const { data: vinculosEspecialidade } = await supabase
    .from('profissional_especialidades')
    .select('especialidade_id')
    .eq('profissional_id', id);

  const { data: vinculosLocal } = await supabase
    .from('profissional_locais')
    .select('local_id, telefone, whatsapp')
    .eq('profissional_id', id);

  return (
    <div>
      <AdminHeader
        titulo={`Editar Profissional: ${profissional.nome}`}
        subtitulo="Atualize dados cadastrais, especialidades e locais de atendimento."
        hrefVoltar="/admin"
      />
      <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-md">
        <ProfissionalForm
          profissional={profissional}
          especialidadesIniciais={(vinculosEspecialidade ?? []).map((v) => v.especialidade_id)}
          vinculosIniciais={(vinculosLocal ?? []).map((v) => ({
            local_id: v.local_id,
            telefone: v.telefone ?? '',
            whatsapp: v.whatsapp ?? '',
          }))}
          todasEspecialidades={especialidades ?? []}
          todosLocais={locais ?? []}
          corretoraId={adminUser?.corretora_id ?? profissional.corretora_id}
        />
      </div>
    </div>
  );
}

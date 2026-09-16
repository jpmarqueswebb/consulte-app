import { BeneficiarioForm } from '@/components/admin/BeneficiarioForm';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function NovoBeneficiarioPage() {
  return (
    <div>
      <AdminHeader
        titulo="Cadastrar Novo Beneficiário"
        subtitulo="Adicione o titular e até 4 dependentes com CPF e dados para a carteirinha."
        hrefVoltar="/admin/beneficiarios"
      />
      <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-md">
        <BeneficiarioForm />
      </div>
    </div>
  );
}

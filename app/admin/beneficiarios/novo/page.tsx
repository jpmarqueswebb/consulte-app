import Link from 'next/link';
import { BeneficiarioForm } from '@/components/admin/BeneficiarioForm';

export default function NovoBeneficiarioPage() {
  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/beneficiarios" className="text-xs text-blue-600 hover:underline">
          ← Voltar para beneficiários
        </Link>
        <h1 className="mt-1 text-lg font-bold text-gray-900">Novo Beneficiário</h1>
      </div>
      <BeneficiarioForm />
    </div>
  );
}

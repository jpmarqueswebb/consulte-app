import Link from 'next/link';
import { FundoHero } from '@/components/FundoHero';

export default function ProgramaPratiquePage() {
  return (
    <FundoHero hrefVoltar="/beneficios">
      <div className="mx-auto w-full max-w-xl text-left space-y-6">
        {/* Cabeçalho */}
        <div className="text-center">
          <span className="inline-block rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-300 uppercase tracking-wider">
            Convênio Exclusivo
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-2 leading-tight">
            Programa Pratique Fitness
          </h1>
          <p className="text-sm sm:text-base text-white/80 mt-1">
            Saúde, bem-estar e condições exclusivas para clientes Consulte Benefícios.
          </p>
        </div>

        {/* Card Principal de Vantagens */}
        <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl shadow-2xl space-y-4 text-white">
          <div className="flex items-center gap-3 pb-3 border-b border-white/15">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-xl shadow-md">
              P
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                Vantagens do Aluno Consulte
              </h2>
              <span className="text-xs text-amber-300 font-medium">
                Desconto especial na mensalidade e matrícula
              </span>
            </div>
          </div>

          <ul className="space-y-3 text-sm text-white/90">
            <li className="flex items-start gap-2.5">
              <span className="h-5 w-5 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                ✓
              </span>
              <span>
                <strong>Desconto corporativo exclusivo:</strong> Mensalidade com valor promocional para clientes ativos da Consulte Corretora.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="h-5 w-5 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                ✓
              </span>
              <span>
                <strong>Acesso completo:</strong> Musculação, área cardio, treinos funcionais e modalidades coletivas da Pratique.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="h-5 w-5 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                ✓
              </span>
              <span>
                <strong>Extensivo a dependentes:</strong> Seus dependentes cadastrados na carteirinha digital também aproveitam o benefício.
              </span>
            </li>
          </ul>

          {/* Como Utilizar */}
          <div className="pt-3 border-t border-white/15">
            <span className="text-xs font-bold text-brand-sky uppercase tracking-wider block mb-1">
              Como utilizar na recepção:
            </span>
            <p className="text-xs text-white/80 leading-relaxed">
              Basta apresentar sua <strong>Carteirinha Digital Consulte</strong> com status <strong>ATIVO</strong> ou informar seu CPF no balcão da unidade Pratique no momento da matrícula.
            </p>
          </div>
        </div>

        {/* Card de Unidades e Contatos */}
        <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-md text-white space-y-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-sky shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-sm font-bold text-white">Unidades e Informações Complementares</h3>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            As informações de endereços locais, horários e canais de atendimento direto das unidades Pratique estão sendo atualizadas pela equipe da Ariádne.
          </p>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/carteirinha"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-blue to-brand-navy px-6 py-3.5 text-sm font-bold text-white shadow-xl hover:scale-102 hover:brightness-110 transition-all text-center"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            Ver Minha Carteirinha
          </Link>

          <Link
            href="/beneficios"
            className="inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-all text-center"
          >
            ← Voltar
          </Link>
        </div>
      </div>
    </FundoHero>
  );
}

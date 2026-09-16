import { redirect } from 'next/navigation';

export default async function ParceiroRootPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/parceiro/${encodeURIComponent(slug)}/pesquisa`);
}

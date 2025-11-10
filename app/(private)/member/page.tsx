export default function MemberHome() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-neutral-900">Bem-vindo à área do membro</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Utilize o menu lateral para acessar os módulos disponíveis. Em breve você verá aqui os destaques do seu
          desempenho, próximos eventos e muito mais.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-500">
        Este espaço está reservado para os cards e atalhos principais do membro. Por enquanto, explore as opções do
        menu e compartilhe oportunidades com o grupo.
      </div>
    </section>
  );
}

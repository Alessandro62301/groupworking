import Image from "next/image";

export const metadata = {
  title: 'GroupWorking — Conecte, Indique e Cresça',
  description:
    'Plataforma de networking para grupos profissionais: membros, indicações, reuniões e financeiro em um só lugar.',
};

export default function Home() {
  return (
    <div className="min-h-dvh bg-white text-gray-900">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-blue-600 inline-block" />
            <span className="font-semibold">GroupWorking</span>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#recursos" className="hover:text-blue-700">Recursos</a>
            <a href="#como-funciona" className="hover:text-blue-700">Como funciona</a>
            <a href="#preco" className="hover:text-blue-700">Preço</a>
              <a
              href="/intent"
              className="rounded-xl bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 text-sm"
            >
              Quero me inscrever
            </a>
            <a
              href="/login"
              className="rounded-xl bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 text-sm"
            >
             Aréa Membros
            </a>
          </nav>
          <a
            href="/intent"
            className="md:hidden rounded-xl bg-blue-600 text-white px-3 py-2 text-sm"
          >
            Inscrever
          </a>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 from-blue-50 to-white" />
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Networking que <span className="text-blue-700">gera negócios</span>.
              </h1>
              <p className="mt-4 text-gray-600 text-lg">
                Centralize membros, indicações, reuniões e financeiro em uma plataforma simples —
                e dê adeus às planilhas.
              </p>
              <div className="mt-6 flex gap-3">
                <a
                  href="/intent"
                  className="rounded-xl bg-blue-600 text-white px-5 py-3 font-medium hover:bg-blue-700"
                >
                  Quero me inscrever
                </a>
                <a
                  href="#recursos"
                  className="rounded-xl border px-5 py-3 font-medium hover:bg-gray-50"
                >
                  Ver recursos
                </a>
              </div>
              <div className="mt-6 text-xs text-gray-500">
                Sem cartão de crédito · Cancelamento a qualquer momento
              </div>
            </div>

           <Image className="relative" width={550} height={100} src="/banner.png" alt="" />
          </div>
        </section>

        <section id="recursos" className="py-16 md:py-24 bg-white">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold tracking-tight">Recursos principais</h2>
            <p className="mt-2 text-gray-600">
              Tudo o que seu grupo precisa para profissionalizar o networking.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: 'Indicações com status',
                  desc: 'Crie, acompanhe e feche indicações entre membros (pending, in_progress, won, lost).',
                },
                {
                  title: 'Reuniões e presença',
                  desc: 'Agende encontros e registre check-ins — métricas automáticas para o grupo.',
                },
                {
                  title: 'Financeiro simples',
                  desc: 'Controle de mensalidades por membro, com recibo e situação (open/paid/overdue).',
                },
                {
                  title: 'Dashboard',
                  desc: 'KPIs de membros ativos, indicações, 1:1 e agradecimentos — tudo em um só lugar.',
                },
              ].map((it) => (
                <div key={it.title} className="rounded-2xl border p-5 shadow-sm bg-white">
                  <div className="h-10 w-10 rounded-lg bg-blue-600/10 flex items-center justify-center mb-3">
                    <span className="h-2 w-2 rounded bg-blue-600" />
                  </div>
                  <h3 className="font-semibold">{it.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{it.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Como funciona</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                {
                  step: '1',
                  title: 'Envie sua intenção',
                  desc: 'Preencha o formulário com seus dados e aguarde a avaliação.',
                },
                {
                  step: '2',
                  title: 'Receba o convite',
                  desc: 'Se aprovado, você receberá um link seguro para cadastro.',
                },
                {
                  step: '3',
                  title: 'Faça parte do grupo',
                  desc: 'Acesse a plataforma, registre indicações e acompanhe KPIs.',
                },
              ].map((s) => (
                <div key={s.step} className="rounded-2xl border p-5 bg-white shadow-sm">
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white grid place-items-center text-sm font-semibold">
                    {s.step}
                  </div>
                  <h3 className="mt-3 font-semibold">{s.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cta" className="py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="rounded-3xl text-blue-700 border p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-between">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold">Pronto para profissionalizar o grupo?</h3>
                <p className="text-blue-700 mt-2">
                  Envie sua intenção de inscrição e receba o convite em seu e-mail.
                </p>
              </div>
              <a
                href="/intent"
                className="rounded-xl bg-white text-blue-700 px-5 py-3 font-semibold hover:bg-blue-50"
              >
                Quero me inscrever
              </a>
            </div>
            <p id="preco" className="text-center text-xs text-gray-500 mt-4">
              Planos a partir de R$ 0 no piloto. Preço sob consulta para grupos maiores.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-500 flex flex-col md:flex-row items-center justify-between gap-3">
          <p>© 2025 GroupWorking. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <a href="#recursos" className="hover:text-gray-700">Recursos</a>
            <a href="#como-funciona" className="hover:text-gray-700">Como funciona</a>
            <a href="#preco" className="hover:text-gray-700">Preço</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

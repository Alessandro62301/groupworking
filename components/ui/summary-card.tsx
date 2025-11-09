type SummaryCardProps = {
  label: string;
  value: number;
  accent: string;
};

export default function SummaryCard({ label, value, accent }: SummaryCardProps) {
  return (
    <div className={`rounded-2xl border px-5 py-4 shadow-sm ${accent}`}>
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="text-3xl font-semibold text-neutral-900">{value}</p>
    </div>
  );
}

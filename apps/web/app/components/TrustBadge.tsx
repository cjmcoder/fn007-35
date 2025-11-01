'use client';
export default function TrustBadge({ score }: { score?: number }) {
  if (score === undefined) return null;
  let label = 'Normal';
  if (score < 60) label = 'Restricted';
  else if (score >= 100 && score <= 150) label = 'Priority';
  else if (score > 150) label = 'Verified Challenger';
  return <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs">{label} · {score}</span>;
}


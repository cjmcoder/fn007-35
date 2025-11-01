'use client';
export default function StreamChecklist({ nonce }: { nonce: string }) {
  return (
    <div className="rounded-xl border p-4 space-y-2">
      <div className="font-medium">Go live on FlockTube</div>
      <ol className="list-decimal list-inside text-sm space-y-1">
        <li>Open FlockTube Studio</li>
        <li>Add overlay widget and include nonce:</li>
      </ol>
      <div className="bg-muted rounded p-2 font-mono text-sm">{nonce}</div>
    </div>
  );
}


'use client';
import { useEffect, useState } from 'react';
export default function Timer({ target, onExpire }: { target: string; onExpire?: ()=>void }) {
  const [left, setLeft] = useState<number>(()=> new Date(target).getTime() - Date.now());
  useEffect(()=> {
    const id = setInterval(()=>{
      const ms = new Date(target).getTime() - Date.now();
      setLeft(ms);
      if (ms <= 0) { clearInterval(id); onExpire?.(); }
    }, 1000);
    return ()=>clearInterval(id);
  }, [target, onExpire]);
  const sec = Math.max(0, Math.floor(left/1000));
  return <span>{sec}s</span>;
}


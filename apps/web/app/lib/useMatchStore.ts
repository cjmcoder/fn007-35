'use client';
import { create } from 'zustand';

export type Phase = 'IDLE'|'SEEKING'|'READY'|'LIVE'|'VERIFY'|'SETTLED'|'VOID';
export type Lane = { gameId:string; mode:'CONSOLE_VERIFIED_STREAM'|'CLOUD_STREAM'; region:string; stakeCents:number; eloBand:string };

type S = {
  phase: Phase;
  ticketId?: string;
  match?: any;
  altChallenges?: any[];
  setPhase: (p:Phase)=>void;
  setData: (d:Partial<S>)=>void;
};
export const useMatchStore = create<S>((set)=>({
  phase:'IDLE',
  setPhase:(p)=>set({phase:p}),
  setData:(d)=>set(d),
}));





// Address validation utilities for multi-chain support
// Following the FLOCKNODE USDC withdrawal vision

export type Chain = 'POLYGON' | 'SOLANA' | 'ETHEREUM';

// EVM address validation (Ethereum, Polygon, etc.)
export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Solana address validation (Base58)
export function isValidSolAddress(address: string): boolean {
  try {
    // Solana addresses are Base58 encoded and typically 32-44 characters
    // This is a simplified check - in production you might want to use a proper Base58 library
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
  } catch {
    return false;
  }
}

// Main validation function
export function isValidForChain(chain: Chain, address: string): boolean {
  if (chain === 'SOLANA') {
    return isValidSolAddress(address);
  }
  // EVM chains (Ethereum, Polygon)
  return isValidEvmAddress(address);
}

// Get helper text for each chain
export function getChainHelperText(chain: Chain): string {
  switch (chain) {
    case 'POLYGON':
      return 'Works with MetaMask, Coinbase, Crypto.com. Address starts with 0x...';
    case 'ETHEREUM':
      return 'Higher fees. Address starts with 0x...';
    case 'SOLANA':
      return 'Works with Phantom, Coinbase. Base58 address (no 0x).';
    default:
      return '';
  }
}

// Get explorer URL for transaction hash
export function getExplorerUrl(chain: Chain, txHash: string): string {
  const explorers = {
    POLYGON: `https://polygonscan.com/tx/${txHash}`,
    ETHEREUM: `https://etherscan.io/tx/${txHash}`,
    SOLANA: `https://solscan.io/tx/${txHash}`,
  };
  return explorers[chain];
}

// Get network display name
export function getNetworkDisplayName(chain: Chain): string {
  switch (chain) {
    case 'POLYGON':
      return 'Polygon';
    case 'ETHEREUM':
      return 'Ethereum';
    case 'SOLANA':
      return 'Solana';
    default:
      return chain;
  }
}

// Allowed chains from environment
export const ALLOWED_CHAINS: Chain[] = (import.meta.env.VITE_WITHDRAW_ALLOWED_CHAINS || 'POLYGON,SOLANA,ETHEREUM')
  .split(',')
  .map(s => s.trim().toUpperCase()) as Chain[];

export const DEFAULT_NETWORK: Chain = (import.meta.env.VITE_DEFAULT_NETWORK as Chain) || 'POLYGON';



import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { Connection, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';

export interface SendTransactionDto {
  chain: string;
  to: string;
  amount: number; // Amount in FC (will be converted to appropriate token amount)
}

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private readonly privateKey: string;
  private readonly rpcUrls: Record<string, string>;
  private readonly usdcContract: string;

  constructor(private configService: ConfigService) {
    this.privateKey = this.configService.get<string>('crypto.privateKey');
    this.rpcUrls = {
      base: this.configService.get<string>('crypto.baseRpcUrl'),
      polygon: this.configService.get<string>('crypto.polygonRpcUrl'),
      solana: this.configService.get<string>('crypto.solanaRpcUrl'),
    };
    this.usdcContract = this.configService.get<string>('crypto.usdcContract');
  }

  async sendTransaction(dto: SendTransactionDto): Promise<string> {
    const { chain, to, amount } = dto;

    try {
      switch (chain) {
        case 'base':
          return await this.sendBaseTransaction(to, amount);
        case 'polygon':
          return await this.sendPolygonTransaction(to, amount);
        case 'solana':
          return await this.sendSolanaTransaction(to, amount);
        default:
          throw new Error(`Unsupported chain: ${chain}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send ${chain} transaction:`, error);
      throw error;
    }
  }

  private async sendBaseTransaction(to: string, amount: number): Promise<string> {
    const provider = new ethers.JsonRpcProvider(this.rpcUrls.base);
    const wallet = new ethers.Wallet(this.privateKey, provider);

    // USDC contract ABI (simplified)
    const usdcAbi = [
      'function transfer(address to, uint256 amount) returns (bool)',
      'function decimals() view returns (uint8)',
    ];

    const usdcContract = new ethers.Contract(this.usdcContract, usdcAbi, wallet);
    
    // Get USDC decimals
    const decimals = await usdcContract.decimals();
    
    // Convert FC amount to USDC amount (1 FC = 0.01 USDC)
    const usdcAmount = ethers.parseUnits((amount * 0.01).toString(), decimals);

    // Send transaction
    const tx = await usdcContract.transfer(to, usdcAmount);
    await tx.wait();

    this.logger.log(`Base transaction sent: ${tx.hash}`);
    return tx.hash;
  }

  private async sendPolygonTransaction(to: string, amount: number): Promise<string> {
    const provider = new ethers.JsonRpcProvider(this.rpcUrls.polygon);
    const wallet = new ethers.Wallet(this.privateKey, provider);

    // USDC contract ABI (simplified)
    const usdcAbi = [
      'function transfer(address to, uint256 amount) returns (bool)',
      'function decimals() view returns (uint8)',
    ];

    const usdcContract = new ethers.Contract(this.usdcContract, usdcAbi, wallet);
    
    // Get USDC decimals
    const decimals = await usdcContract.decimals();
    
    // Convert FC amount to USDC amount (1 FC = 0.01 USDC)
    const usdcAmount = ethers.parseUnits((amount * 0.01).toString(), decimals);

    // Send transaction
    const tx = await usdcContract.transfer(to, usdcAmount);
    await tx.wait();

    this.logger.log(`Polygon transaction sent: ${tx.hash}`);
    return tx.hash;
  }

  private async sendSolanaTransaction(to: string, amount: number): Promise<string> {
    const connection = new Connection(this.rpcUrls.solana, 'confirmed');
    
    // This is a simplified implementation
    // In production, you'd use proper Solana token program integration
    const fromPublicKey = new PublicKey('YourWalletPublicKey'); // Derive from private key
    const toPublicKey = new PublicKey(to);

    // Create a simple transfer transaction
    const transaction = new Transaction().add(
      // Add transfer instruction here
      // This would typically involve the Token Program
    );

    // Sign and send transaction
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [], // Signers would be added here
    );

    this.logger.log(`Solana transaction sent: ${signature}`);
    return signature;
  }

  async getBalance(address: string, chain: string): Promise<number> {
    try {
      switch (chain) {
        case 'base':
          return await this.getBaseBalance(address);
        case 'polygon':
          return await this.getPolygonBalance(address);
        case 'solana':
          return await this.getSolanaBalance(address);
        default:
          throw new Error(`Unsupported chain: ${chain}`);
      }
    } catch (error) {
      this.logger.error(`Failed to get ${chain} balance:`, error);
      throw error;
    }
  }

  private async getBaseBalance(address: string): Promise<number> {
    const provider = new ethers.JsonRpcProvider(this.rpcUrls.base);
    const usdcAbi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
    ];

    const usdcContract = new ethers.Contract(this.usdcContract, usdcAbi, provider);
    const balance = await usdcContract.balanceOf(address);
    const decimals = await usdcContract.decimals();

    return parseFloat(ethers.formatUnits(balance, decimals));
  }

  private async getPolygonBalance(address: string): Promise<number> {
    const provider = new ethers.JsonRpcProvider(this.rpcUrls.polygon);
    const usdcAbi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
    ];

    const usdcContract = new ethers.Contract(this.usdcContract, usdcAbi, provider);
    const balance = await usdcContract.balanceOf(address);
    const decimals = await usdcContract.decimals();

    return parseFloat(ethers.formatUnits(balance, decimals));
  }

  private async getSolanaBalance(address: string): Promise<number> {
    const connection = new Connection(this.rpcUrls.solana, 'confirmed');
    const publicKey = new PublicKey(address);
    
    // This is a simplified implementation
    // In production, you'd query the token account balance
    const balance = await connection.getBalance(publicKey);
    
    return balance / 1e9; // Convert lamports to SOL (simplified)
  }

  async validateAddress(address: string, chain: string): Promise<boolean> {
    try {
      switch (chain) {
        case 'base':
        case 'polygon':
          return ethers.isAddress(address);
        case 'solana':
          try {
            new PublicKey(address);
            return true;
          } catch {
            return false;
          }
        default:
          return false;
      }
    } catch (error) {
      this.logger.error(`Failed to validate ${chain} address:`, error);
      return false;
    }
  }

  async getTransactionStatus(txHash: string, chain: string): Promise<string> {
    try {
      switch (chain) {
        case 'base':
          return await this.getBaseTransactionStatus(txHash);
        case 'polygon':
          return await this.getPolygonTransactionStatus(txHash);
        case 'solana':
          return await this.getSolanaTransactionStatus(txHash);
        default:
          throw new Error(`Unsupported chain: ${chain}`);
      }
    } catch (error) {
      this.logger.error(`Failed to get ${chain} transaction status:`, error);
      throw error;
    }
  }

  private async getBaseTransactionStatus(txHash: string): Promise<string> {
    const provider = new ethers.JsonRpcProvider(this.rpcUrls.base);
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return 'pending';
    }
    
    return receipt.status === 1 ? 'confirmed' : 'failed';
  }

  private async getPolygonTransactionStatus(txHash: string): Promise<string> {
    const provider = new ethers.JsonRpcProvider(this.rpcUrls.polygon);
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return 'pending';
    }
    
    return receipt.status === 1 ? 'confirmed' : 'failed';
  }

  private async getSolanaTransactionStatus(txHash: string): Promise<string> {
    const connection = new Connection(this.rpcUrls.solana, 'confirmed');
    const signature = new PublicKey(txHash);
    
    const status = await connection.getSignatureStatus(signature);
    
    if (!status.value) {
      return 'pending';
    }
    
    return status.value.err ? 'failed' : 'confirmed';
  }
}






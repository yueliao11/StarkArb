import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEther(wei: string): string {
  try {
    const value = BigInt(wei)
    return (Number(value) / 1e18).toFixed(4)
  } catch {
    return '0.0000'
  }
}
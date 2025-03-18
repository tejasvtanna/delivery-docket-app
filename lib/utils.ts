import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const wait = (ms = 3000) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

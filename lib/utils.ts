import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to format dates
export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// Utility function to format numbers with commas
export function formatNumber(number: number) {
  return number.toLocaleString("en-US")
}

// Utility function to truncate text
export function truncate(str: string, length: number) {
  return str.length > length ? `${str.substring(0, length)}...` : str
}

// Utility function to get initials from name
export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

// Utility function to generate a random ID
export function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

// Utility function to get the first error message from a form error object
export function getFirstErrorMessage(error: Record<string, { message?: string }>): string | null {
  if (!error) return null
  const firstError = Object.values(error)[0]
  return firstError?.message || null
}
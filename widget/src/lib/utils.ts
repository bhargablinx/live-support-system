import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function saveToLocal(key: string, data) {
  window.localStorage.setItem(key, JSON.stringify(data));
}

export function getFromLocal(key: string) {
  const data = window.localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

export function removeFromLocal(key: string) {
  window.localStorage.removeItem(key);
}
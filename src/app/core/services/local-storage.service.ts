import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  setItem(key: string, value: unknown): void {
    if (typeof value === 'string') {
      localStorage.setItem(key, value);
      return;
    }

    localStorage.setItem(key, JSON.stringify(value));
  }

  getItem<T>(key: string): T | null {
    const value = localStorage.getItem(key);

    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}

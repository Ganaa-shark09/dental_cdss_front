import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  objectToQueryParams(payload: Record<string, unknown>): Record<string, string> {
    return Object.fromEntries(
      Object.entries(payload)
        .filter(([, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => [key, String(value)]),
    );
  }
}

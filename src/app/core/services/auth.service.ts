import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { LocalStorageService } from './local-storage.service';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthUser {
  id?: string | number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  [key: string]: unknown;
}

export interface AuthResponse {
  access?: string;
  refresh?: string;
  user?: AuthUser;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';
  private readonly userKey = 'auth_user';

  constructor(
    private apiService: ApiService,
    private localStorageService: LocalStorageService,
  ) {}

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('auth/login/', payload).pipe(
      tap((response) => {
        if (response.access) {
          this.localStorageService.setItem(this.accessTokenKey, response.access);
        }

        if (response.refresh) {
          this.localStorageService.setItem(this.refreshTokenKey, response.refresh);
        }

        if (response.user) {
          this.localStorageService.setItem(this.userKey, response.user);
        }
      }),
    );
  }

  logout(): void {
    this.localStorageService.removeItem(this.accessTokenKey);
    this.localStorageService.removeItem(this.refreshTokenKey);
    this.localStorageService.removeItem(this.userKey);
  }

  getAccessToken(): string | null {
    return this.localStorageService.getItem<string>(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return this.localStorageService.getItem<string>(this.refreshTokenKey);
  }

  getCurrentUser(): AuthUser | null {
    return this.localStorageService.getItem<AuthUser>(this.userKey);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

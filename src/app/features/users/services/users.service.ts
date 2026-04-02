import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface UserOptionItem {
  uuid: string;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface UserListResponse {
  count?: number;
  results?: UserOptionItem[];
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'users/';

  getUsers(): Observable<UserOptionItem[] | UserListResponse> {
    return this.api.get<UserOptionItem[] | UserListResponse>(this.endpoint);
  }
}

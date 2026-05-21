import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly api = inject(ApiService);

  list() {
    return this.api.get<any[]>('users/');
  }

  getUsers() {
    // For backward compatibility with staff-form and other usages
    return this.list();
  }

  get(uuid: string) {
    return this.api.get<any>(`users/${uuid}/`);
  }

  create(data: any) {
    return this.api.post<any>('users/', data);
  }

  me() {
    return this.api.get<any>('users/users/me/');
  }
}

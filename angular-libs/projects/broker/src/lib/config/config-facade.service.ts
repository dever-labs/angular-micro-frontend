import { Injectable } from '@angular/core';
import { AppStateService } from '../app-state.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigFacadeService {
  constructor(private readonly appState: AppStateService) {}

  isSet(): boolean {
    return !!this.getToken() && !!this.getUri() && !!this.getUsers().length;
  }

  getUsers(): string[] {
    return this.appState.users();
  }

  setUsers(users: string[]): void {
    this.appState.users.set(users);
  }

  getToken(): string | null {
    return this.appState.token();
  }

  setToken(token: string): void {
    this.appState.token.set(token);
  }

  getUri(): string | null {
    return this.appState.uri();
  }

  setUri(uri: string): void {
    this.appState.uri.set(uri);
  }

  getTheme(): string | null {
    return this.appState.theme();
  }

  setTheme(theme: string): void {
    this.appState.theme.set(theme);
  }
}

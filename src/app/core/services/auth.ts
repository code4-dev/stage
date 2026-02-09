import { Injectable, signal } from '@angular/core';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'chef' | 'admin' | 'employee';
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private currentUser = signal<User | null>(null);
  private isAuthenticated = signal(false);

  constructor() {
    this.loadUser();
  }

  private loadUser(): void {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUser.set(JSON.parse(user));
      this.isAuthenticated.set(true);
    }
  }

  login(email: string, password: string): void {
    // Simulation d'une authentification
    const mockUser: User = {
      id: '1',
      name: 'Chef de Projet',
      email: email,
      role: 'chef'
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    this.currentUser.set(mockUser);
    this.isAuthenticated.set(true);
  }

  logout(): void {
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }
}

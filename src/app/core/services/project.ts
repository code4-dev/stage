import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'En cours' | 'Terminé' | 'Planification' | 'Suspendu';
  dueDate: Date;
  createdAt: Date;
  chefId: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private http = inject(HttpClient); // Injection moderne
  private readonly API_URL = 'http://localhost:8080/api/projects'; // Ton URL Spring Boot
  private projects = signal<Project[]>([]);
  private currentProject = signal<Project | null>(null);

  constructor() {
    this.refreshProjects();
  }

  private refreshProjects(): void {
    this.http.get<Project[]>(this.API_URL).subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.error('Erreur lors du chargement des projets', err)
    });
  }
  

  private saveProjects(): void {
    localStorage.setItem('projects', JSON.stringify(this.projects()));
  }



  getProjectById(id: string): Project | undefined {
    return this.projects().find(p => p.id === id);
  }

  createProject(project: Omit<Project, 'id' | 'createdAt'>) {
      return this.http.post<Project>(this.API_URL, project).subscribe({
        next: () => this.refreshProjects() // On rafraîchit la liste après ajout
      });
    }

  updateProject(id: string, updates: Partial<Project>) {
      return this.http.put<Project>(`${this.API_URL}/${id}`, updates).subscribe({
        next: () => this.refreshProjects()
      });
    }

  deleteProject(id: string): void {
    this.http.delete(`${this.API_URL}/${id}`).subscribe({
      next: () => this.refreshProjects()
    });
  }

// Getters pour les Signals
  getProjects() { return this.projects(); }
  getCurrentProject() { return this.currentProject(); }

// Stats (calculées à partir du signal mis à jour par le back)
  getProjectsStats() {
    const projects = this.projects();
    return {
      total: projects.length,
      enCours: projects.filter(p => p.status === 'En cours').length,
      termine: projects.filter(p => p.status === 'Terminé').length,
      planification: projects.filter(p => p.status === 'Planification').length
    };
  }
}

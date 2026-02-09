import { Injectable, signal } from '@angular/core';

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
  private projects = signal<Project[]>([]);
  private currentProject = signal<Project | null>(null);

  constructor() {
    this.loadProjects();
  }

  private loadProjects(): void {
    const stored = localStorage.getItem('projects');
    if (stored) {
      const projects = JSON.parse(stored).map((p: any) => ({
        ...p,
        dueDate: new Date(p.dueDate),
        createdAt: new Date(p.createdAt)
      }));
      this.projects.set(projects);
    } else {
      // Données de test
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Site Web E-commerce',
          description: 'Développement du site e-commerce',
          status: 'En cours',
          dueDate: new Date('2026-03-31'),
          createdAt: new Date('2026-01-01'),
          chefId: '1'
        },
        {
          id: '2',
          name: 'Application Mobile CRM',
          description: 'Application mobile pour la gestion CRM',
          status: 'Planification',
          dueDate: new Date('2026-06-30'),
          createdAt: new Date('2026-01-05'),
          chefId: '1'
        },
        {
          id: '3',
          name: 'Système de Reporting',
          description: 'Mise en place du système de reporting',
          status: 'Suspendu',
          dueDate: new Date('2026-05-15'),
          createdAt: new Date('2025-12-01'),
          chefId: '1'
        }
      ];
      this.projects.set(mockProjects);
      this.saveProjects();
    }
  }

  private saveProjects(): void {
    localStorage.setItem('projects', JSON.stringify(this.projects()));
  }

  getProjects(): Project[] {
    return this.projects();
  }

  getProjectById(id: string): Project | undefined {
    return this.projects().find(p => p.id === id);
  }

  createProject(project: Omit<Project, 'id' | 'createdAt'>): Project {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    this.projects.set([...this.projects(), newProject]);
    this.saveProjects();
    return newProject;
  }

  updateProject(id: string, updates: Partial<Project>): Project | null {
    const projects = this.projects();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates };
      this.projects.set([...projects]);
      this.saveProjects();
      return projects[index];
    }
    return null;
  }

  deleteProject(id: string): void {
    this.projects.set(this.projects().filter(p => p.id !== id));
    this.saveProjects();
  }

  setCurrentProject(project: Project | null): void {
    this.currentProject.set(project);
  }

  getCurrentProject(): Project | null {
    return this.currentProject();
  }

  getProjectsStats() {
    const projects = this.projects();
    return {
      total: projects.length,
      enCours: projects.filter(p => p.status === 'En cours').length,
      termines: projects.filter(p => p.status === 'Terminé').length,
      planification: projects.filter(p => p.status === 'Planification').length
    };
  }
}

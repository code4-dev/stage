import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectService } from '../../../../services/project';

@Component({
  selector: 'app-project-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './project-form.html',
  styleUrl: './project-form.css',
})
export class ProjectForm implements OnInit {
  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  projectForm!: FormGroup;
  isEditing: boolean = false;
  projectId: string | null = null;
  submitted: boolean = false;
  statusOptions = [
    { value: 'planification', label: 'Planification' },
    { value: 'en-cours', label: 'En cours' },
    { value: 'termine', label: 'Terminé' },
    { value: 'suspendu', label: 'Suspendu' }
  ];

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    if (this.projectId) {
      this.isEditing = true;
      this.loadProject(this.projectId);
    }
  }

  private initForm(): void {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: ['planification', Validators.required],
      dueDate: ['', Validators.required]
    });
  }

  private loadProject(id: string): void {
    // MODIFICATION : On appelle le service qui fait un appel HTTP GET
    this.projectService.getProjectById(id).subscribe({
      next: (project) => {
        if (project) {
          const dueDateStr = new Date(project.dueDate).toISOString().split('T')[0];
          this.projectForm.patchValue({
            name: project.name,
            description: project.description,
            status: project.status,
            dueDate: dueDateStr
          });
        }
      },
      error: (err) => console.error("Erreur de chargement", err)
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.projectForm.invalid) {
      return;
    }

    const formValue = this.projectForm.value;
    const projectData = {
      name: formValue.name,
      description: formValue.description,
      status: formValue.status,
      dueDate: new Date(formValue.dueDate),
      chefId: '1'
    };

// MODIFICATION : On s'abonne (.subscribe) pour attendre que le Back enregistre
    if (this.isEditing && this.projectId) {
      this.projectService.updateProject(this.projectId, projectData).subscribe({
        next: () => this.router.navigate(['/projects']),
        error: (err) => console.error("Erreur update", err)
      });
    } else {
      this.projectService.createProject(projectData).subscribe({
        next: () => this.router.navigate(['/projects']),
        error: (err) => console.error("Erreur création", err)
      });
    }
  }

  get f() {
    return this.projectForm.controls;
  }
}

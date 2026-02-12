import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrl: './register.css',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  standalone: true
})
export class Register implements OnInit {
   private fb = inject(FormBuilder);
  
  registerForm!: FormGroup;
  submitted = false;
  loading = false;

  // Visibilité des mots de passe
  showPassword = false;
  showConfirmPassword = false;

  // Pour la barre de force du mot de passe
  passwordStrength = 0;
  passwordStrengthLabel = '';
  passwordStrengthColor = 'red';

  // Vérification des règles du mot de passe
  passwordRequirements = {
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
    noRepetition: false
  };

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      numero: ['', [Validators.required, Validators.pattern(/^[\+]?[0-9\s\-\(\)]{10,15}$/)]], // Ajouté
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      role: ['chef', Validators.required]
    }, { validators: this.passwordMatchValidator });

    // Écoute les changements sur le mot de passe
    this.registerForm.get('password')?.valueChanges.subscribe(value => {
      this.evaluatePassword(value || '');
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  getErrorMessage(field: string): string {
    const control = this.f[field];
    if (!control) return '';

    if (field === 'fullName') {
      if (control.errors?.['required']) return 'Le nom complet est obligatoire';
      if (control.errors?.['minlength']) return 'Le nom doit contenir au moins 3 caractères';
    }

    if (field === 'numero') {
      if (control.errors?.['required']) return 'Le numéro est obligatoire';
      if (control.errors?.['pattern']) return 'Format numéro invalide';
    }

    if (field === 'email') {
      if (control.errors?.['required']) return 'L\'email est obligatoire';
      if (control.errors?.['email']) return 'Email invalide';
    }

    if (field === 'password') {
      if (control.errors?.['required']) return 'Le mot de passe est obligatoire';
      if (control.errors?.['minlength']) return 'Minimum 8 caractères';
    }

    if (field === 'confirmPassword') {
      if (control.errors?.['required']) return 'La confirmation est obligatoire';
      if (this.registerForm.errors?.['mismatch']) return 'Les mots de passe ne correspondent pas';
    }

    return '';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  evaluatePassword(password: string) {
    this.passwordRequirements.minLength = password.length >= 8;
    this.passwordRequirements.hasUppercase = /[A-Z]/.test(password);
    this.passwordRequirements.hasLowercase = /[a-z]/.test(password);
    this.passwordRequirements.hasNumber = /[0-9]/.test(password);
    this.passwordRequirements.hasSpecial = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password);

    // Calcul de la force (6 critères max)
    let strength = 0;
    Object.values(this.passwordRequirements).forEach(v => { 
      if (v) strength++; 
    });
    this.passwordStrength = strength;

    // Label et couleur selon la force
    if (strength <= 2) {
      this.passwordStrengthLabel = 'Faible';
      this.passwordStrengthColor = '#dc3545';
    } else if (strength <= 4) {
      this.passwordStrengthLabel = 'Moyen';
      this.passwordStrengthColor = '#ffc107';
    } else {
      this.passwordStrengthLabel = 'Fort';
      this.passwordStrengthColor = '#28a745';
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.registerForm.valid) {
      this.loading = true;

      // TODO: Intégrer AuthService ici
      console.log('✅ Formulaire valide:', this.registerForm.value);

      setTimeout(() => {
        this.loading = false;
        alert('🎉 Compte créé avec succès !');
        this.registerForm.reset({ role: 'chef' });
        this.submitted = false;
        this.passwordStrength = 0;
        this.passwordStrengthLabel = '';
        this.passwordStrengthColor = 'red';
        Object.keys(this.passwordRequirements).forEach(key => {
          this.passwordRequirements[key as keyof typeof this.passwordRequirements] = false;
        });
      }, 1500);
    }
  }
}
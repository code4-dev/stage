import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css']
  
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  submitted = false;
  loading = false;

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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      role: ['chef', Validators.required]
    }, { validator: this.passwordMatchValidator });

    // Écoute les changements sur le mot de passe pour la barre de force
    this.registerForm.get('password')?.valueChanges.subscribe(value => {
      this.evaluatePassword(value);
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

    if (field === 'email') {
      if (control.errors?.['required']) return 'L’email est obligatoire';
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

  evaluatePassword(password: string) {
    this.passwordRequirements.minLength = password.length >= 8;
    this.passwordRequirements.hasUppercase = /[A-Z]/.test(password);
    this.passwordRequirements.hasLowercase = /[a-z]/.test(password);
    this.passwordRequirements.hasNumber = /[0-9]/.test(password);
    this.passwordRequirements.hasSpecial = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password);
    this.passwordRequirements.noRepetition = !/(.)\1\1/.test(password); // pas de triple répétition

    // Calcul de la force du mot de passe
    let strength = 0;
    Object.values(this.passwordRequirements).forEach(v => { if (v) strength++; });
    this.passwordStrength = strength;

    // Label et couleur
    if (strength <= 2) {
      this.passwordStrengthLabel = 'Faible';
      this.passwordStrengthColor = 'red';
    } else if (strength <= 4) {
      this.passwordStrengthLabel = 'Moyen';
      this.passwordStrengthColor = 'orange';
    } else {
      this.passwordStrengthLabel = 'Fort';
      this.passwordStrengthColor = 'green';
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.registerForm.valid) {
      this.loading = true;

      // Ici tu peux appeler ton service backend pour créer le compte
      console.log('Formulaire valide', this.registerForm.value);

      setTimeout(() => {
        this.loading = false;
        alert('Compte créé avec succès !');
        this.registerForm.reset();
        this.submitted = false;
        this.passwordStrength = 0;
      }, 1500);
    } else {
      console.log('Formulaire invalide');
    }
  }
}

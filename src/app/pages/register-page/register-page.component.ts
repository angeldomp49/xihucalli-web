import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { SpinnerComponent } from '../../../commons/spinner/spinner.component';
import { RegisterUserService } from '../../../commons/session/authentication/services/RegisterUserService';
import { SessionManagementService } from '../../../commons/session/management/SessionManagementService';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    SpinnerComponent
  ],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss'
})
export class RegisterPageComponent implements OnInit {
  public registerForm!: FormGroup;
  public loading = false;
  public errorMessage: string | null = null;

  private operationId: string | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly registerService: RegisterUserService,
    private readonly sessionManagement: SessionManagementService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadOperationId();
  }

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-Z0-9_-]+$/)
      ]]
    });
  }

  private loadOperationId(): void {
    this.operationId = this.route.snapshot.queryParamMap.get('operation_id');

    if (!this.operationId) {
      this.errorMessage = 'Invalid registration request. Missing operation ID.';
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid || !this.operationId) {
      this.markAllFieldsAsTouched();
      return;
    }

    const { displayName, username } = this.registerForm.value;
    this.performRegistration(displayName, username);
  }

  private performRegistration(displayName: string, username: string): void {
    this.loading = true;
    this.errorMessage = null;

    this.registerService.registerNewUser(this.operationId!, displayName, username)
      .subscribe({
        next: (response) => this.handleRegistrationSuccess(response.token),
        error: (error) => this.handleRegistrationError(error)
      });
  }

  private handleRegistrationSuccess(token: string): void {
    this.sessionManagement.login(token);
    this.router.navigate([environment.homeEndpoint]);
  }

  private handleRegistrationError(error: any): void {
    this.loading = false;
    this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);

    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }

    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
    }

    if (field.errors['pattern']) {
      return 'Username can only contain letters, numbers, hyphens, and underscores';
    }

    return 'Invalid value';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      displayName: 'Display name',
      username: 'Username'
    };
    return labels[fieldName] || fieldName;
  }
}



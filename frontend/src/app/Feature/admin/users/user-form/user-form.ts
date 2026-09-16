import { Component, OnInit, computed, inject, input, output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserGender,
} from '../../../../core/models/user.model';

export type UserFormSubmit =
  | { mode: 'create'; data: CreateUserRequest }
  | { mode: 'edit'; data: UpdateUserRequest };

type GenderValue = '' | UserGender;

interface CreateFormShape {
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
}

interface EditFormShape {
  name: FormControl<string>;
  phone: FormControl<string>;
  dateOfBirth: FormControl<string>;
  gender: FormControl<GenderValue>;
  image: FormControl<string>;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm implements OnInit {
  private fb = inject(NonNullableFormBuilder);

  mode = input<'create' | 'edit'>('create');
  user = input<User | null>(null);
  saving = input(false);
  serverError = input<string | null>(null);

  save = output<UserFormSubmit>();
  close = output<void>();

  protected title = computed(() =>
    this.mode() === 'create' ? 'Add New User' : `Edit User: ${this.user()?.name}`,
  );

  protected subtitle = computed(() =>
    this.mode() === 'create'
      ? 'Create a new patron account'
      : 'Cinema patron account metadata',
  );

  protected createForm: FormGroup<CreateFormShape> = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected editForm: FormGroup<EditFormShape> = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    phone: [''],
    dateOfBirth: [''],
    gender: this.fb.control<GenderValue>(''),
    image: [''],
  });

  protected get activeForm(): FormGroup<CreateFormShape> | FormGroup<EditFormShape> {
    return this.mode() === 'create' ? this.createForm : this.editForm;
  }

  ngOnInit(): void {
    const user = this.user();
    if (this.mode() === 'edit' && user) {
      this.editForm.setValue({
        name: user.name,
        phone: user.phone ?? '',
        dateOfBirth: this.toDateInputValue(user.dateOfBirth),
        gender: user.gender ?? '',
        image: user.image ?? '',
      });
    }
  }

  protected onSubmit(): void {
    if (this.saving()) {
      return;
    }
    const active = this.activeForm;
    if (active.invalid) {
      active.markAllAsTouched();
      return;
    }

    if (this.mode() === 'create') {
      const { name, email, password } = this.createForm.getRawValue();
      this.save.emit({
        mode: 'create',
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        },
      });
      return;
    }

    const values = this.editForm.getRawValue();
    const data: UpdateUserRequest = { name: values.name.trim() };
    const phone = values.phone.trim();
    if (phone) {
      data.phone = phone;
    }
    if (values.dateOfBirth) {
      data.dateOfBirth = values.dateOfBirth;
    }
    if (values.gender) {
      data.gender = values.gender;
    }
    const image = values.image.trim();
    if (image) {
      data.image = image;
    }
    this.save.emit({ mode: 'edit', data });
  }

  protected hasError(controlName: string, validator: string): boolean {
    const control = this.controlOf(controlName);
    return (
      !!control &&
      control.touched &&
      control.invalid &&
      !!control.errors?.[validator]
    );
  }

  protected validationMessage(controlName: string, validator: string): string {
    if (validator === 'required') {
      return 'This field is required.';
    }
    if (validator === 'email') {
      return 'Enter a valid email address.';
    }
    if (validator === 'minlength') {
      const control = this.controlOf(controlName);
      const required = control?.errors?.['minlength'] as
        | { requiredLength?: number }
        | null;
      return required?.requiredLength
        ? `Must be at least ${required.requiredLength} characters.`
        : 'Value is too short.';
    }
    if (validator === 'maxlength') {
      const control = this.controlOf(controlName);
      const required = control?.errors?.['maxlength'] as
        | { requiredLength?: number }
        | null;
      return required?.requiredLength
        ? `Must be ${required.requiredLength} characters or fewer.`
        : 'Value is too long.';
    }
    return 'Enter a valid value.';
  }

  private controlOf(controlName: string): AbstractControl | null {
    return this.mode() === 'create'
      ? this.createForm.get(controlName)
      : this.editForm.get(controlName);
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  protected onEscape(): void {
    this.close.emit();
  }

  protected onCancel(): void {
    this.close.emit();
  }

  private toDateInputValue(value: string | undefined): string {
    if (!value) {
      return '';
    }
    const date = value.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '';
  }
}
import { Component, OnInit, computed, inject, input, output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CreateHallRequest, Hall, UpdateHallRequest } from '../../../../core/models/hall.model';

export type HallFormSubmit =
  | { mode: 'create'; data: CreateHallRequest }
  | { mode: 'edit'; data: UpdateHallRequest };

interface HallFormShape {
  name: FormControl<string>;
  rows: FormControl<number>;
  seatsPerRow: FormControl<number>;
}

@Component({
  selector: 'app-hall-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './hall-form.html',
  styleUrl: './hall-form.css',
})
export class HallForm implements OnInit {
  private fb = inject(NonNullableFormBuilder);

  mode = input<'create' | 'edit'>('create');
  hall = input<Hall | null>(null);
  saving = input(false);
  serverError = input<string | null>(null);

  save = output<HallFormSubmit>();
  close = output<void>();

  protected title = computed(() =>
    this.mode() === 'create'
      ? 'Add New Hall'
      : `Edit Hall: ${this.hall()?.name ?? ''}`,
  );

  protected subtitle = computed(() =>
    this.mode() === 'create'
      ? 'Configure geometric seating capacity'
      : 'Update hall configuration and seating layout',
  );

  protected form: FormGroup<HallFormShape> = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
    rows: [1, [Validators.required, Validators.min(1), Validators.max(26)]],
    seatsPerRow: [1, [Validators.required, Validators.min(1)]],
  });

  protected previewTotal = computed(() => {
    const rows = Number(this.form.controls.rows.value) || 0;
    const cols = Number(this.form.controls.seatsPerRow.value) || 0;
    return rows * cols;
  });

  protected previewColumns = computed(() => {
    const cols = this.form.controls.seatsPerRow.value;
    return Math.min(Number(cols) || 1, 16);
  });

  protected previewRows = computed(() => {
    const rows = this.form.controls.rows.value;
    return Math.min(Number(rows) || 1, 8);
  });

  protected previewSeats = computed(() => {
    const count = this.previewRows() * this.previewColumns();
    return Array.from({ length: count }, (_, i) => i);
  });

  ngOnInit(): void {
    const hall = this.hall();
    if (this.mode() === 'edit' && hall) {
      this.form.setValue({
        name: hall.name,
        rows: hall.rows,
        seatsPerRow: hall.seatsPerRow,
      });
    }
  }

  protected onSubmit(): void {
    if (this.saving()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const values = this.form.getRawValue();
    const data: CreateHallRequest = {
      name: values.name.trim(),
      rows: values.rows,
      seatsPerRow: values.seatsPerRow,
    };
    if (this.mode() === 'create') {
      this.save.emit({ mode: 'create', data });
    } else {
      this.save.emit({ mode: 'edit', data });
    }
  }

  protected hasError(controlName: string, validator: string): boolean {
    const control = this.form.get(controlName);
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
    if (validator === 'minlength') {
      const control = this.form.get(controlName);
      const min = control?.errors?.['minlength'] as
        | { requiredLength?: number }
        | null;
      return min?.requiredLength
        ? `Must be at least ${min.requiredLength} character${min.requiredLength > 1 ? 's' : ''}.`
        : 'Value is too short.';
    }
    if (validator === 'maxlength') {
      const control = this.form.get(controlName);
      const max = control?.errors?.['maxlength'] as
        | { requiredLength?: number }
        | null;
      return max?.requiredLength
        ? `Must be ${max.requiredLength} characters or fewer.`
        : 'Value is too long.';
    }
    if (validator === 'min') {
      const control = this.form.get(controlName);
      const min = control?.errors?.['min'] as { min?: number } | null;
      return min?.min !== undefined
        ? `Must be at least ${min.min}.`
        : 'Value is too low.';
    }
    if (validator === 'max') {
      const control = this.form.get(controlName);
      const max = control?.errors?.['max'] as { max?: number } | null;
      return max?.max !== undefined
        ? `Must be ${max.max} or lower.`
        : 'Value is too high.';
    }
    return 'Enter a valid value.';
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  protected onEscape(): void {
    if (this.saving()) {
      return;
    }
    this.close.emit();
  }

  protected onCancel(): void {
    if (this.saving()) {
      return;
    }
    this.close.emit();
  }
}
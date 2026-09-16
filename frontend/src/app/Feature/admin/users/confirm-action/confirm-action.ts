import { Component, input, output } from '@angular/core';

export type ConfirmActionVariant = 'danger' | 'primary';

@Component({
  selector: 'app-confirm-action',
  standalone: true,
  templateUrl: './confirm-action.html',
  styleUrl: './confirm-action.css',
})
export class ConfirmAction {
  title = input('');
  message = input('');
  confirmLabel = input('');
  busy = input(false);
  serverError = input<string | null>(null);
  variant = input<ConfirmActionVariant>('danger');

  confirm = output<void>();
  close = output<void>();

  protected onConfirm(): void {
    if (this.busy()) {
      return;
    }
    this.confirm.emit();
  }

  protected onCancel(): void {
    if (this.busy()) {
      return;
    }
    this.close.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
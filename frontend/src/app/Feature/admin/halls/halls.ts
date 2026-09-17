import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HallService } from '../../../core/services/hall.service';
import { Hall, HallSeat } from '../../../core/models/hall.model';
import { HallForm, HallFormSubmit } from './hall-form/hall-form';

@Component({
  selector: 'app-halls',
  standalone: true,
  imports: [HallForm],
  templateUrl: './halls.html',
  styleUrl: './halls.css',
})
export class Halls {
  private hallService = inject(HallService);

  protected halls = signal<Hall[]>([]);
  protected loading = signal(true);
  protected loadError = signal<string | null>(null);

  protected formOpen = signal(false);
  protected formMode = signal<'create' | 'edit'>('create');
  protected editingHall = signal<Hall | null>(null);
  protected formSaving = signal(false);
  protected formError = signal<string | null>(null);

  protected deleteTarget = signal<Hall | null>(null);
  protected deleteSaving = signal(false);
  protected deleteError = signal<string | null>(null);

  protected skeletonCards = [0, 1, 2, 3, 4, 5];

  protected totalSeats = computed(() =>
    this.halls().reduce((sum, hall) => sum + this.capacityOf(hall), 0),
  );
  protected busy = computed(() => this.formSaving() || this.deleteSaving());

  constructor() {
    void this.loadHalls();
  }

  async loadHalls(quiet = false): Promise<void> {
    if (!quiet) {
      this.loading.set(true);
      this.loadError.set(null);
    }
    try {
      const response = await firstValueFrom(this.hallService.getHalls());
      this.halls.set(response.results);
      this.loadError.set(null);
    } catch (error) {
      if (!quiet) {
        this.loadError.set(this.toErrorMessage(error));
      }
    } finally {
      this.loading.set(false);
    }
  }

  protected capacityOf(hall: Hall): number {
    return hall.capacity ?? hall.rows * hall.seatsPerRow;
  }

  protected previewColumns(hall: Hall): number {
    return Math.min(hall.seatsPerRow, 16);
  }

  protected previewSeats(hall: Hall): HallSeat[] {
    const rowCap = Math.min(hall.rows, 8);
    const colCap = Math.min(hall.seatsPerRow, 16);
    if (hall.seatMap.length > 0) {
      return hall.seatMap.slice(0, rowCap * colCap);
    }
    const seats: HallSeat[] = [];
    for (let r = 0; r < rowCap; r++) {
      const rowLabel = String.fromCharCode(65 + r);
      for (let n = 1; n <= colCap; n++) {
        seats.push({ row: rowLabel, number: n, type: 'standard' });
      }
    }
    return seats;
  }

  protected shortId(id: string): string {
    return id.length > 10 ? id.slice(0, 10) : id;
  }

  protected openCreate(): void {
    this.formMode.set('create');
    this.editingHall.set(null);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(hall: Hall): void {
    this.formMode.set('edit');
    this.editingHall.set(hall);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    if (this.formSaving()) {
      return;
    }
    this.formOpen.set(false);
  }

  protected async onFormSubmit(submit: HallFormSubmit): Promise<void> {
    if (this.formSaving()) {
      return;
    }
    this.formSaving.set(true);
    this.formError.set(null);
    try {
      if (submit.mode === 'create') {
        await firstValueFrom(this.hallService.createHall(submit.data));
        await this.loadHalls(true);
      } else {
        const editing = this.editingHall();
        if (!editing) {
          return;
        }
        const response = await firstValueFrom(
          this.hallService.updateHall(editing._id, submit.data),
        );
        this.halls.update((list) =>
          list.map((hall) => (hall._id === editing._id ? response.result : hall)),
        );
      }
      this.formOpen.set(false);
    } catch (error) {
      this.formError.set(this.toErrorMessage(error));
    } finally {
      this.formSaving.set(false);
    }
  }

  protected confirmDelete(hall: Hall): void {
    this.deleteError.set(null);
    this.deleteTarget.set(hall);
  }

  protected closeDelete(): void {
    if (this.deleteSaving()) {
      return;
    }
    this.deleteTarget.set(null);
  }

  protected onDeleteBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDelete();
    }
  }

  protected async runDelete(): Promise<void> {
    const hall = this.deleteTarget();
    if (!hall || this.deleteSaving()) {
      return;
    }
    this.deleteSaving.set(true);
    this.deleteError.set(null);
    try {
      await firstValueFrom(this.hallService.deleteHall(hall._id));
      this.halls.update((list) => list.filter((h) => h._id !== hall._id));
      this.deleteTarget.set(null);
      await this.loadHalls(true);
    } catch (error) {
      this.deleteError.set(this.toErrorMessage(error));
    } finally {
      this.deleteSaving.set(false);
    }
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as { message?: unknown } | null;
      if (body && typeof body.message === 'string') {
        return body.message;
      }
      if (error.status === 0) {
        return 'Could not reach the server. Check your connection and try again.';
      }
    }
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return 'Something went wrong. Please try again.';
  }
}
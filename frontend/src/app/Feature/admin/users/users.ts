import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { User, UserRole } from '../../../core/models/user.model';
import {
  ConfirmAction,
  ConfirmActionVariant,
} from './confirm-action/confirm-action';
import { UserForm, UserFormSubmit } from './user-form/user-form';

type UsersFilter = 'all' | 'active' | 'deleted';
type ConfirmKind = 'ban' | 'delete' | 'restore' | 'role';

interface ConfirmState {
  kind: ConfirmKind;
  user: User;
  title: string;
  message: string;
  confirmLabel: string;
  variant: ConfirmActionVariant;
  newRole?: UserRole;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [UserForm, ConfirmAction],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  private userService = inject(UserService);

  protected users = signal<User[]>([]);
  protected loading = signal(true);
  protected loadError = signal<string | null>(null);
  protected filter = signal<UsersFilter>('active');

  protected formOpen = signal(false);
  protected formMode = signal<'create' | 'edit'>('create');
  protected editingUser = signal<User | null>(null);
  protected formSaving = signal(false);
  protected formError = signal<string | null>(null);

  protected confirmState = signal<ConfirmState | null>(null);
  protected confirmSaving = signal(false);
  protected confirmError = signal<string | null>(null);

  protected skeletonRows = [0, 1, 2, 3, 4];

  protected filters: { value: UsersFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'deleted', label: 'Deleted' },
  ];

  protected roleOptions: UserRole[] = ['user', 'admin'];

  protected adminCount = computed(
    () => this.users().filter((user) => user.role === 'admin').length,
  );
  protected memberCount = computed(
    () => this.users().filter((user) => user.role === 'user').length,
  );
  protected busy = computed(() => this.formSaving() || this.confirmSaving());

  constructor() {
    void this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    try {
      let params: HttpParams | undefined;
      if (this.filter() === 'deleted') {
        params = new HttpParams().set('deleted', 'true');
      } else if (this.filter() === 'all') {
        params = new HttpParams().set('all', 'true');
      }
      const response = await firstValueFrom(this.userService.getUsers(params));
      this.users.set(response.results);
    } catch (error) {
      this.loadError.set(this.toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  protected setFilter(filter: UsersFilter): void {
    if (filter === this.filter()) {
      return;
    }
    this.filter.set(filter);
    void this.loadUsers();
  }

  protected initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase() || '?';
  }

  protected shortId(id: string): string {
    return id.length > 10 ? id.slice(0, 10) : id;
  }

  protected roleLabel(role: UserRole): string {
    return role === 'admin' ? 'Admin' : 'User';
  }

  protected openCreate(): void {
    this.formMode.set('create');
    this.editingUser.set(null);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(user: User): void {
    this.formMode.set('edit');
    this.editingUser.set(user);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    if (this.formSaving()) {
      return;
    }
    this.formOpen.set(false);
  }

  protected async onFormSubmit(submit: UserFormSubmit): Promise<void> {
    if (this.formSaving()) {
      return;
    }
    this.formSaving.set(true);
    this.formError.set(null);
    try {
      if (submit.mode === 'create') {
        await firstValueFrom(this.userService.createUser(submit.data));
        await this.loadUsers();
      } else {
        const editing = this.editingUser();
        if (!editing) {
          return;
        }
        const response = await firstValueFrom(
          this.userService.updateUser(editing._id, submit.data),
        );
        this.users.update((list) =>
          list.map((user) => (user._id === editing._id ? response.result : user)),
        );
      }
      this.formOpen.set(false);
    } catch (error) {
      this.formError.set(this.toErrorMessage(error));
    } finally {
      this.formSaving.set(false);
    }
  }

  protected confirmForBan(user: User): void {
    this.confirmError.set(null);
    this.confirmState.set({
      kind: 'ban',
      user,
      title: 'Ban user?',
      message: `Are you sure you want to ban ${user.name}? They will immediately lose access to booking tickets. Banned accounts cannot be restored from this console.`,
      confirmLabel: 'Ban',
      variant: 'danger',
    });
  }

  protected confirmForDelete(user: User): void {
    this.confirmError.set(null);
    this.confirmState.set({
      kind: 'delete',
      user,
      title: 'Delete user?',
      message: `Are you sure you want to delete ${user.name}? This is a destructive soft-delete that removes the account from the active directory.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
  }

  protected confirmForRestore(user: User): void {
    this.confirmError.set(null);
    this.confirmState.set({
      kind: 'restore',
      user,
      title: 'Restore user?',
      message: `Are you sure you want to restore ${user.name}? Their existing data will be preserved and the account will return to the active directory.`,
      confirmLabel: 'Restore',
      variant: 'primary',
    });
  }

  protected confirmRoleChange(user: User, select: HTMLSelectElement): void {
    const newRole = select.value as UserRole;
    if (newRole === user.role) {
      return;
    }
    select.value = user.role;
    this.confirmError.set(null);
    this.confirmState.set({
      kind: 'role',
      user,
      newRole,
      title: 'Change role?',
      message: `Change ${user.name}'s role from ${this.roleLabel(user.role)} to ${this.roleLabel(newRole)}? This will update their console privileges.`,
      confirmLabel: 'Change Role',
      variant: 'primary',
    });
  }

  protected closeConfirm(): void {
    if (this.confirmSaving()) {
      return;
    }
    this.confirmState.set(null);
  }

  protected async runConfirmAction(): Promise<void> {
    const state = this.confirmState();
    if (!state || this.confirmSaving()) {
      return;
    }
    this.confirmSaving.set(true);
    this.confirmError.set(null);
    try {
      if (state.kind === 'ban') {
        await firstValueFrom(this.userService.banUser(state.user._id));
        this.applyStatusChange(state.user._id, { isActive: false });
      } else if (state.kind === 'delete') {
        await firstValueFrom(this.userService.deleteUser(state.user._id));
        this.applyStatusChange(state.user._id, {
          isDeleted: true,
          deletedAt: new Date().toISOString(),
        });
      } else if (state.kind === 'restore') {
        await firstValueFrom(this.userService.restoreUser(state.user._id));
        this.applyStatusChange(state.user._id, {
          isDeleted: false,
          deletedAt: null,
        });
      } else if (state.kind === 'role') {
        if (!state.newRole) {
          return;
        }
        const response = await firstValueFrom(
          this.userService.changeUserRole(state.user._id, {
            role: state.newRole,
          }),
        );
        this.users.update((list) =>
          list.map((user) => (user._id === state.user._id ? response.result : user)),
        );
      }
      this.confirmState.set(null);
    } catch (error) {
      this.confirmError.set(this.toErrorMessage(error));
    } finally {
      this.confirmSaving.set(false);
    }
  }

  private applyStatusChange(
    id: string,
    partial: Partial<Pick<User, 'isActive' | 'isDeleted' | 'deletedAt'>>,
  ): void {
    if (this.filter() === 'all') {
      this.users.update((list) =>
        list.map((user) => (user._id === id ? { ...user, ...partial } : user)),
      );
    } else if (this.filter() === 'active') {
      if (partial.isActive === false || partial.isDeleted === true) {
        this.users.update((list) => list.filter((user) => user._id !== id));
      }
    } else if (this.filter() === 'deleted') {
      if (partial.isDeleted === false) {
        this.users.update((list) => list.filter((user) => user._id !== id));
      }
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
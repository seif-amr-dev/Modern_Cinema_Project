import { Component, inject, input, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
})
export class AdminSidebar {
  private authService = inject(AuthService);
  private router = inject(Router);

  isOpen = input(false);
  readonly close = output<void>();

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
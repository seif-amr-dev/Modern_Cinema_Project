import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-placeholder',
  standalone: true,
  templateUrl: './admin-placeholder.html',
  styleUrl: './admin-placeholder.css',
})
export class AdminPlaceholder {
  private route = inject(ActivatedRoute);

  title = String(this.route.snapshot.data['title'] ?? 'Admin');
  phase = String(this.route.snapshot.data['phase'] ?? '');
}
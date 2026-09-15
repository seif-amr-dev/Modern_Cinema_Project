import { Component, signal } from '@angular/core';

import { Auth } from './Feature/auth/auth';
import { Navbar } from './shared/navbar/navbar';

@Component({
  imports: [Auth, Navbar],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend');
}

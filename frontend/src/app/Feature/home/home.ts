import { Component } from '@angular/core';
import { MovieGrid } from '../movie-grid/movie-grid';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MovieGrid],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
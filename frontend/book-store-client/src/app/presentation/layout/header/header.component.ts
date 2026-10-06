import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookStoreState } from '../../../core/application/state/book-store.service';
import { Genre } from '../../../core/domain/models/book.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule],
  template: `
    <header class="flex justify-between items-center p-4">
      <h1 class="text-2xl font-bold">Lockheed Martin BookStore Client v1</h1>
  `
})
export class HeaderComponent {
  store = inject(BookStoreState);
  genres: Genre[] = [
      'Fiction',
      'SciFi',
      'Fantasy',
      'Mystery',
      'Biography',
      'NonFiction',
      'Children',
      'History',
];

  onGenreChange(genre: Genre | undefined) {
    this.store.setGenreFilter(genre);
  }
}
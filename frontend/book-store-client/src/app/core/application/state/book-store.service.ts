import { Injectable, signal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BOOK_REPOSITORY } from '../../../infrastructure/di/tokens';
import { Book, Genre } from '../../domain/models/book.model';

@Injectable({ providedIn: 'root' })
export class BookStoreState {
  private readonly bookRepo = inject(BOOK_REPOSITORY);

  // Core Data State
  readonly books = signal<Book[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly loading = signal<boolean>(false);
  
  // Filter & Pagination State (Read by Body, Written by Header/Body)
  readonly selectedGenre = signal<Genre | undefined>(undefined);
  readonly currentPage = signal<number>(1);
  readonly currentSort = signal<string>('title');

  // Actions
  setGenreFilter(genre: Genre | undefined) {
    this.selectedGenre.set(genre);
    this.currentPage.set(1); // Reset pagination on filter change
    this.loadBooks();
  }

  async loadBooks() {
    const GENRES: Genre[] = [
      'Fiction',   // 0
      'SciFi',     // 1
      'Fantasy',   // 2
      'Mystery',   // 3
      'Biography', // 4
      'NonFiction',// 5
      'Children',  // 6
      'History'    // 7
    ];

    this.loading.set(true);
    try {
      // Calls the Infrastructure layer purely through the Domain interface
      const results = await firstValueFrom(
        this.bookRepo.getBooks(this.currentPage(), this.currentSort(), this.selectedGenre())
      );
      this.books.set(results.data.map(e => ({
        id: e.id,
        title: e.title,
        author: e.author,
        isbn: e.isbn,
        genreId: (e.genreId ?? 0) + 0,
        genre: GENRES[(e.genreId ?? 1) - 1],
        price: e.price,
        stock: e.stock,
        coverUrl: e.coverUrl,
        publishedYear: e.publishedYear,
        openLibraryKey: e.openLibraryKey,
        description: e.description,
      })));
      this.totalRecords.set(results.count);
      console.log(results);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      this.loading.set(false);
    }
  }
}
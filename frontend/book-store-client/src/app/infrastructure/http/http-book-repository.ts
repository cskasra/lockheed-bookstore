import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBookRepository } from '../../core/domain/ports/repositories';
import { Book, Genre } from '../../core/domain/models/book.model';
import { BookStoreState } from '../../core/application/state/book-store.service';

@Injectable({ providedIn: 'root' })
export class HttpBookRepository implements IBookRepository {
  private readonly http = inject(HttpClient);
  private readonly  apiUrl = 'https://localhost:7478/api/books'; // TODO: replace url with one defined in the env
  
  getBooks(page: number, sort: string, genre?: Genre): Observable<Book[]> {
    let params = new HttpParams().set('_page', page).set('_sort', sort);
    if (genre) params = params.set('genre', genre);
    return this.http.get<Book[]>(this.apiUrl, { params });
  }

  addBook(book: Omit<Book, 'id'>): Observable<Book> {
    return this.http.post<Book>(this.apiUrl, book);
  }

  updateBook(id: string, book: Partial<Book>): Observable<Book> {
    return this.http.patch<Book>(`${this.apiUrl}/${id}`, book);
  }

  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
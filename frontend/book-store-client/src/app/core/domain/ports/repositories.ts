import { Observable } from 'rxjs';
import { Book, CatalogItem, Genre } from '../models/book.model';

export interface IBookRepository {
  getBooks(page: number, sort: string, genre?: Genre): Observable<Book[]>;
  addBook(book: Omit<Book, 'id'>): Observable<Book>;
  updateBook(id: string, book: Partial<Book>): Observable<Book>;
  deleteBook(id: string): Observable<void>;
}

export interface ICatalogRepository {
  search(apiUrl: string, query: string): Observable<CatalogItem[]>;
}
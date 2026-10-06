// TODO: Source Genre from database table "Genre"
export type Genre =
      'Fiction' |
      'SciFi' |
      'Fantasy' |
      'Mystery' |
      'Biography' |
      'NonFiction' |
      'Children' |
      'History';
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  genreId?: number;
  genre?: Genre;
  price: number;
  stock?: number;
  coverUrl?: string;
  publishedYear?: number;
  openLibraryKey: string;
  description: string;
}
export interface BookResponse {
  data: Book[];
  count: number;
}
export interface CatalogItem {
  title: string;
  author: string;
  isbn: string;
  coverThumbnail: string;
  year: number;
  openLibraryKey: string;
  description: string;
}
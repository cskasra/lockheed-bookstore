import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ICatalogRepository } from '../../core/domain/ports/repositories';
import { CatalogItem } from '../../core/domain/models/book.model';
import { destroyDetachedRouteHandle } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class HttpCatalogRepository implements ICatalogRepository {
  private readonly http = inject(HttpClient);

  search(apiUrl: string, query: string): Observable<CatalogItem[]> {
    return this.http.get<any>(`${apiUrl}/search?titleAuthorIsbn=${query}`)
      .pipe(
        map(response => response.map((doc: any) => ({
          title: doc.title ?? "",
          author: doc.author ?? "",
          isbn: doc.isbn ?? "",
          coverThumbnail: doc.coverUrl ?? "",
          year: doc.publishedYear ?? "",
          openLibraryKey: doc.openLibraryKey ?? "",
          description: doc.description ?? "",
        })))
      );
  }
}

import { InjectionToken } from '@angular/core';
import { IBookRepository, ICatalogRepository } from '../../core/domain/ports/repositories';

// These tokens allow Angular to inject the concrete HTTP classes 
// into components that only ask for the Domain interfaces.
export const BOOK_REPOSITORY = new InjectionToken<IBookRepository>('BOOK_REPOSITORY');
export const CATALOG_REPOSITORY = new InjectionToken<ICatalogRepository>('CATALOG_REPOSITORY');
import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';
import { CATALOG_REPOSITORY, BOOK_REPOSITORY } from '../../../infrastructure/di/tokens';
import { CatalogItem, Genre } from '../../../core/domain/models/book.model';
import { BookStoreState } from '../../../core/application/state/book-store.service';

@Component({
  selector: 'app-add-book-flow',
  standalone: true,
  // ADDED: ToastModule to imports, and MessageService to providers
  imports: [CommonModule, FormsModule, Dialog, InputText, Button, Select, InputNumber, ToastModule],
  providers: [MessageService],
  template: `
    <!-- ADDED: Toast component to render the popups -->
    <p-toast></p-toast>

    <p-dialog 
      header="Add New Book" 
      [visible]="true" 
      (onHide)="close.emit()" 
      [modal]="true" 
      styleClass="w-[60vw] [&_.p-dialog-title]:mx-auto [&_.p-dialog-title]:pl-8" 
      headerStyleClass="!p-[12px] border-b border-gray-200"
      contentStyleClass="!p-[12px]"
    >
      
      <!-- STEP 1: Search Open Library -->
      <div *ngIf="step() === 1" class="mt-2">
        <h3 class="font-semibold mb-4 text-gray-700">Step 1: Search Catalog</h3>
        
        <div class="flex gap-[12px] mb-4 items-center">
          <input 
            pInputText 
            [(ngModel)]="searchQuery" 
            placeholder="Search by title, author, or ISBN" 
            class="grow border border-solid border-gray-300 rounded px-3 py-2 text-[0.9em]" 
            (keydown.enter)="onSearch()" 
          />
          <p-button label="Search" icon="pi pi-search" (onClick)="onSearch()" [loading]="isSearching()"></p-button>
        </div>

        <div *ngIf="searchResults().length > 0" class="flex flex-col max-h-96 overflow-y-auto">
          <div *ngFor="let item of searchResults()" 
              class="flex gap-[12px] p-[12px] border-t border-solid border-gray-200 hover:bg-gray-50 cursor-pointer transition items-start"
              (click)="selectItem(item)">

            <!-- LEFT COLUMN (Image) -->
            <div class="shrink-0 w-[90px] h-[120px]">
              <img 
                [src]="item.coverThumbnail || 'assets/placeholder.png'" 
                class="w-full h-full object-cover shadow-sm bg-gray-200 rounded-sm"
              />
            </div>

            <!-- RIGHT COLUMN (Info) -->
            <div class="flex items-start justify-between grow">
              <div class="flex flex-col gap-1">
                <h4 class="text-[0.9em] text-black font-bold leading-tight">{{item.title}}</h4>
                <p class="text-[0.9em] text-gray-600">{{item.author}} ({{item.year}})</p>
                <p class="text-[0.8em] text-gray-400">ISBN: {{item.isbn}}</p>
                <p class="text-[0.8em] text-gray-400">Key: {{item.openLibraryKey}}</p>
                <p class="italic text-[0.8em] bg-[#ffffe0] text-gray-700 px-1 mt-1 rounded w-fit">
                  {{item.description?.substr(0, 100)}}{{ (item.description?.length || 0) > 100 ? "..." : "" }}
                </p>
              </div>

              <p-button icon="pi pi-check" [text]="true" rounded="true"></p-button>
            </div>
          </div>
        </div>
        
        <p *ngIf="!isSearching() && hasSearched() && searchResults().length === 0" class="text-[0.8em] text-red-800 mt-2">
          No results found. Try a different term.
        </p>
      </div>

      <!-- STEP 2: Fill Local Details (Genre, Price) -->
      <div *ngIf="step() === 2" class="flex flex-col gap-[12px] mt-2">
        <h3 class="font-semibold text-gray-700 mb-2">Step 2: Set Store Details</h3>
        
        <div class="flex gap-[12px] items-start p-[12px] bg-gray-50 rounded border border-solid border-gray-200 mb-2">
          <img 
            [src]="selectedItem()?.coverThumbnail || 'assets/placeholder.png'" 
            class="w-[120px] h-[160px] shrink-0 object-cover shadow-sm bg-gray-200 rounded-sm"
          />

          <div class="flex flex-col gap-1">
            <h4 class="text-[0.9em] text-black font-bold">{{selectedItem()?.title}}</h4>
            <p class="text-[0.9em] text-gray-600">{{selectedItem()?.author}} ({{selectedItem()?.year}})</p>
            <p class="text-[0.8em] text-gray-400">ISBN: {{selectedItem()?.isbn}}</p>
            <p class="text-[0.8em] text-gray-400">Key: {{selectedItem()?.openLibraryKey}}</p>
            <p class="italic text-[0.8em] bg-[#ffffe0] text-gray-700 px-1 mt-1 rounded w-fit">
              {{selectedItem()?.description?.substr(0, 100)}}{{ (selectedItem()?.description?.length || 0) > 100 ? "..." : "" }}
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-[12px] w-full">
          
          <div class="flex flex-col gap-1 w-full">
            <label class="text-[0.8em] font-medium text-gray-700">Genre</label>
            <p-select
              [options]="genres"
              [(ngModel)]="selectedGenre"
              placeholder="Select a Genre"
              appendTo="body"
              class="w-full"
              styleClass="w-full"
            ></p-select>
          </div>
          
          <div class="flex flex-col gap-1 w-full">
            <label class="text-[0.8em] font-medium text-gray-700">Price ($)</label>
            <p-inputnumber 
              [style]="{ width: '100%', minWidth: '200px' }"
              styleClass="w-full"
              inputStyleClass="border border-solid border-gray-300 rounded w-full px-3 py-2" 
              class="text-[0.8em] block w-full" 
              [(ngModel)]="price" 
              mode="currency" 
              currency="USD" 
              locale="en-US">
            </p-inputnumber>            
          </div>
          
          <div class="flex flex-col gap-1 w-full">
            <label class="text-[0.8em] font-medium text-gray-700"># in Stock</label>
            <p-inputnumber 
              [style]="{ width: '100%', minWidth: '200px' }"
              styleClass="w-full"
              inputStyleClass="border border-solid border-gray-300 rounded w-full px-3 py-2" 
              class="text-[0.8em] block w-full" 
              [(ngModel)]="stock">
            </p-inputnumber>            
          </div>

        </div>

        <div class="flex justify-end gap-[12px] mt-4 pt-4 border-t border-solid border-gray-200">
          <p-button label="Back" icon="pi pi-arrow-left" severity="secondary" [text]="true" (onClick)="step.set(1)" [disabled]="isSaving()"></p-button>
          <!-- ADDED: [loading]="isSaving()" -->
          <p-button label="Save to Catalog" icon="pi pi-save" (onClick)="onSave()" [disabled]="!selectedGenre || !price" [loading]="isSaving()"></p-button>
        </div>
      </div>
    </p-dialog>
  `
})
export class AddBookFlowComponent {
  @Output() close = new EventEmitter<void>();
  
  private readonly catalogRepo = inject(CATALOG_REPOSITORY);
  private readonly bookRepo = inject(BOOK_REPOSITORY);
  private readonly store = inject(BookStoreState);
  private readonly messageService = inject(MessageService); // ADDED
  private readonly apiUrl = 'https://localhost:7478/api/books';

  step = signal<1 | 2>(1);
  
  searchQuery = '';
  isSearching = signal(false);
  hasSearched = signal(false);
  isSaving = signal(false); // ADDED
  searchResults = signal<CatalogItem[]>([]);
  
  selectedItem = signal<CatalogItem | null>(null);
  
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
  
  selectedGenre?: Genre;
  price?: number;
  stock?: number;

  async onSearch() {
    if (!this.searchQuery.trim()) return;
    this.isSearching.set(true);
    this.hasSearched.set(true);
    try {
      const results = await firstValueFrom(this.catalogRepo.search(this.apiUrl, this.searchQuery));
      console.log(results);
      this.searchResults.set(results);
    } catch (e) {
      console.error('Search failed', e);
      this.searchResults.set([]);
    } finally {
      this.isSearching.set(false);
    }
  }

  selectItem(item: CatalogItem) {
    this.selectedItem.set(item);
    this.step.set(2);
  }

  // UPDATED: Added try/catch and toast notifications
  async onSave() {
    const item = this.selectedItem();
    if (!item || !this.selectedGenre || !this.price || !this.stock) return;
    
    this.isSaving.set(true);

    try {
      await firstValueFrom(this.bookRepo.addBook({
        title: item.title,
        author: item.author,
        isbn: item.isbn,
        genreId: this.genres.indexOf(this.selectedGenre) + 1,
        price: this.price,
        stock: this.stock,
        coverUrl: item.coverThumbnail,
        publishedYear: item.year,
        openLibraryKey: item.openLibraryKey,
        description: item.description,
      }));

      this.store.loadBooks(); 
      this.close.emit(); 
    } catch (error: any) {
      console.error('Failed to save book:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error?.error?.detail || 'Failed to add book to the catalog.',
        life: 15000 // Toast disappears after 5 seconds
      });
    } finally {
      this.isSaving.set(false);
    }
  }
}
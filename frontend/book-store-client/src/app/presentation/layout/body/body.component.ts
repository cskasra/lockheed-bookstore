import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { BookStoreState } from '../../../core/application/state/book-store.service';
import { AddBookFlowComponent } from '../../features/add-book-flow/add-book-flow.component';

@Component({
  selector: 'app-body',
  standalone: true,
  imports: [CommonModule, ButtonModule, PaginatorModule, AddBookFlowComponent],
  template: `
    <!-- Removed overflow-y-auto from main to prevent full-page scrolling -->
    <main class="flex-1 px-4 py-6 flex flex-col h-full overflow-hidden">
      
      <!-- HEADER (Stays fixed) -->
      <div class="flex justify-between items-center mb-6 shrink-0">
        <h2 class="text-xl font-semibold text-gray-800">Catalog</h2>
        <p-button label="Add Book" icon="pi pi-plus" (onClick)="showAddFlow = true"></p-button>
      </div>

      <!-- MAIN CONTAINER: flex-1 ensures it fills the rest of the screen -->
      <div class="bg-white border border-solid border-gray-200 rounded-lg shadow-sm w-full flex flex-col flex-1 overflow-hidden">
        
        <!-- TABLE WRAPPER: Scrollable area for the rows -->
        <div class="overflow-auto flex-1">
          <table class="w-full text-left border-collapse min-w-200 text-[0.8em]">
            <!-- ADDED: sticky top-0 to keep the table header visible while scrolling rows -->
            <thead class="sticky top-0 z-10 bg-gray-50 shadow-[0_1px_0_0_#e5e7eb]">
              <tr>
                <th class="border-b border-solid border-gray-200 p-1.5 font-semibold text-gray-900 w-16 text-center">Cover</th>
                <th class="border-b border-solid border-gray-200 p-1.5 font-semibold text-gray-900">Title</th>
                <th class="border-b border-solid border-gray-200 p-1.5 font-semibold text-gray-900">Author</th>
                <th class="border-b border-solid border-gray-200 p-1.5 font-semibold text-gray-900">Year</th>
                <th class="border-b border-solid border-gray-200 p-1.5 font-semibold text-gray-900">ISBN</th>
                <th class="border-b border-solid border-gray-200 p-1.5 font-semibold text-gray-900">Genre</th>
                <th class="border-b border-solid border-gray-200 p-1.5 font-semibold text-gray-900 text-right">Price</th>
                <th class="border-b border-solid border-gray-200 p-1.5 font-semibold text-gray-900 text-right">Stock</th>
                <th class="border-b border-solid border-gray-200 p-1.5 font-semibold text-gray-900 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (book of store.books(); track book.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  
                  <td class="border-b border-solid border-gray-200 p-1.5 text-center">
                    <img 
                      [src]="book.coverUrl" 
                      [alt]="book.title" 
                      class="object-cover rounded shadow-sm border border-gray-200 bg-gray-100 mx-auto"
                      onerror="this.src='https://via.placeholder.com/48x64?text=No+Cover'"
                      style="width:45px;height:60px;"
                    />
                  </td>
                  
                  <td class="border-b border-solid border-gray-200 p-1.5 font-medium text-gray-900">{{ book.title }}</td>
                  <td class="border-b border-solid border-gray-200 p-1.5 text-gray-600">{{ book.author }}</td>
                  <td class="border-b border-solid border-gray-200 p-1.5 text-right">{{ book.publishedYear }}</td>
                  <td class="border-b border-solid border-gray-200 p-1.5 text-gray-600">{{ book.isbn }}</td>
                  <td class="border-b border-solid border-gray-200 p-1.5">
                    <span class="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-[0.9em] font-medium block w-max">
                      {{ book.genre || 'Unknown' }}
                    </span>
                  </td>
                  
                  <td class="border-b border-solid border-gray-200 p-1.5 text-right">{{ book.price | currency }}</td>
                  
                  <td class="border-b border-solid border-gray-200 p-1.5 text-right">
                    <span class="font-medium" [ngClass]="{'text-red-600': (book?.stock ?? 0) < 5, 'text-green-600': (book?.stock ?? 0) >= 5}">
                      {{ book.stock }}
                    </span>
                  </td>
                  
                  <td class="border-b border-solid border-gray-200 p-1.5">
                     <div class="flex gap-1 justify-center">
                       <p-button 
                         icon="pi pi-pencil" 
                         label="Update"
                         severity="secondary" 
                         [text]="true" 
                         size="small"
                         (onClick)="editBook(book)">
                       </p-button>
                       <p-button 
                         icon="pi pi-trash" 
                         label="Delete"
                         severity="danger" 
                         [text]="true" 
                         size="small"
                         (onClick)="deleteBook(book)">
                       </p-button>
                     </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="border-b border-solid border-gray-200 p-12 text-center text-gray-500">
                    <i class="pi pi-inbox text-3xl mb-3 block text-gray-400"></i>
                    No books found in the catalog.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        
        <!-- FOOTER (Stays fixed at the bottom of the container) -->
        <div class="bg-white border-t border-solid border-gray-200 shrink-0">
          <p-paginator 
            (onPageChange)="onPageChange($event)" 
            [first]="first" 
            [rows]="rows" 
            [totalRecords]="store.totalRecords()" 
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} books"
            [rowsPerPageOptions]="[10, 20, 50]">
          </p-paginator>
        </div>
      </div>

      <app-add-book-flow *ngIf="showAddFlow" (close)="showAddFlow = false"></app-add-book-flow>
    </main>
  `
})
export class BodyComponent implements OnInit {
  store = inject(BookStoreState);
  showAddFlow = false;

  first = 0;
  rows = 10;

  ngOnInit() {
    this.store.loadBooks();
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    
    const page = Math.floor(event.first / event.rows) + 1;
    
    this.store.currentPage.set(page);
    this.store.loadBooks();
  }

  editBook(book: any) {
    console.log('Update book clicked:', book);
  }

  deleteBook(book: any) {
    console.log('Delete book clicked:', book);
  }
}
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';

import { ConfirmationService, MessageService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';

import { BookStoreState } from '../../../core/application/state/book-store.service';
import { BOOK_REPOSITORY } from '../../../infrastructure/di/tokens';
import { AddBookFlowComponent } from '../../features/add-book-flow/add-book-flow.component';

@Component({
  selector: 'app-body',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    PaginatorModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    InputNumberModule,
    AddBookFlowComponent
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast></p-toast>
    
    <main class="flex-1 px-4 py-6 flex flex-col h-full overflow-hidden">
      
      <!-- HEADER -->
      <div class="flex justify-between items-center mb-6 shrink-0">
        <h2 class="text-xl font-semibold text-gray-800">Catalog</h2>
        <p-button label="Add Book" icon="pi pi-plus" (onClick)="showAddFlow = true"></p-button>
      </div>

      <!-- MAIN CONTAINER -->
      <div class="bg-white border border-solid border-gray-200 rounded-lg shadow-sm w-full flex flex-col flex-1 overflow-hidden">
        
        <div class="overflow-auto flex-1">
          <table class="w-full text-left border-collapse min-w-200 text-[0.8em]">
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
                         label=""
                         severity="secondary" 
                         [text]="true" 
                         size="small"
                         (onClick)="editBook(book)">
                       </p-button>
                       <p-button 
                         icon="pi pi-trash" 
                         label=""
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

      <p-confirmdialog 
        styleClass="w-[400px] [&_.p-dialog-header]:!px-[0px] [&_.p-dialog-footer]:!px-[12px] [&_.p-dialog-content]:!pl-[12px] [&_.p-dialog-content]:!pr-[12px] [&_.p-dialog-title]:mx-auto [&_.p-dialog-title]:p-[0px]"
      >
        <ng-template pTemplate="message" let-message>
          <div class="flex items-center gap-3 py-2">
            <i class="pi pi-trash text-red-600 text-2xl"></i>
            <p class="text-gray-800 m-0 leading-tight">{{ message.message }}</p>
          </div>
        </ng-template>
      </p-confirmdialog>

      <!-- UPDATE DIALOG -->
      <p-dialog 
        header="Update Inventory" 
        [visible]="editingBook() !== null" 
        (onHide)="editingBook.set(null)" 
        [modal]="true" 
        styleClass="w-[400px] [&_.p-dialog-title]:mx-auto [&_.p-dialog-title]:pl-8"
        headerStyleClass="!p-[12px] border-b border-gray-200"
        contentStyleClass="!p-[12px]"
      >
        <div class="flex flex-col gap-[12px] mt-2" *ngIf="editingBook()">
          <p class="text-[0.9em] text-gray-600 mb-2">
            Updating values for <strong>{{ editingBook()?.title }}</strong>
          </p>

          <div class="flex flex-col gap-1 w-full [&_p-inputnumber]:w-full [&_.p-inputnumber]:!w-full">
            <label class="text-[0.8em] font-medium text-gray-700">Price ($)</label>
            <p-inputnumber 
              [style]="{ width: '100%' }"
              styleClass="!w-full"
              inputStyleClass="border border-solid border-gray-300 rounded !w-full px-3 py-2" 
              class="text-[0.8em] block w-full" 
              [(ngModel)]="editPrice" 
              mode="currency" 
              currency="USD" 
              locale="en-US">
            </p-inputnumber>            
          </div>
          
          <div class="flex flex-col gap-1 w-full [&_p-inputnumber]:w-full [&_.p-inputnumber]:!w-full">
            <label class="text-[0.8em] font-medium text-gray-700"># in Stock</label>
            <p-inputnumber 
              [style]="{ width: '100%' }"
              styleClass="!w-full"
              inputStyleClass="border border-solid border-gray-300 rounded !w-full px-3 py-2" 
              class="text-[0.8em] block w-full" 
              [(ngModel)]="editStock">
            </p-inputnumber>            
          </div>

          <div class="flex justify-end gap-[12px] mt-4 pt-4 border-t border-solid border-gray-200">
            <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="editingBook.set(null)" [disabled]="isSaving()"></p-button>
            <p-button label="Save Changes" icon="pi pi-check" (onClick)="saveUpdate()" [loading]="isSaving()"></p-button>
          </div>
        </div>
      </p-dialog>

      <app-add-book-flow *ngIf="showAddFlow" (close)="showAddFlow = false"></app-add-book-flow>
    </main>
  `
})
export class BodyComponent implements OnInit {
  store = inject(BookStoreState);

  private bookRepo = inject(BOOK_REPOSITORY);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  showAddFlow = false;
  first = 0;
  rows = 10;

  editingBook = signal<any>(null);
  editPrice = 0;
  editStock = 0;
  isSaving = signal(false);

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
    this.editingBook.set(book);
    this.editPrice = book.price;
    this.editStock = book.stock;
  }

  async saveUpdate() {
    const book = this.editingBook();
    if (!book) return;

    this.isSaving.set(true);
    try {
      await firstValueFrom(this.bookRepo.updateBook(book.id, {
        id: book.id,
        price: this.editPrice,
        stock: this.editStock
      }));

      this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Inventory updated successfully.' });
      this.store.loadBooks();
      this.editingBook.set(null);
    } catch (e: any) {
      console.error('Update failed:', e);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: e?.message || 'Failed to update book.' });
    } finally {
      this.isSaving.set(false);
    }
  }

  deleteBook(book: any) {
    this.confirmationService.confirm({
      message: `Are you sure you want to permanently delete "${book.title}" from the catalog?`,
      header: 'Confirm Deletion',

      // Much cleaner! Just the PrimeNG color classes and 12px padding
      acceptButtonStyleClass: 'p-button-success !px-[12px]',
      rejectButtonStyleClass: 'p-button-secondary !px-[12px] !mr-[12px]',

      accept: async () => {
        try {
          await firstValueFrom(this.bookRepo.deleteBook(book.id));
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Book removed from catalog.' });
          this.store.loadBooks();
        } catch (e: any) {
          console.error('Delete failed:', e);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: e?.message || 'Failed to delete book.' });
        }
      }
    });
  }
}
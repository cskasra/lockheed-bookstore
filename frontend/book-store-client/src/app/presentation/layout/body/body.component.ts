import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG UI Components
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select'; // <-- CHANGED: Dropdown is now Select in v18
import { ConfirmationService, MessageService } from 'primeng/api';
import { Genre } from '../../../core/domain/models/book.model';

// AG Grid Components
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  ICellRendererParams,
  ModuleRegistry,
  AllCommunityModule,
  SizeColumnsToFitGridStrategy,
  SortChangedEvent,
  ValidationModule
} from 'ag-grid-community';
import { ICellRendererAngularComp } from 'ag-grid-angular';

import { firstValueFrom } from 'rxjs';

import { BookStoreState } from '../../../core/application/state/book-store.service';
import { BOOK_REPOSITORY } from '../../../infrastructure/di/tokens';
import { AddBookFlowComponent } from '../../features/add-book-flow/add-book-flow.component';

// REQUIRED: Register AG Grid Community modules globally
ModuleRegistry.registerModules([AllCommunityModule, ValidationModule]);

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
    SelectModule, // <-- CHANGED: Registered SelectModule
    AgGridAngular,
    AddBookFlowComponent
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast></p-toast>
    
    <main class="flex-1 py-6 flex flex-col h-full overflow-hidden w-full">
      
      <!-- HEADER -->
      <div class="flex justify-between items-center mb-6 shrink-0 px-4">
        <h2 class="text-xl font-semibold text-gray-800">Catalog</h2>
        <p-button label="Add Book" icon="pi pi-plus" (onClick)="showAddFlow = true"></p-button>
      </div>

      <!-- MAIN CONTAINER -->
      <div class="bg-white border-y border-solid border-gray-200 shadow-sm w-full flex flex-col overflow-hidden">
        
        <div style="height: calc(100vh - 392px); width: 100%;">
          <ag-grid-angular
            style="width: 100%; height: 100%; display: block;"
            [rowData]="store.books()"
            [columnDefs]="colDefs"
            [defaultColDef]="defaultColDef"
            [autoSizeStrategy]="autoSizeStrategy"
            [rowHeight]="70"
            [context]="gridContext"
            [suppressCellFocus]="true"
            [animateRows]="true"
            (sortChanged)="onSortChanged($event)">
          </ag-grid-angular>
        </div>
        
        <!-- FOOTER PAGINATOR -->
        <div class="bg-white border-t border-solid border-gray-200 shrink-0 px-4">
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

      <!-- CONFIRM DIALOG -->
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

          <!-- CHANGED: Now uses p-select for PrimeNG 18 compatibility -->
          <div class="flex flex-col gap-1 w-full [&_p-select]:w-full [&_.p-select]:!w-full">
            <label class="text-[0.8em] font-medium text-gray-700">Genre</label>
            <p-select 
              [options]="genreOptions" 
              [(ngModel)]="editGenre" 
              placeholder="Select a Genre"
              styleClass="border border-solid border-gray-300 rounded !w-full text-[0.8em]"
              appendTo="body">
            </p-select>
          </div>

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
            <p-button label="Save Changes" severity="secondary" [text]="true" (onClick)="saveUpdate()" [loading]="isSaving()"></p-button>
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

  editGenre = '';
  editPrice = 0;
  editStock = 0;

  isSaving = signal(false);

  genreOptions: string[] = [
    'Fiction',
    'SciFi',
    'Fantasy',
    'Mystery',
    'Biography',
    'NonFiction',
    'Children',
    'History',
  ];

  gridContext = { componentParent: this };

  autoSizeStrategy: SizeColumnsToFitGridStrategy = {
    type: 'fitGridWidth'
  };

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    floatingFilter: true
  };

  colDefs: ColDef[] = [
    { field: 'coverUrl', headerName: 'Cover', cellRenderer: CoverRenderer, width: 90, sortable: false, filter: false },
    { field: 'title', headerName: 'Title', minWidth: 200 },
    { field: 'author', headerName: 'Author', minWidth: 150 },
    { field: 'publishedYear', headerName: 'Year', width: 100 },
    { field: 'isbn', headerName: 'ISBN', width: 140 },
    { field: 'genre', headerName: 'Genre', cellRenderer: GenreRenderer, width: 130 },
    {
      field: 'price',
      headerName: 'Price',
      width: 110,
      type: 'rightAligned',
      filter: 'agNumberColumnFilter',
      valueFormatter: params => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(params.value)
    },
    { field: 'stock', headerName: 'Stock', cellRenderer: StockRenderer, width: 100, type: 'rightAligned', filter: 'agNumberColumnFilter' },
    { headerName: 'Actions', cellRenderer: ActionRenderer, width: 120, sortable: false, filter: false }
  ];

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

  onSortChanged(event: SortChangedEvent) {
    const sortedColumn = event.api.getColumnState().find(col => col.sort !== null);

    if (sortedColumn) {
      const field = sortedColumn.colId;
      const direction = sortedColumn.sort;
      console.log(`Instructing backend to sort by ${field} (${direction})`);
    } else {
      console.log('Sorting cleared');
    }

    this.first = 0;
    this.store.currentPage.set(1);
    this.store.loadBooks();
  }

  editBook(book: any) {
    this.editingBook.set(book);

    this.editGenre = book.genre || '';
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
        genreId: this.genreOptions.indexOf(this.editGenre) + 1,
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
      acceptButtonProps: { styleClass: '!bg-green-600 !border-green-600 !text-white hover:!bg-green-700 !px-[12px]' },
      rejectButtonProps: { styleClass: '!bg-gray-200 !border-gray-200 !text-gray-800 hover:!bg-gray-300 !px-[12px] !mr-[12px]' },
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

// ---------------------------------------------------------
// AG GRID CUSTOM CELL RENDERERS
// ---------------------------------------------------------

@Component({
  standalone: true,
  template: `
    <div class="flex items-center h-full pt-1">
      <img [src]="params.value" class="object-cover rounded shadow-sm border border-gray-200 bg-gray-100"
           onerror="this.src='https://via.placeholder.com/48x64?text=No+Cover'"
           style="width:45px;height:60px;" />
    </div>
  `
})
export class CoverRenderer implements ICellRendererAngularComp {
  params!: ICellRendererParams;
  agInit(params: ICellRendererParams): void { this.params = params; }
  refresh(params: ICellRendererParams): boolean { this.params = params; return true; }
}

@Component({
  standalone: true,
  template: `
    <div class="flex items-center h-full">
      <span class="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-[0.9em] font-medium block w-max leading-none">
        {{ params.value || 'Unknown' }}
      </span>
    </div>
  `
})
export class GenreRenderer implements ICellRendererAngularComp {
  params!: ICellRendererParams;
  agInit(params: ICellRendererParams): void { this.params = params; }
  refresh(params: ICellRendererParams): boolean { this.params = params; return true; }
}

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-end h-full w-full">
      <span class="font-medium" [ngClass]="{'text-red-600': (params.value ?? 0) < 5, 'text-green-600': (params.value ?? 0) >= 5}">
        {{ params.value }}
      </span>
    </div>
  `
})
export class StockRenderer implements ICellRendererAngularComp {
  params!: ICellRendererParams;
  agInit(params: ICellRendererParams): void { this.params = params; }
  refresh(params: ICellRendererParams): boolean { this.params = params; return true; }
}

@Component({
  standalone: true,
  template: `
    <div class="flex gap-2 items-center justify-center h-full">
      
      <button 
        class="flex items-center justify-center w-8 h-8 rounded-md border border-solid border-gray-300 text-gray-600 bg-white hover:bg-gray-100 transition-colors cursor-pointer"
        (click)="onEdit()"
        title="Edit Book">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
        </svg>
      </button>
      
      <button 
        class="flex items-center justify-center w-8 h-8 rounded-md border border-solid border-red-200 text-red-600 bg-white hover:bg-red-50 transition-colors cursor-pointer"
        (click)="onDelete()"
        title="Delete Book">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>
      
    </div>
  `
})
export class ActionRenderer implements ICellRendererAngularComp {
  params!: ICellRendererParams;
  agInit(params: ICellRendererParams): void { this.params = params; }
  refresh(params: ICellRendererParams): boolean { this.params = params; return true; }

  onEdit() {
    this.params.context.componentParent.editBook(this.params.data);
  }

  onDelete() {
    this.params.context.componentParent.deleteBook(this.params.data);
  }
}
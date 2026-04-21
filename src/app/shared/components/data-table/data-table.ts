import {
  Component,
  computed,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  Signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { PrimeNgModules } from '../../modules/primeng.modules';
import { signal } from '@angular/core';
import { getCloudinaryUrl } from '../../utils/common-utils';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface ColumnDef<T = any> {
  field: string;
  header: string;
  sortable?: boolean;
  visible?: boolean;
  link?: string | ((row: T) => any);
  type?: 'text' | 'number' | 'date' | 'custom' | 'routerLink' | 'badge' | 'image';
  value?: (row: T) => any;
}

export interface TableAction<T = any> {
  label?: string;
  icon?: string;
  command: (row: T) => void;
  visible?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
  mode?: 'inline' | 'menu';
  size?: 'small' | 'large';
  class?: string;
  buttonType?: 'text' | 'outlined' | 'raised';
  severity?: 'primary' | 'success' | 'info' | 'warn' | 'danger';
}

export const editButton: TableAction = {
  label: 'Edit',
  icon: 'pi pi-pencil',
  severity: 'info',
  buttonType: 'text',
  size: 'small',
  command: (row: any) => {
    console.log(row);
  },
};

export const deleteButton: TableAction = {
  label: 'Delete',
  icon: 'pi pi-trash',
  severity: 'danger',
  buttonType: 'text',
  size: 'small',
  command: (row: any) => {
    console.log(row);
  },
};

export const viewButton: TableAction = {
  label: 'View',
  icon: 'pi pi-eye',
  severity: 'primary',
  buttonType: 'text',
  size: 'small',
  command: (row) => {
    console.log(row);
  },
};

export interface FilterDef {
  field: string;
  label: string;
  type: 'buttons' | 'search';
  options?: { id: string; label: string }[];
  defaultValue?: any;
}

@Component({
  selector: 'app-data-table',
  imports: [PrimeNgModules],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable<T> implements OnInit {
  private destroyRef = inject(DestroyRef);
  private searchSubject = new Subject<string>();

  @Input() data: Signal<T[]> = signal([]);
  @Input() loading: Signal<boolean> = signal(false);
  activeMenuRow = signal<T | null>(null);
  @Input() columns: WritableSignal<ColumnDef<T>[]> = signal([]);
  private _totalRecords = signal(0);
  @Input() set totalRecords(v: number) {
    this._totalRecords.set(v || 0);
  }

  protected _currentPage = signal(1);
  @Input() set currentPage(v: number) {
    this._currentPage.set(v || 1);
  }

  private _pageSize = signal(7);
  @Input() set pageSize(v: number) {
    this._pageSize.set(v || 7);
  }

  private _serverFilter = signal(false);
  @Input() set serverFilter(v: boolean) {
    this._serverFilter.set(v);
  }

  @Input() filterConfig: FilterDef[] = [];
  @Output() viewDetail = new EventEmitter<T>();
  @Output() filterChange = new EventEmitter<any>();
  @Input() rowActions!: (row: T) => TableAction<T>[];
  @Input() customTemplates: Signal<Record<string, TemplateRef<any>>> = signal({});

  @Output() pageChange = new EventEmitter<number>();

  getCloudinaryUrl = getCloudinaryUrl;
  activeFilters = signal<Record<string, any>>({});
  private actionCache = new WeakMap<any, TableAction[]>();

  ngOnInit() {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        this.updateFilter('search', val);
      });
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  displayData = computed(() => {
    let results = this.data();
    if (this._serverFilter()) return results; // lets handle from parent component

    const currentFilters = this.activeFilters();
    Object.keys(currentFilters).forEach((key) => {
      const val = currentFilters[key];
      if (!val || val === 'all') return;

      if (key === 'search') {
        results = results.filter((item) =>
          this.columns().some((col) =>
            String(this.getCellValue(item, col))?.toLowerCase().includes(val.toLowerCase()),
          ),
        );
      } else {
        results = results.filter((item: any) => item[key]?.toLowerCase() === val.toLowerCase());
      }
    });
    return results;
  });

  updateFilter(field: string, value: any) {
    const newState = { ...this.activeFilters(), [field]: value };
    this.activeFilters.set(newState);
    if (this._serverFilter()) {
      this.filterChange.emit(newState);
    }
  }

  getCellValue(row: any, col: ColumnDef): any {
    if (col.value) return col.value(row);
    return this.getNestedValue(row, col.field);
  }

  getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return null;
    return path.split('.').reduce((acc, part) => (acc ? acc[part] : null), obj);
  }

  getRowActions(row: any): any[] {
    if (!this.rowActions) return [];

    const actions = this.rowActions(row);
    return actions.map((action) => ({
      ...action,
      visible: action.visible ? action.visible(row) : action.visible !== false,
      disabled: action.disabled ? action.disabled(row) : action.disabled === true,
      command: () => action.command(row),
      styleClass: action.severity ? `menu-item-${action.severity}` : '',
    }));
  }

  hasNext = computed(() => {
    return this._currentPage() * this._pageSize() < this._totalRecords();
  });

  next() {
    if (this.hasNext()) {
      this.pageChange.emit(this._currentPage() + 1);
    }
  }

  hasPrevious = computed(() => {
    return this._currentPage() > 1;
  });

  previous() {
    if (this.hasPrevious()) {
      this.pageChange.emit(this._currentPage() - 1);
    }
  }
}

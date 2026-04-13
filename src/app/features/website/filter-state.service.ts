import { Injectable, signal } from '@angular/core';

/**
 * Service to manage and persist property filter state and results.
 * This prevents filter resets and redundant API calls during navigation.
 */
@Injectable({
  providedIn: 'root'
})
export class FilterStateService {
  // Using signals for modern, reactive state management (Angular v20 standard)
  private readonly _filters = signal<Record<string, any>>({});
  private readonly _results = signal<any[]>([]);
  private readonly _hasMore = signal<boolean>(false);
  
  // Expose as readonly to ensure state is only modified via service methods
  public readonly filters = this._filters.asReadonly();
  public readonly results = this._results.asReadonly();
  public readonly hasMore = this._hasMore.asReadonly();

  public saveState(filters: any, results: any[], hasMore: boolean): void {
    this._filters.set({ ...filters });
    this._results.set([...results]);
    this._hasMore.set(hasMore);
  }

  public clearState(): void {
    this._filters.set({});
    this._results.set([]);
    this._hasMore.set(false);
  }
}
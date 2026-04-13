import { Component, inject, effect, OnInit, OnDestroy, computed, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WebSiteService } from '../website.service';
import { getCloudinaryUrl } from '../../../shared/utils/common-utils';
import {Property} from '../../../core/interfaces/property';
import { useInfiniteScroll } from '../../../shared/infinitScroll';
import {toObservable, takeUntilDestroyed} from '@angular/core/rxjs-interop'
import { debounce, debounceTime, distinctUntilChanged, of, skip, switchMap, tap } from 'rxjs';
import { RouterLink } from '@angular/router';
import { FilterStateService } from '../filter-state.service';

@Component({
  selector: 'app-landing',
  imports: [FormsModule,RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements OnInit, OnDestroy {

  websiteService = inject(WebSiteService)
  private readonly filterState = inject(FilterStateService);
  properties = this.websiteService.propertiesData

  // Filter signals for reactive filtering
  selectedPropertyType:WritableSignal<string> = signal<string>(this.filterState.filters()['property_type'] || '');
  selectedPriceRange = signal<string>(this.filterState.filters()['price_range'] || '');
  selectedBedrooms = signal<string>(this.filterState.filters()['bedrooms'] || '');
  selectedBathrooms = signal<string>(this.filterState.filters()['bathrooms'] || '');
  selectedFurnishing = signal<string>(this.filterState.filters()['furnishing'] || '');
  selectedLocation = signal<string>(this.filterState.filters()['location_text'] || '');
  minPrice = signal<number>(this.filterState.filters()['min_price'] ?? 0);
  maxPrice = signal<number>(this.filterState.filters()['max_price'] ?? 10000000);
  purchaseType = signal<string>(this.filterState.filters()['sale_type'] || '');

  // Computed for unique bedroom options
  uniqueBedrooms = computed(() => {
    const properties = this.properties();
    const filtered = this.getFilteredPropertiesByType();
    const bedrooms = new Set<number>();
    filtered.forEach(prop => {
      // Check if property has beds from the API response
      const propAny = prop as any;
      if (propAny.bedrooms) {
        bedrooms.add(propAny.bedrooms);
      }
    });
    return Array.from(bedrooms).sort((a, b) => a - b);
  });

  // Computed for unique bathroom options
  uniqueBathrooms = computed(() => {
    const filtered = this.getFilteredPropertiesByType();
    const bathrooms = new Set<number>();
    filtered.forEach(prop => {
      const propAny = prop as any;
      if (propAny.bathrooms) {
        bathrooms.add(propAny.bathrooms);
      }
    });
    return Array.from(bathrooms).sort((a, b) => a - b);
  });

  // Computed for unique locations
  uniqueLocations = computed(() => {
    const properties = this.properties();
    const locations = new Set<string>();
    properties.forEach(prop => {
      if (prop.location_text) {
        locations.add(prop.location_text);
      }
    });
    return Array.from(locations).sort();
  });

  params: any = {
    page: 1,
    page_size: 7,
  }

  // private filterTimeout: any;

  // constructor() {}
   

    // Log when properties data changes
   

   onPropertyTypeChange (newType:string){
      this.selectedPropertyType.set(newType)
      this.selectedBathrooms.set('')
      this.selectedBedrooms.set('')
      this.selectedLocation.set('')
      this.selectedFurnishing.set('')
      this.selectedPriceRange.set('')
      this.minPrice.set(0)
      this.maxPrice.set(10000000)
      this.purchaseType.set('')

    }

  // Helper method to get properties filtered by current type
  private getFilteredPropertiesByType(): Property[] {
    if (!this.selectedPropertyType()) {
      return this.properties();
    }
    return this.properties().filter(p => p.property_type === this.selectedPropertyType());
  }

  // setFilters(filter: any) {
  //   this.params = {
  //     ...this.params,
  //     ...filter
  //   }
  //   this.params.page = 1;
  //   this.loadProperties(false)
  // }

  protected getCurrentFilterValue() {
    return {
      property_type: this.selectedPropertyType(),
      price_range: this.selectedPriceRange(),
      bedrooms: this.selectedBedrooms(),
      bathrooms: this.selectedBathrooms(),
      location_text: this.selectedLocation(),
      furnishing: this.selectedFurnishing(),
      min_price: this.minPrice(),
      max_price: this.maxPrice(),
      sale_type: this.purchaseType()
    };
  }

  clearAllFilters() {
    this.selectedPropertyType.set('');
    this.selectedPriceRange.set('');
    this.selectedBedrooms.set('');
    this.selectedBathrooms.set('');
    this.selectedLocation.set('');
    this.selectedFurnishing.set('');
    this.purchaseType.set('');
    this.minPrice.set(0);
    this.maxPrice.set(10000000);
    this.params = { page: 1, page_size: 7 };
    this.filterState.clearState();
    this.loadProperties(false);
  }

  getCloudinaryUrl = getCloudinaryUrl;

  hasMore: WritableSignal<any> = signal(false)

  scrollHandle = useInfiniteScroll({
    isFetching: this.websiteService.loading,
    hasMore: this.hasMore,
    onLoadMore: () => { this.onLoadMore() },
  })

   filterStream$ = toObservable(
    computed(() => this.getCurrentFilterValue())
  );
ngOnInit(): void {

  const savedResults = this.filterState.results();
  const savedFilters = this.filterState.filters();

  //  Step 1: Restore state FIRST
  if (savedResults.length > 0) {
    const activeParams = Object.fromEntries(
      Object.entries(savedFilters).filter(([_, value]) => value)
    );

    this.params = { ...this.params, ...activeParams };
    this.hasMore.set(this.filterState.hasMore());
    this.websiteService.data.set(savedResults);
  }

  // Step 2: THEN setup stream


  this.filterStream$.pipe(
    skip(savedResults.length > 0 ? 1 : 0), // skip the first emission if we have saved results to avoid unnecessary API call ✅ "Skip the first N emissions only once" Because skip(1) only applies once when the stream starts.It does NOT re-check savedResults.length on every emission.
    debounceTime(400),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
    tap(() => this.websiteService.clearCache()),
    switchMap((filters) => {
      const activeParams = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value)
      );

      this.params = {
        ...activeParams,
        page: 1,
        page_size: 7
      };

      return this.websiteService.fetchProperties(this.params, false, true) ?? of (null)
    }),
    // takeUntilDestroyed()
  ).subscribe((res: any) => {
    this.hasMore.set(!!res?.next);
    this.filterState.saveState(
      this.getCurrentFilterValue(),
      this.properties(),
      this.hasMore()
    );
  });

  // Step 3: Only trigger initial API IF NO CACHE
  if (savedResults.length === 0) {
    // manually trigger by changing signal (clean trick)
    this.selectedPropertyType.set(this.selectedPropertyType());
  }

  window.addEventListener('scroll', this.scrollHandle);
}

  onLoadMore() {
    this.params.page += 1;
    this.loadProperties(true) 
  }


  loadProperties(append = false, forceRefresh = false): void {

   const call$ =  this.websiteService.fetchProperties(this.params, append, forceRefresh)
   if(call$){
    call$.subscribe((res:any)=>{
      this.hasMore.set(!!res?.next)
      this.filterState.saveState(this.getCurrentFilterValue(), this.properties(), this.hasMore());
    })
   }
  }


  ngOnDestroy() {
    // if (this.filterTimeout) {
    //   clearTimeout(this.filterTimeout);
    // }
    window.removeEventListener('scroll', this.scrollHandle);
  }

}

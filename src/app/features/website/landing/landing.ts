import { Component, inject, effect, OnInit, OnDestroy, computed, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WebSiteService } from '../website.service';
import { getCloudinaryUrl } from '../../../shared/utils/common-utils';
import {Property} from '../../../core/interfaces/property';
import { useInfiniteScroll } from '../../../shared/infinitScroll';
import {toObservable, takeUntilDestroyed} from '@angular/core/rxjs-interop'
import { debounce, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-landing',
  imports: [FormsModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements OnInit, OnDestroy {

  websiteService = inject(WebSiteService)
  properties = this.websiteService.propertiesData

  // Filter signals for reactive filtering
  selectedPropertyType:WritableSignal<string> = signal<string>('');
  selectedPriceRange = signal<string>('');
  selectedBedrooms = signal<string>('');
  selectedBathrooms = signal<string>('');
  selectedFurnishing = signal<string>('');
  selectedLocation = signal<string>('');
  minPrice = signal<number>(0);
  maxPrice = signal<number>(10000000);
  purchaseType = signal<string>('')

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

  constructor() {
    // Watch filter changes and reload properties with debounce
   
const filterStream$ = toObservable(computed(() => ({
      property_type: this.selectedPropertyType(),
      price_range: this.selectedPriceRange(),
      bedrooms: this.selectedBedrooms(),
      bathrooms: this.selectedBathrooms(),
      location_text: this.selectedLocation(),
      furnishing: this.selectedFurnishing(),
      min_price: this.minPrice(),
      max_price: this.maxPrice(),
      sale_type: this.purchaseType()
    })));

    filterStream$.pipe(
      debounceTime(400),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      tap(()=> this.websiteService.clearCache()), // Clear cache on filter change to ensure fresh data
      switchMap((filters)=>{
        // Prepare params for this specific call
        const activeParams = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value)); // Only include active filters
        this.params = {
          ...activeParams,
          page:1,
          page_size:7
        }
        return this.websiteService.fetchProperties(this.params, false, true) || [];
      }),
      takeUntilDestroyed(),

    ).subscribe((res:any)=>{
      this.hasMore.set(!!res?.next)
    
    })

   

    // Log when properties data changes
    effect(() => {
      const data = this.properties();
      if (data.length > 0) {
        console.log('Properties fetched:', data);
      }
    });
  }

   onPropertyTypeChange (newType:string){
      this.selectedPropertyType.set(newType)
      this.selectedBathrooms.set('')
      this.selectedBedrooms.set('')
      this.selectedLocation.set('')
      this.selectedFurnishing.set('')
      this.selectedPriceRange.set('')

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

  clearAllFilters() {
    this.selectedPropertyType.set('');
    this.selectedPriceRange.set('');
    this.selectedBedrooms.set('');
    this.selectedBathrooms.set('');
    this.selectedLocation.set('');
    this.selectedFurnishing.set('');
    this.params = {
      page: 1,
      page_size: 7,
    };
    this.loadProperties(false);
  }

  getCloudinaryUrl = getCloudinaryUrl;

  hasMore: WritableSignal<any> = signal(false)

  scrollHandle = useInfiniteScroll({
    isFetching: this.websiteService.loading,
    hasMore: this.hasMore,
    onLoadMore: () => { this.onLoadMore() },
  })

  ngOnInit(): void {
    // Initial load is handled by the effect in constructor
    this.loadProperties();
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

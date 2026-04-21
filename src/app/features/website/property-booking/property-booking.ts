import { Component, inject } from '@angular/core';
import { WebSiteService } from '../website.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-property-booking',
  imports: [],
  templateUrl: './property-booking.html',
  styleUrl: './property-booking.scss',
})
export class PropertyBooking {
  websiteService = inject(WebSiteService);
  route = inject(ActivatedRoute);

  selectedProperty = this.websiteService.selectedProperty;
  purchaseType = this.route.snapshot.paramMap.get('purchase_type');
  id = this.route.snapshot.paramMap.get('id');

  ngOnInit() {
    if (this.id) {
      this.websiteService.fetchPropertyById(this.id)?.subscribe();
    }
  }

  getFormattedPrice(): string {
    const property = this.selectedProperty();
    if (!property) return '0';

    const rawPrice = this.purchaseType === 'Buy' 
      ? property.sale_price 
      : property.rent_price;

    if (!rawPrice) return '0';
    
    return rawPrice.toString().split(/[. ]/)[0];
  }
}

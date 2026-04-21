import { Component, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Shared } from '../../../shared/shared.module';
import { ApiService } from '../../../shared/api.service';
import { URLConfig } from '../../../shared/utils/url-config';
import { getCloudinaryUrl } from '../../../shared/utils/common-utils';
import { firstValueFrom } from 'rxjs';
import { PropertyDetails } from '../../../core/interfaces/property';

@Component({
  selector: 'app-property-detail',
  imports: [Shared, RouterLink],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.scss',
})
export class PropertyDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  property: WritableSignal<PropertyDetails | null> = signal<any>(null);
  loading = signal(true);
  getCloudinaryUrl = getCloudinaryUrl;

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadProperty(id);
    }
  }

  async loadProperty(id: string) {
    try {
      this.loading.set(true);
      const res: any = await firstValueFrom(
        this.apiService.get(URLConfig.getSellerSpecificProperty(id)),
      );
      if (res) {
        this.property.set(res.data);
        console.log(res.data);
      }
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      this.loading.set(false);
    }
  }

  getSpecificDetails() {
    const p = this.property();
    if (!p) return null;
    return p.house || p.apartment || p.commercial || p.plots_and_land;
  }

  getFeatures() {
    return this.getSpecificDetails()?.features || [];
  }

  getDescription() {
    return this.getSpecificDetails()?.description || 'No description available.';
  }

  getArea() {
    const details: any = this.getSpecificDetails();
    if (!details) return 'N/A';
    return details.builtup_area || details.area || 'N/A';
  }

  getFormattedPrice() {
    const p = this.property();
    if (!p) return '';
    if (p.sale_type === 'both') {
      return `USD ${p.sale_price?.split('.')[0]} and ${p.rent_price?.split('.')[0]}/mo`;
    }
    return p.sale_type === 'sale'
      ? `USD ${p.sale_price?.split('.')[0]}`
      : `USD ${p.rent_price?.split('.')[0]}/mo`;
  }
}

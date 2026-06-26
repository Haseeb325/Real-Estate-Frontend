import { Component, computed, inject, Signal, signal, effect } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WebSiteService } from '../website.service';
import { getCloudinaryUrl } from '../../../shared/utils/common-utils';
import { Shared } from '../../../shared/shared.module';
import { CommercialDetail } from '../components/commercial-detail/commercial-detail';
import { PlotAndLandDetail } from '../components/plot-and-land-detail/plot-and-land-detail';
import { ApartmentDetail } from '../components/apartment-detail/apartment-detail';
import { HouseDetail } from '../components/house-detail/house-detail';
import { AuthStore } from '../../../shared/authStore';

@Component({
  selector: 'app-property-detail',
  imports: [Shared, CommercialDetail, PlotAndLandDetail, ApartmentDetail, HouseDetail],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.scss',
})
export class PropertyDetail {
  location = inject(Location);
  route = inject(ActivatedRoute);
  websiteService = inject(WebSiteService);
  authStore = inject(AuthStore);
  property = this.websiteService.selectedProperty;
  // propertySubDetail = this.websiteService.selectedSubDetail
  getCloudinaryUrl = getCloudinaryUrl;
  purchaseType = 'Buy';

  // State for image gallery
  activeImage = signal<string | null>(null);
  carouselImages = signal<string[]>([]);

  // State for auth required modal
  showAuthDialog = signal(false);

  constructor() {
    effect(() => {
      const prop = this.property();
      if (prop) {
        this.activeImage.set(prop.hero_image);
        const otherImgs = prop.images?.map((img: any) => img.image) || [];
        this.carouselImages.set(otherImgs);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log(id);
    // console.log(this.property()?.images)
    this.websiteService.fetchPropertyById(id)?.subscribe((res: any) => {
      // console.log(res)
    });
  }

  splitLastZero(str: any) {
    return str.split('.')[0];
  }

  router = inject(Router);

  swapImage(index: number) {
    const currentActive = this.activeImage();
    const currentCarousel = [...this.carouselImages()];
    const clickedImage = currentCarousel[index];

    if (currentActive && clickedImage) {
      currentCarousel[index] = currentActive;
      this.activeImage.set(clickedImage);
      this.carouselImages.set(currentCarousel);
    }
  }

  proceedToBooking() {
    if (!this.authStore.isAuthenticated()) {
      this.showAuthDialog.set(true);
      return;
    }

    this.router.navigate([
      '/property-booking',
      this.property()?.property_type,
      this.purchaseType,
      this.property()?.id,
    ]);
  }

  onViewMap() {
    const property = this.property();
    if (!property) return;

    // Use location_text for a natural search or coordinates if available
    const query = property.location_text || property.location || property.title;
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(mapUrl, '_blank');
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { Shared } from '../../../shared/shared.module';
import { HouseDetailForm } from './house-detail-form/house-detail-form';
import { CommercialDetailForm } from './commercial-detail-form/commercial-detail-form';
import { PlotAndLandDetailForm } from './plot-and-land-detail-form/plot-and-land-detail-form';
import { ApartmentDetailForm } from './apartment-detail-form/apartment-detail-form';
import { PropertyForm } from '../../../shared/forms.config';
import {
  MapLocationPickerComponent,
  LocationSelectedEvent,
} from '../../../shared/components/map-location-picker/map-location-picker';
import { FormGroup } from '@angular/forms';
import { PropertyService } from './property.service';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { getCloudinaryUrl } from '../../../shared/utils/common-utils';

@Component({
  selector: 'app-create-property',
  imports: [
    Shared,
    HouseDetailForm,
    CommercialDetailForm,
    PlotAndLandDetailForm,
    ApartmentDetailForm,
    MapLocationPickerComponent,
  ],
  templateUrl: './create-property.html',
  styleUrl: './create-property.scss',
})
export class CreateProperty {
  propertyService = inject(PropertyService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  propertyForm = PropertyForm;
  property_type: string = 'house';
  sale_type: string = 'both';

  isEditMode = false;
  propertyId: string | null = null;
  types = [
    { name: 'House', value: 'house', isActive: true },
    { name: 'Apartment', value: 'apartment', isActive: false },
    { name: 'Plots & Land', value: 'plots_and_land', isActive: false },
    { name: 'Commercials', value: 'commercial', isActive: false },
  ];

  sale_modes = [
    { mode: 'Sell', value: 'sale', isActive: false },
    { mode: 'Rent', value: 'rent', isActive: false },
    { mode: 'Both', value: 'both', isActive: true },
  ];

  constructor() {
    // Initial default values
    this.propertyForm.get('property_type')?.setValue(this.property_type);
    this.propertyForm.get('sale_type')?.setValue(this.sale_type);
  }

  async ngOnInit() {
    this.propertyId = this.route.snapshot.paramMap.get('id');
    if (this.propertyId) {
      this.isEditMode = true;
      await this.loadPropertyData(this.propertyId);
    } else {
      this.propertyForm.reset({
        property_type: 'house',
        sale_type: 'both',
      });
      this.setType({ value: 'house' });
      this.setMode({ value: 'both' });
    }
  }

  async loadPropertyData(id: string) {
    try {
      await this.propertyService.getPropertyById(id);
      const data = this.propertyService.selectedItem();
      if (data) {
        this.patchForm(data);
      }
    } catch (error) {
      console.error('Error loading property:', error);
    }
  }

  patchForm(data: any) {
    // 1. Basic Fields
    this.propertyForm.patchValue({
      title: data.title,
      location: data.location,
      location_text: data.location_text,
      property_type: data.property_type,
      sale_type: data.sale_type,
      sale_price: data.sale_price,
      rent_price: data.rent_price,
      security_deposit: data.security_deposit,
    });

    // 2. Set Active Type and Mode
    this.setType({ value: data.property_type });
    this.setMode({ value: data.sale_type });

    // 3. Patch Nested Details
    const typeMapping: any = {
      house: { formGroup: 'houseDetails', apiKey: 'house' },
      apartment: { formGroup: 'apartmentDetails', apiKey: 'apartment' },
      plots_and_land: { formGroup: 'plotsAndLandDetails', apiKey: 'plots_and_land' },
      commercial: { formGroup: 'commercialDetails', apiKey: 'commercial' },
    };

    const mapping = typeMapping[data.property_type];
    if (mapping && data[mapping.apiKey]) {
      const details = { ...data[mapping.apiKey] };

      // Handle features array if it contains objects
      if (details.features && Array.isArray(details.features)) {
        details.features = details.features.map((f: any) =>
          typeof f === 'object' && f !== null ? f.name : f,
        );
      }

      this.propertyForm.get(mapping.formGroup)?.patchValue(details);
    }

    // 4. Handle Image Previews (URLs from Cloudinary)
    if (data.hero_image) {
      this.heroImagePreview = getCloudinaryUrl(data.hero_image);
      // We don't set the form control for images to the URL string
      // because the validator expects a File or null.
      // We'll handle this in the submission logic.
    }

    if (data.images && Array.isArray(data.images)) {
      this.galleryPreviews = data.images.map((img: any) => ({
        url: getCloudinaryUrl(img.image),
        isExisting: true,
        id: img.id,
      }));
    }
  }

  setType(type: any) {
    this.property_type = type.value;
    this.types.forEach((t: any) => {
      t.isActive = t.value === type.value ? true : false;
    });
    this.propertyForm.get('property_type')?.setValue(type.value);
  }
  setMode(mode: any) {
    this.sale_type = mode.value;
    this.sale_modes.forEach((m: any) => {
      m.isActive = m.value === mode.value ? true : false;
    });
    this.propertyForm.get('sale_type')?.setValue(mode.value);
  }

  isMapOpen = false;

  openMap() {
    this.isMapOpen = true;
  }

  closeMap() {
    this.isMapOpen = false;
  }

  handleLocationSelected(event: LocationSelectedEvent) {
    this.propertyForm.get('location')?.setValue(event.address);
    this.propertyForm.get('location_text')?.setValue(event.city);
    this.closeMap();
  }

  clearLocation() {
    this.propertyForm.get('location')?.setValue('');
    this.propertyForm.get('location_text')?.setValue('');
  }

  // --- Image Upload Logic ---

  heroImagePreview: string | null = null;
  galleryPreviews: any[] = [];

  onHeroImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.propertyForm.get('hero_image')?.setValue(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.heroImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeHeroImage() {
    this.heroImagePreview = null;
    this.propertyForm.get('hero_image')?.setValue('');
  }

  onGalleryImagesSelected(event: any) {
    const files = Array.from(event.target.files as FileList);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.galleryPreviews.push({ file, url: e.target.result });
        this.updateGalleryFormControl();
      };
      reader.readAsDataURL(file);
    });

    // Clear input so same files can be selected again if removed
    event.target.value = '';
  }

  removeGalleryImage(index: number) {
    const removed = this.galleryPreviews.splice(index, 1)[0];
    if (removed.isExisting) {
      // Logic for tracking deleted existing images if needed by backend
      console.log('Removed existing image:', removed.id);
    }
    this.updateGalleryFormControl();
  }

  updateGalleryFormControl() {
    const files = this.galleryPreviews.filter((p) => !p.isExisting).map((p) => p.file);
    this.propertyForm.get('images')?.setValue(files.length > 0 ? files : null);
  }

  basicValues = () => {
    return {
      title: this.propertyForm.get('title')?.value,
      sale_price: this.propertyForm.get('sale_price')?.value,
      rent_price: this.propertyForm.get('rent_price')?.value,
      security_deposit: this.propertyForm.get('security_deposit')?.value,
      property_type: this.propertyForm.get('property_type')?.value,
      sale_type: this.propertyForm.get('sale_type')?.value,
      location: this.propertyForm.get('location')?.value,
      location_text: this.propertyForm.get('location_text')?.value,
      hero_image: this.propertyForm.get('hero_image')?.value,
      images: this.propertyForm.get('images')?.value,
    };
  };

  async publishListing() {
    console.log('--- Publish Listing Started ---');

    const typeMapping: { [key: string]: string } = {
      house: 'houseDetails',
      apartment: 'apartmentDetails',
      plots_and_land: 'plotsAndLandDetails',
      commercial: 'commercialDetails',
    };

    const activeGroup = typeMapping[this.property_type];
    const activeGroupForm = this.propertyForm.get(activeGroup);

    console.log('Active Property Type:', this.property_type);
    console.log('Active Group Name:', activeGroup);

    const commonFields = [
      'title',
      'location',
      'location_text',
      'property_type',
      'sale_type',
      'hero_image',
      'images',
    ];
    let isFormValid = true;

    // 1. Check common fields
    commonFields.forEach((field) => {
      const control = this.propertyForm.get(field);
      if (control?.invalid) {
        console.warn(`Validation Failed: Common field "${field}" is invalid.`, control.errors);
        control.markAsTouched();
        isFormValid = false;
      }
    });

    // 2. Check detail group
    if (activeGroupForm?.invalid) {
      console.warn(
        `Validation Failed: Detail group "${activeGroup}" is invalid.`,
        activeGroupForm.errors,
      );
      activeGroupForm.markAllAsTouched();
      isFormValid = false;
    }

    if (!isFormValid) {
      // Special case for Edit Mode: If hero_image/images are invalid but we have existing ones, it's okay
      if (this.isEditMode) {
        const heroCtrl = this.propertyForm.get('hero_image');
        const imagesCtrl = this.propertyForm.get('images');

        if (this.heroImagePreview && heroCtrl?.invalid) {
          console.log('Edit Mode: Hero image invalid but preview exists, bypassing.');
        } else if (!isFormValid) {
          console.error('Submission aborted: Form has validation errors.');
          return;
        }

        if (this.galleryPreviews.length > 0 && imagesCtrl?.invalid) {
          console.log('Edit Mode: Gallery invalid but previews exist, bypassing.');
        }
      } else {
        console.error('Submission aborted: Form has validation errors.');
        return;
      }
    }

    console.log('Form is valid! Building FormData...');
    const formData = new FormData();
    const basic = this.basicValues();

    // 3. Append Common Fields
    Object.entries(basic).forEach(([key, value]) => {
      if (key !== 'images' && key !== 'hero_image') {
        formData.append(key, (value as string | Blob) ?? '');
      }
    });

    // 4. Append Binary Files (Only if they are new Files)
    if ((basic.hero_image as any) instanceof File) {
      console.log('Appending New Hero Image:', basic.hero_image);
      formData.append('hero_image', basic.hero_image as any);
    }

    const newGalleryFiles = this.galleryPreviews.filter((p) => !p.isExisting).map((p) => p.file);
    if (newGalleryFiles.length > 0) {
      console.log(`Appending ${newGalleryFiles.length} new gallery images.`);
      newGalleryFiles.forEach((file) => formData.append('images', file as File));
    }

    // 5. Append Detail Fields
    if (activeGroupForm instanceof FormGroup) {
      Object.keys(activeGroupForm.controls).forEach((key) => {
        const val = activeGroupForm.get(key)?.value;
        if (Array.isArray(val)) {
          // Correctly handle arrays (like features) by appending each item
          val.forEach((item) => {
            formData.append(`${this.property_type}[${key}]`, String(item ?? ''));
          });
        } else {
          formData.append(`${this.property_type}[${key}]`, String(val ?? ''));
        }
      });
    }

    if (this.isEditMode && this.propertyId) {
      await this.propertyService.updateProperty(this.propertyId, {
        payload: formData,
        isFormData: true,
      });
    } else {
      await this.propertyService.createProperty({
        payload: formData,
        isFormData: true,
      });
    }
  }
}

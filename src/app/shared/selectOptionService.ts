import { signal } from '@angular/core';
import { Injectable, Signal } from '@angular/core';

export interface Option {
  label: string;
  value: string | boolean;
}
type CommercialType = 'commercial' | 'office' | 'retail' | 'industrial' | 'other';

@Injectable({
  providedIn: 'root',
})
export class SelectOptionService {
  bedrooms: Signal<Option[]> = signal([
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '10', value: '10' },
  ]);
  bathrooms: Signal<Option[]> = signal([
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '10', value: '10' },
  ]);

  houseParking: Signal<Option[]> = signal([
    { label: '2 Carriage', value: '2carriage' },
    { label: '3 Carriage', value: '3carriage' },
    { label: '4 Carriage', value: '4carriage' },
    { label: '5 Carriage', value: '5carriage' },
  ]);

  houseSubType: Signal<Option[]> = signal([
    { label: 'Detached', value: 'detached' },
    { label: 'Semi-Detached', value: 'semi-detached' },
    { label: 'Terraced', value: 'terraced' },
  ]);

  apartmentFurnishing: Signal<Option[]> = signal([
    { label: 'Furnished', value: 'furnished' },
    { label: 'Unfurnished', value: 'unfurnished' },
    { label: 'Semi Furnished', value: 'semi-furnished' },
  ]);

  apartmentOccupentPreference: Signal<Option[]> = signal([
    { label: 'Working Professionals', value: 'WorkingProfessionals' },
    { label: 'Students', value: 'Students' },
    { label: 'Family', value: 'Family' },
    { label: 'Others', value: 'Others' },
  ]);

  appartmentHasBalcony: Signal<Option[]> = signal([
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ]);

  plotType: Signal<Option[]> = signal([
    { label: 'Residential', value: 'residential' },
    { label: 'Commercial', value: 'commercial' },
    { label: 'Agricultural', value: 'agricultural' },
    { label: 'Industrial', value: 'industrial' },
    { label: 'Other', value: 'other' },
  ]);

  plotPermittedUse: Signal<Option[]> = signal([
    { label: 'Zoning', value: 'zoning' },
    { label: 'Agricultural', value: 'agricultural' },
    { label: 'R1', value: 'R1' },
    { label: 'R2', value: 'R2' },
    { label: 'Mixed Use', value: 'mixed use' },
    { label: 'Other', value: 'other' },
  ]);

  plotPosessionStatus: Signal<Option[]> = signal([
    { label: 'Immediate', value: 'immediate' },
    { label: 'Conditional', value: 'conditional' },
    { label: 'Under Development', value: 'under development' },
  ]);

  plotHasCornerPLot: Signal<Option[]> = signal([
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ]);

  commercialType: Signal<Option[]> = signal([
    { label: 'Commercial', value: 'commercial' },
    { label: 'Office', value: 'office' },
    { label: 'Retail', value: 'retail' },
    { label: 'Industrial', value: 'industrial' },
    { label: 'Other', value: 'other' },
  ]);

  commercialSubtypeMap: Record<CommercialType, Option[]> = {
    commercial: [
      { label: 'Mixed Use', value: 'Mixed Use' },
      { label: 'Business Center', value: 'Business Center' },
      { label: 'Others', value: 'Others' },
    ],
    office: [
      { label: 'Corporate Office', value: 'Corporate Office' },
      { label: 'Software Office', value: 'Software Office' },
      { label: 'Accounts Office', value: 'Accounts Office' },
      { label: 'Co-working', value: 'Co-working' },
    ],
    retail: [
      { label: 'Shop', value: 'Shop' },
      { label: 'Mall Kiosk', value: 'Mall Kiosk' },
      { label: 'Showroom', value: 'Showroom' },
    ],
    industrial: [
      { label: 'Factory', value: 'Factory' },
      { label: 'Warehouse', value: 'Warehouse' },
      { label: 'Manufacturing Unit', value: 'Manufacturing Unit' },
    ],
    other: [{ label: 'Other', value: 'Other' }],
  };

  commercialFurnishing: Signal<Option[]> = signal([
    { label: 'Furnished', value: 'furnished' },
    { label: 'Unfurnished', value: 'unfurnished' },
    { label: 'Semi Furnished', value: 'semi-furnished' },
  ]);

  commercialBuildingGrade: Signal<Option[]> = signal([
    { label: 'A', value: 'A' },
    { label: 'B', value: 'B' },
    { label: 'C', value: 'C' },
    { label: 'D', value: 'D' },
  ]);

  commercialHasKitchen: Signal<Option[]> = signal([
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ]);
}

// export class PropertyFormComponent {

//   private optionService = inject(SelectOptionService);

//   // signals from service
//   commercialTypes = this.optionService.commercialType;

//   // selected values
//   selectedCommercialType = signal<string | null>(null);
//   commercialSubtypes = signal<any[]>([]);
// }
// ✅ 2. Handle type change (this is the key part)

// When user selects commercial type, update subtype options:

// onCommercialTypeChange(type: string) {
//   this.selectedCommercialType.set(type);

//   const subtypes =
//     this.optionService.commercialSubtypeMap[type] ?? [];

//   this.commercialSubtypes.set(subtypes);
// }

// as commercialSubtypeMap is a object with key values and we can access value that is array with key

// TODO
// seprate component with only detail for all property type basic same design will be in parent and form controls we can also pass from the parent also can be use seprately from each child and in parent according to type we will show component and for checking invalid we will create function that will get type and return key of form detailPropertyForm and we will use that key to get form control and check for invalid and also for error then for making data for upload we will do that we will make payload like common details and then sepecific details do like this as it requires type[key] value
// onSubmit() {
//   const formData = new FormData();

//   // 1. Add Common Fields
//   formData.append('title', this.mainForm.get('title')?.value);
//   formData.append('price', this.mainForm.get('price')?.value);
//   formData.append('property_type', this.mainForm.get('property_type')?.value);

//   // 2. Add the Hero Image (File)
//   if (this.selectedFile) {
//     formData.append('hero_image', this.selectedFile);
//   }

//   // 3. Add Nested Fields (Looping through the active detail group)
//   const type = this.mainForm.get('property_type')?.value; // e.g., 'house'
//   const detailsGroup = this.mainForm.get('houseDetails') as FormGroup;

//   Object.keys(detailsGroup.controls).forEach(key => {
//     const value = detailsGroup.get(key)?.value;
//     // This creates the 'house[bedrooms]' format seen in your image
//     formData.append(`${type}[${key}]`, value);
//   });

//   // 4. Send to Backend
//   this.apiService.uploadProperty(formData).subscribe(res => {
//     console.log('Property Listed!', res);
//   });
// }

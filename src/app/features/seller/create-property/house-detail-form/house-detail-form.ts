import { Component, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Shared } from '../../../../shared/shared.module';
import { SelectOptionService } from '../../../../shared/selectOptionService';
import { PropertyForm } from '../../../../shared/forms.config';
@Component({
  selector: 'app-house-detail-form',
  imports: [Shared],
  templateUrl: './house-detail-form.html',
  styleUrl: './house-detail-form.scss',
})
export class HouseDetailForm {

  optionService = inject(SelectOptionService)
  propertySubTypes = this.optionService.houseSubType
  houseDetailForm = PropertyForm.get('houseDetails') as FormGroup
  newFeature = ''

  addFeatures = () => {
    const feature = this.newFeature?.trim();
    if (!feature) {
      return;
    }

    const currentFeatures = this.houseDetailForm.get('features')?.value || [];
    this.houseDetailForm.patchValue({
      features: [...currentFeatures, feature]
    });
    this.newFeature = '';
  }

  removeFeatures = (index:number) => {
    const currentFeatures = [...(this.houseDetailForm.get('features')?.value || [])];
    currentFeatures.splice(index,1);
    this.houseDetailForm.patchValue({ features: currentFeatures });
  }




}

import { Component, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Shared } from '../../../../shared/shared.module';
import { PropertyForm } from '../../../../shared/forms.config';
import { SelectOptionService } from '../../../../shared/selectOptionService';

@Component({
  selector: 'app-apartment-detail-form',
  imports: [Shared],
  templateUrl: './apartment-detail-form.html',
  styleUrl: './apartment-detail-form.scss',
})
export class ApartmentDetailForm {

  apartmentDetailForm = PropertyForm.get('apartmentDetails') as FormGroup
  optionService = inject(SelectOptionService)

  newFeature = ''

  addFeature(){
    const feature = this.newFeature?.trim()
    if(!feature){
      return
    }

    const currentFeatures = this.apartmentDetailForm.get('features')?.value || []
    this.apartmentDetailForm.patchValue({
      features:[...currentFeatures,feature]
    })
  }

  removeFeature(index:number){
    const currentFeatures = [...(this.apartmentDetailForm.get('features')?.value || [])]
    currentFeatures.splice(index,1)
    this.apartmentDetailForm.patchValue({ features: currentFeatures })
  }

}

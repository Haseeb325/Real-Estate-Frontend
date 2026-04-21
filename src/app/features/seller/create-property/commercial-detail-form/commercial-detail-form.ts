import { Component, inject, signal, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Shared } from '../../../../shared/shared.module';
import { PropertyForm } from '../../../../shared/forms.config';
import { SelectOptionService, Option } from '../../../../shared/selectOptionService';

@Component({
  selector: 'app-commercial-detail-form',
  imports: [Shared],
  templateUrl: './commercial-detail-form.html',
  styleUrl: './commercial-detail-form.scss',
})
export class CommercialDetailForm implements OnInit {
  commercialDetailForm = PropertyForm.get('commercialDetails') as FormGroup;
  optionService = inject(SelectOptionService);
  commercialSubtypes = signal<Option[]>([]);

  newFeature = '';

  ngOnInit() {
    this.commercialDetailForm.get('commercial_type')?.valueChanges.subscribe(type => {
      this.onCommercialTypeChange(type);
    });
    
    const initialType = this.commercialDetailForm.get('commercial_type')?.value;
    if(initialType) {
      this.onCommercialTypeChange(initialType);
    }
  }

  onCommercialTypeChange(type: string) {
    if(!type) {
      this.commercialSubtypes.set([]);
      this.commercialDetailForm.get('commercial_subtype')?.setValue('');
      return;
    }
    const subtypes = this.optionService.commercialSubtypeMap[type as keyof typeof this.optionService.commercialSubtypeMap] ?? [];
    this.commercialSubtypes.set(subtypes);
  }

  addFeature(){
    const feature = this.newFeature?.trim();
    if(!feature){
      return;
    }

    const currentFeatures = this.commercialDetailForm.get('features')?.value || [];
    this.commercialDetailForm.patchValue({
      features:[...currentFeatures,feature]
    });
    this.newFeature = '';
  }

  removeFeature(index:number){
    const currentFeatures = [...(this.commercialDetailForm.get('features')?.value || [])];
    currentFeatures.splice(index,1);
    this.commercialDetailForm.patchValue({ features: currentFeatures });
  }
}

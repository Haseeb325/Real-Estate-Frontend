import { Component, inject } from '@angular/core';
import { Shared } from '../../../../shared/shared.module';
import { PropertyForm } from '../../../../shared/forms.config';
import { FormGroup } from '@angular/forms';
import { SelectOptionService } from '../../../../shared/selectOptionService';

@Component({
  selector: 'app-plot-and-land-detail-form',
  imports: [Shared],
  templateUrl: './plot-and-land-detail-form.html',
  styleUrl: './plot-and-land-detail-form.scss',
})
export class PlotAndLandDetailForm {
  plotDetailForm = PropertyForm.get('plotsAndLandDetails') as FormGroup;
  optionService = inject(SelectOptionService);

  newFeature: string = '';

  addFeature() {
    const features = this.plotDetailForm.get('features')?.value || [];
    if (this.newFeature && !features.includes(this.newFeature)) {
      this.plotDetailForm.get('features')?.setValue([...features, this.newFeature]);
      this.newFeature = '';
    }
  }

  removeFeature(index: number) {
    const features = this.plotDetailForm.get('features')?.value || [];
    features.splice(index, 1);
    this.plotDetailForm.get('features')?.setValue(features);
  }
}

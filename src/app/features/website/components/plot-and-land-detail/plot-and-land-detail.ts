import { Component, Input } from '@angular/core';
import { Shared } from '../../../../shared/shared.module';
import { PlotAndLand } from '../../../../core/interfaces/property';

@Component({
  selector: 'app-plot-and-land-detail',
  imports: [Shared],
  templateUrl: './plot-and-land-detail.html',
  styleUrl: './plot-and-land-detail.scss',
})
export class PlotAndLandDetail {
  @Input()data:PlotAndLand | null = null
}

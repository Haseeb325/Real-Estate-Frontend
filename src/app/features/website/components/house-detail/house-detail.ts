import { Component, Input, signal, Signal } from '@angular/core';
import { Shared } from '../../../../shared/shared.module';
import { House, PropertyDetails } from '../../../../core/interfaces/property';

@Component({
  selector: 'app-house-detail',
  imports: [Shared],
  templateUrl: './house-detail.html',
  styleUrl: './house-detail.scss',
})
export class HouseDetail {
  @Input() data!: House | null;


}

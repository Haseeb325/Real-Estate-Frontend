import { Component, Input } from '@angular/core';
import { Shared } from '../../../../shared/shared.module';
import { Apartment } from '../../../../core/interfaces/property';

@Component({
  selector: 'app-apartment-detail',
  imports: [Shared],
  templateUrl: './apartment-detail.html',
  styleUrl: './apartment-detail.scss',
})
export class ApartmentDetail {
  @Input() data:Apartment | null = null
}

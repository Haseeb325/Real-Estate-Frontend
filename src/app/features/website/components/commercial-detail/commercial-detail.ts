import { Component, Input } from '@angular/core';
import { Shared } from '../../../../shared/shared.module';
import { Commercial } from '../../../../core/interfaces/property';

@Component({
  selector: 'app-commercial-detail',
  imports: [Shared],
  templateUrl: './commercial-detail.html',
  styleUrl: './commercial-detail.scss',
})
export class CommercialDetail {
  @Input()data:Commercial | null = null
}

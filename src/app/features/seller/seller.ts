import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SellerHeader } from './components/seller-header/seller-header';
import { Shared } from '../../shared/shared.module';

@Component({
  selector: 'app-seller',
  imports: [RouterOutlet, SellerHeader, Shared],
  templateUrl: './seller.html',
  styleUrl: './seller.scss',
})
export class Seller {}

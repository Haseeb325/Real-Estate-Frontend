import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopHeader } from '../../components/top-header/top-header';

@Component({
  selector: 'app-website',
  imports: [RouterOutlet, TopHeader],
  templateUrl: './website.html',
  styleUrl: './website.scss',
})
export class Website {}

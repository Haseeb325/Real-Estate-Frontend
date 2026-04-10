import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-top-header',
  imports: [RouterLink],
  templateUrl: './top-header.html',
  styleUrl: './top-header.scss',
})
export class TopHeader {}

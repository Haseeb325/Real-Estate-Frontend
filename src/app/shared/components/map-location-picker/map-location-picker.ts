import { Component, Output, EventEmitter, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import * as L from 'leaflet';

export interface LocationSelectedEvent {
  address: string;
  city: string;
}

@Component({
  selector: 'app-map-location-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-location-picker.html',
  styleUrls: [],
})
export class MapLocationPickerComponent implements OnInit {
  @Output() locationSelected = new EventEmitter<LocationSelectedEvent>();
  @Output() cancel = new EventEmitter<void>();

  map: any;
  marker: any;
  geocoder: any;
  selectedAddress: string = '';
  selectedCity: string = '';
  selectedLat: number = 0;
  selectedLng: number = 0;

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    // Small timeout to ensure the DOM is rendered before attaching map
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  initMap() {
    const mapElement = document.getElementById('mapCanvas');
    if (!mapElement) return;

    // Default to a central location (e.g., Islamabad)
    const defaultLat = 33.6844;
    const defaultLng = 73.0479;

    this.map = L.map(mapElement).setView([defaultLat, defaultLng], 13);

    // Use CartoDB Voyager tiles which explicitly render in English internationally
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(this.map);

    const customIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    this.marker = L.marker([defaultLat, defaultLng], {
      draggable: true,
      icon: customIcon
    }).addTo(this.map);

    this.marker.on('dragend', (event: any) => {
      const position = event.target.getLatLng();
      this.geocodePosition(position.lat, position.lng);
    });

    this.map.on('click', (event: any) => {
      this.marker.setLatLng(event.latlng);
      this.geocodePosition(event.latlng.lat, event.latlng.lng);
    });
  }

  async geocodePosition(lat: number, lng: number) {
    this.selectedLat = lat;
    this.selectedLng = lng;

    try {
      // Added &accept-language=en to force English results
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`);
      const data = await response.json();
      
      this.ngZone.run(() => {
        if (data && data.display_name) {
          this.selectedAddress = data.display_name;
          this.selectedCity = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
        } else {
          this.selectedAddress = 'Location not found. Please try moving the pin.';
          this.selectedCity = '';
        }
      });
    } catch (error) {
      this.ngZone.run(() => {
        this.selectedAddress = 'Error fetching location data.';
        this.selectedCity = '';
      });
    }
  }

  async searchLocation() {
    const searchInput = document.getElementById('mapSearchBox') as HTMLInputElement;
    const query = searchInput?.value;
    if (!query) return;

    try {
      // Added &accept-language=en to force English results
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&accept-language=en`);
      const data = await response.json();

      if (data && data.length > 0) {
        const place = data[0];
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);

        this.map.setView([lat, lng], 15);
        this.marker.setLatLng([lat, lng]);
        
        this.selectedLat = lat;
        this.selectedLng = lng;

        this.ngZone.run(() => {
          this.selectedAddress = place.display_name;
          this.selectedCity = place.address?.city || place.address?.town || place.address?.village || place.address?.county || query;
        });
      }
    } catch (error) {
      console.error('Search failed', error);
    }
  }

  onConfirm() {
    const mapUrl = `https://www.google.com/maps?q=${this.selectedLat},${this.selectedLng}`;
    this.locationSelected.emit({
      address: mapUrl,
      city: this.selectedCity,
    });
  }

  onCancel() {
    this.cancel.emit();
  }
}

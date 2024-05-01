import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { NgForOf, NgIf} from "@angular/common";
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    DatePipe
  ],
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  map: any;
  centralCoordinates: string = '';
  currentDate: string = '';
  storedData: { coordinates: string, date: string }[] = [];
  markers: any[] = [];

  ngOnInit() {
    this.map = L.map('map').setView([41.015137, 28.979530], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.getDataFromStorage();

    this.createMarker();
  }

  saveCoordinates() {
    const center = this.map.getCenter();

    this.centralCoordinates = `${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`;

    this.currentDate = new Date().toLocaleString();

    this.storedData.push({ coordinates: this.centralCoordinates, date: this.currentDate });

    localStorage.setItem('storedData', JSON.stringify(this.storedData));
  }

  getDataFromStorage() {

    const storedData = JSON.parse(localStorage.getItem('storedData') || '[]');

    if (storedData.length > 0) {
      this.storedData = storedData;
    }

  }

  downloadDataAsJson() {
    const data = JSON.stringify(this.storedData);
    const dataType = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataType);

    const a = document.createElement('a');

    a.href = url;
    a.download = 'coordinate_data.json';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  showMarkerOnMap(coordinates: string, deleteCoordinate: boolean = false, index: number = -1) {

    const [lat, lng] = coordinates.split(',').map(parseFloat);

    this.map.setView([lat, lng], 13);

    if (deleteCoordinate && index !== -1) {

      // coordinate delete
      this.storedData.splice(index, 1);
      localStorage.setItem('storedData', JSON.stringify(this.storedData));

      // marker delete
      this.map.removeLayer(this.markers[index]);
      this.markers.splice(index, 1);
    }
  }

  createMarker() {
    this.storedData.forEach(data => {
      const [lat, lng] = data.coordinates.split(',').map(parseFloat);
      const marker = L.marker([lat, lng]).addTo(this.map);
      this.markers.push(marker);
    });
  }

}

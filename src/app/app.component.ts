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
  mapData: { id: number, coordinates: string, date: string }[] = [];
  markers: any[] = [];
  counterForId: number = 0;

  ngOnInit() {

    // istanbul location
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

    this.mapData.push({ id: ++this.counterForId, coordinates: this.centralCoordinates, date: this.currentDate });

    localStorage.setItem('storedData', JSON.stringify(this.mapData));
  }

  getDataFromStorage() {

    const storedData = JSON.parse(localStorage.getItem('storedData') || '[]');

    if (storedData.length > 0) {
      this.mapData = storedData;
    }

    this.counterForId = Math.max(...this.mapData.map(data => data.id), 0);
  }

  downloadDataAsJson() {
    const data = JSON.stringify(this.mapData);
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
      this.mapData.splice(index, 1);
      localStorage.setItem('storedData', JSON.stringify(this.mapData));

      // marker delete
      this.map.removeLayer(this.markers[index]);
      this.markers.splice(index, 1);
    }
  }

  createMarker() {
    this.mapData.forEach(data => {
      const [lat, lng] = data.coordinates.split(',').map(parseFloat);
      const marker = L.marker([lat, lng]).addTo(this.map);
      this.markers.push(marker);
    });
  }

}

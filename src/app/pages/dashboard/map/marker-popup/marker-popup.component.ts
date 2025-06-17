import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MapMarker } from '../../../../models/marker.model';
import {TranslatePipe} from '../../../../translate.pipe';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-marker-popup',
  standalone: true,
  templateUrl: './marker-popup.component.html',
  imports: [
    TranslatePipe,
    NgIf
  ],
  styleUrls: ['./marker-popup.component.css']
})
export class MarkerPopupComponent {
  copiedMarkerId: number | null = null;

  @Input() marker!: MapMarker;
  @Output() onEdit = new EventEmitter<MapMarker>();
  @Output() onDelete = new EventEmitter<number>();
  @Output() onChangeCoords = new EventEmitter<MapMarker>();

  edit() {
    this.onEdit.emit(this.marker);
  }

  delete() {
    this.onDelete.emit(this.marker.id);
  }

  changeCoords() {
    this.onChangeCoords.emit(this.marker);
  }

  copyCoords(lat: number, lng: number): void {
    const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    navigator.clipboard.writeText(coords).then(() => {
      // позначаємо маркер як скопійований
      this.copiedMarkerId = this.marker.id; // або передайте id в метод

      // після 2 сек — очищуємо
      setTimeout(() => {
        this.copiedMarkerId = null;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy coordinates:', err);
    });
  }

}

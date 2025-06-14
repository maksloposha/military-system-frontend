import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MapMarker } from '../../../../models/marker.model';
import {TranslatePipe} from '../../../../translate.pipe';

@Component({
  selector: 'app-marker-popup',
  standalone: true,
  templateUrl: './marker-popup.component.html',
  imports: [
    TranslatePipe
  ],
  styleUrls: ['./marker-popup.component.css']
})
export class MarkerPopupComponent {
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
}

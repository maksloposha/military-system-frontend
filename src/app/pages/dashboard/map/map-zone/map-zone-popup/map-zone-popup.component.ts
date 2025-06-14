import {Component, EventEmitter, Input, Output, signal} from '@angular/core';
import {MapZone} from '../../../../../models/zone.model';
import {Polygon} from 'leaflet';
import {TranslatePipe} from '../../../../../translate.pipe';

@Component({
  selector: 'app-zone-popup',
  standalone: true,
  templateUrl: './map-zone-popup.component.html',
  styleUrl: './map-zone-popup.component.css',
  imports: [
    TranslatePipe
  ]
})
export class MapZonePopupComponent {
  @Input() zone!: MapZone;

  @Output() delete = new EventEmitter<{ polygon: Polygon; zone: MapZone }>();
  @Output() edit = new EventEmitter<{ polygon: Polygon; zone: MapZone }>();
  @Output() editCoordinates = new EventEmitter<{ polygon: Polygon; zone: MapZone }>();

  @Input() polygon!: Polygon;

  onEdit() {
    this.edit.emit({polygon: this.polygon, zone: this.zone});
  }

  onDelete() {
    this.delete.emit({polygon: this.polygon, zone: this.zone});
  }

  onEditCoordinates() {
    this.editCoordinates.emit({polygon: this.polygon, zone: this.zone});
  }

}

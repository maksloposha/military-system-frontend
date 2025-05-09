import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {UserService} from '../../../../services/user.service';
import {MarkerService} from '../../../../services/marker.service';
import {catchError} from 'rxjs';
import {MapMarker} from '../../../../models/marker.model';
import {marker} from 'leaflet';

@Component({
  selector: 'app-map-position-modal',
  templateUrl: './map-position-modal.component.html',
  styleUrls: ['./map-position-modal.component.css'],
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    NgForOf
  ]
})
export class MapPositionModalComponent implements OnInit {
  @Input() marker: MapMarker | null = null;
  @Input() visible = false;
  @Input() coordinates: { lat: number, lng: number } | null = null;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  name = '';
  markerType = '';
  description = '';
  unitType = '';
  commander = '';
  estimatedPersonnel: number | null = null;

  markerTypes: string[] = ['ALLY', 'ENEMY', 'FIREPOINT'];
  unitTypes: string[] = ['INFANTRY', 'TANKS', 'ARTILLERY'];

  commanders: { id: number; name: string }[] = []; // ⬅️ Тут зберігаються командири

  constructor(private userService: UserService, private markerService: MarkerService) {
  }

  ngOnInit(): void {
    this.userService.loadCommanders().pipe().subscribe((commanders) => {
      this.commanders = commanders;
    });

    if (this.marker) {
      this.name = this.marker.name;
      this.markerType = this.marker.type;
      this.description = this.marker.description;
      this.unitType = this.marker.unitType;
      this.commander = this.marker.commander;
      this.estimatedPersonnel = this.marker.estimatedPersonnel;
      this.coordinates = {
        lat: this.marker.latitude,
        lng: this.marker.longitude
      };
    }
  }

  save(): void {
    if (this.coordinates) {
      const markerData: Partial<MapMarker> = {
        name: this.name,
        type: this.markerType,
        description: this.description,
        unitType: this.unitType,
        commander: this.commander,
        estimatedPersonnel: this.estimatedPersonnel ?? 0,
        latitude: this.coordinates.lat,
        longitude: this.coordinates.lng
      };

      this.markerService.addMarker(markerData).pipe().subscribe((value) => {
        this.onSave.emit();
        catchError(() => {
          console.error('Error saving marker:', value);
          return [];
        });
      });
      this.marker = null;
    }
  }

  cancel(): void {
    this.marker = null;
    this.onCancel.emit();
  }

}

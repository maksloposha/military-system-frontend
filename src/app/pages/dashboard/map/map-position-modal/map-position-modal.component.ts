import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {UserService} from '../../../../services/user.service';
import {MarkerService} from '../../../../services/marker.service';
import {catchError} from 'rxjs';
import {MapMarker} from '../../../../models/marker.model';
import {marker} from 'leaflet';
import {UserSettingsService} from '../../../../services/user.settings.service';
import {UnitType} from '../../../../models/unitType.model';

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
  unitType: UnitType | undefined;
  commander :any = null;
  status = '';
  estimatedPersonnel: number | null = null;

  markerTypes: string[] = ['ALLY', 'ENEMY', 'FIREPOINT'];
  unitTypes: UnitType[] = [];
  statuses: string[] = [];

  commanders: { id: number; name: string }[] = [];

  constructor(private userService: UserService, private markerService: MarkerService, private userSettingsService: UserSettingsService) {
  }

  ngOnInit(): void {
    this.userService.loadCommanders().pipe().subscribe((commanders) => {
      this.commanders = commanders;
      if (this.marker?.commander) {
        this.commander = this.commanders.find(c => c.name === this.marker!.commander);
      }
    });

    this.userSettingsService.getPositionStatuses().pipe().subscribe((statuses) => {
      this.statuses = statuses;
    });

    this.userSettingsService.getUnits().pipe().subscribe((units) => {
      this.unitTypes = units ;

      if (this.marker?.unitType) {
        this.unitType = this.unitTypes.find(u => u.name === this.marker!.unitType.name);
      }
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
      this.status = this.marker.positionStatus;
    }
  }

  save(): void {
    if (this.coordinates) {
      const markerData: Partial<MapMarker> = {
        name: this.name,
        type: this.markerType,
        description: this.description,
        unitType: this.unitType!,
        commander: this.commander?.name,
        estimatedPersonnel: this.estimatedPersonnel ?? 0,
        latitude: this.coordinates.lat,
        longitude: this.coordinates.lng,
        positionStatus: this.status
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

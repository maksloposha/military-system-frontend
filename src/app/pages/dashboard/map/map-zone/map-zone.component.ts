import {
  Component,
  ComponentFactoryResolver,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewContainerRef
} from '@angular/core';
import * as L from 'leaflet';
import {LatLngTuple, LayerGroup, LeafletEvent, Polygon} from 'leaflet';
import 'leaflet-draw';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {MapZoneService} from '../../../../services/map.zone.service';
import {MapZone} from '../../../../models/zone.model';
import {MapZonePopupComponent} from './map-zone-popup/map-zone-popup.component';
import {ZoneSocketService} from '../../../../service-socket/zone-socket-service';

@Component({
  selector: 'app-map-zone',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './map-zone.component.html',
  styleUrl: './map-zone.component.css'
})
export class MapZoneComponent implements OnInit {
  @Input() map!: L.Map | undefined;
  @Input() visible = false;
  @Input() markerCreating = false;

  private drawnItems = new L.FeatureGroup();
  private drawControl?: L.Draw.Polygon;
  private editControl?: any = new L.Control.Draw({
    edit: {
      featureGroup: this.drawnItems,
      edit: {},
      remove: false
    },
    draw: undefined
  });
  private deleteControl? = new L.Control.Draw({
    edit: {
      featureGroup: this.drawnItems,
      edit: false,
      remove: true
    },
    draw: undefined
  });

  zoneName: string = '';
  zoneType: 'ALLY' | 'ENEMY' | 'NEUTRAL' = 'ALLY';
  drawingReady = false;
  zoneToEdit: MapZone | null = null;
  @Output() isCreationMode = new EventEmitter<Boolean>();
  private zoneMap = new Map<number, { polygon: Polygon, zone: MapZone }>();

  constructor(private mapZoneService: MapZoneService, private viewContainerRef: ViewContainerRef,
              private componentFactoryResolver: ComponentFactoryResolver, private mapSocketService: ZoneSocketService) {
    this.mapSocketService.zoneUpdates$.subscribe((event) => {
      switch (event.type) {
        case 'NEW_ZONE':
          this.addZoneToMap(event.zone);
          break;
        case 'UPDATE':
          this.updateZoneOnMap(event.zone);
          break;
        case 'DELETE':
          this.removeZoneFromMap(event.zone.id!);
          break;
      }
    });
  }

  ngOnInit() {
    if (this.map) {
      this.map.addLayer(this.drawnItems);
      this.loadZones();
    }
  }

  startDrawing() {

    this.drawControl = new L.Draw.Polygon(this.map as any, {
      shapeOptions: {color: this.getColorByType(this.zoneType)}
    });
    if (this.map) {
      this.map.on(L.Draw.Event.CREATED, this.onZoneCreated.bind(this));
    }
    this.drawControl.enable();
    this.visible = false;
    this.drawingReady = true;
  }

  private onZoneCreated(e: any) {
    const layer = e.layer;
    const coords = layer.getLatLngs()[0].map((p: any) => [p.lng, p.lat]);

    const zone: MapZone = {
      name: this.zoneName,
      type: this.zoneType,
      coordinates: coords
    };

    console.log('Created zone:', zone);
    this.saveCreatedZone(zone, layer);

    if (this.map) {
      this.map.off(L.Draw.Event.CREATED, this.onZoneCreated as any);
    }
    this.drawingReady = false;
  }

  enableEditCoordinates(polygon: Polygon, zone: MapZone) {
    polygon.closePopup();
    this.drawnItems.addLayer(polygon);
    this.map?.addControl(this.editControl!);

    this.map?.once(L.Draw.Event.EDITED, (e: LeafletEvent) => {
      this.map?.removeControl(this.editControl!);
      const editedEvent = e as unknown as { layers: LayerGroup };

      editedEvent.layers.eachLayer((layer: L.Layer) => {
        const latlngs = (layer as L.Polygon).getLatLngs();

        const updatedZone: MapZone = {
          ...zone,
          coordinates: (latlngs[0] as L.LatLng[]).map(p => [p.lng, p.lat] as [number, number])
        };


        this.mapZoneService.updateZone(updatedZone).subscribe((savedZone: MapZone) => {
          console.log('Zone updated successfully:', savedZone);

          this.map?.removeLayer(layer);

          const latLngCoords: LatLngTuple[] = savedZone.coordinates.map(
            (coord: number[]): LatLngTuple => [coord[1], coord[0]]
          );

          const newPolygon = L.polygon(latLngCoords, {
            color: this.getColorByType(savedZone.type),
            fillOpacity: 0.4,
            weight: 2
          }).addTo(this.map!);

          const popup = this.createPopupComponent(savedZone, newPolygon);
          newPolygon.bindPopup(popup);

          this.zoneMap.set(savedZone.id!, {polygon: newPolygon, zone: savedZone});
        }, error => {
          console.error('Помилка при оновленні зони:', error);
        });
      });

    });
  }


  enableDelete(polygon: Polygon, zone: MapZone) {
    polygon.closePopup();
    this.drawnItems.addLayer(polygon);

    this.map?.addControl(this.deleteControl!);

    this.map?.on(L.Draw.Event.DELETED, (e: LeafletEvent) => {
      this.map?.removeControl(this.deleteControl!);


      this.mapZoneService.deleteZone(zone.id!).subscribe({
        next: () => {
          console.log('Зону успішно видалено:', zone.id);
          this.drawnItems.removeLayer(polygon);
          this.zoneMap.delete(zone.id!);
        },
        error: (err) => {
          console.error('Помилка видалення зони:', err);
          polygon.addTo(this.map!);
        },

      });
    });
  }

  enableEdit(polygon: Polygon, zone: MapZone) {
    polygon.closePopup();
    this.zoneToEdit = zone;
    this.zoneName = zone.name;
    this.zoneType = zone.type;
    this.visible = true;
    this.drawingReady = false;
  }


  private saveCreatedZone(zone: MapZone, layer: L.Polygon) {
    this.mapZoneService.addZone(zone).subscribe((savedZone: MapZone) => {
      console.log('Zone saved successfully:', savedZone);


      const latLngCoords: LatLngTuple[] = savedZone.coordinates.map(
        (coord: number[]): LatLngTuple => [coord[1], coord[0]]
      );

      const polygon = L.polygon(latLngCoords, {
        color: this.getColorByType(savedZone.type),
        fillOpacity: 0.4,
        weight: 2
      }).addTo(this.map!);
      this.zoneMap.set(savedZone.id!, {polygon: polygon, zone: savedZone});
      polygon.on('click', () => {
        if (!this.markerCreating) {
          polygon.openPopup();
        }
      })

      const popup = this.createPopupComponent(savedZone, polygon);
      polygon.bindPopup(popup);

      this.cancelZoneCreation();
    }, error => {
      console.error('Error saving zone:', error);
    });
  }


  cancelZoneCreation() {
    this.drawingReady = false;
    this.visible = false;
    this.isCreationMode.emit(false);
    this.drawnItems.clearLayers();
  }

  private getColorByType(type: string): string {
    switch (type) {
      case 'ALLY':
        return 'blue';
      case 'ENEMY':
        return 'red';
      case 'NEUTRAL':
        return 'gray';
      default:
        return 'black';
    }
  }

  private loadZones() {
    this.mapZoneService.getZones().subscribe(zones => {
      zones.forEach(zone => {
        const latLngCoords: LatLngTuple[] = zone.coordinates.map(
          (coord: number[]): LatLngTuple => [coord[1], coord[0]]
        );

        const polygon = L.polygon(latLngCoords, {
          color: this.getColorByType(zone.type),
          fillOpacity: 0.4,
          weight: 2
        }).addTo(this.map!);

        const popup = this.createPopupComponent(zone, polygon);

        this.zoneMap.set(zone.id!, {polygon: polygon, zone: zone});
        polygon.bindPopup(popup);
        polygon.off('click');
        polygon.on('click', () => {
          if (!this.markerCreating) {
            polygon.openPopup();
          }
        })
      });
    }, error => {
      console.error('Помилка завантаження зон:', error);
    });
  }

  private createPopupComponent(zone: MapZone, polygon: L.Polygon): HTMLElement {
    const factory = this.componentFactoryResolver.resolveComponentFactory(MapZonePopupComponent);
    const componentRef = this.viewContainerRef.createComponent(factory);
    componentRef.instance.zone = zone;
    componentRef.instance.polygon = polygon;
    componentRef.instance.editCoordinates.subscribe(({polygon, zone}) => this.enableEditCoordinates(polygon, zone));
    componentRef.instance.delete.subscribe(({polygon, zone}) => this.enableDelete(polygon, zone));
    componentRef.instance.edit.subscribe(({polygon, zone}) => this.enableEdit(polygon, zone));

    return componentRef.location.nativeElement;
  }


  private addZoneToMap(zone: MapZone) {
    if (this.zoneMap.has(zone.id!)) {
      console.error('Zone with this ID already exists on the map:', zone.id);
      return;
    }
    const latLngCoords: LatLngTuple[] = zone.coordinates.map(
      (coord: [number, number]) => [coord[1], coord[0]]
    );

    const polygon = L.polygon(latLngCoords, {
      color: this.getColorByType(zone.type),
      fillOpacity: 0.4,
      weight: 2
    }).addTo(this.map!);
    polygon.on('click', () => {
      if (!this.markerCreating) {
        polygon.openPopup();
      }
    })

    const popup = this.createPopupComponent(zone, polygon);
    polygon.bindPopup(popup);

    this.zoneMap.set(zone.id!, {polygon: polygon, zone: zone});
  }

  private updateZoneOnMap(zone: MapZone) {
    const existingPolygon = this.zoneMap.get(zone.id!);
    if (existingPolygon) {
      this.map?.removeLayer(existingPolygon.polygon);
      this.zoneMap.delete(zone.id!);
    }
    this.addZoneToMap(zone);
  }

  private removeZoneFromMap(zoneId: number) {
    const existingPolygon = this.zoneMap.get(zoneId);
    if (existingPolygon) {
      this.map?.removeLayer(existingPolygon.polygon);
      this.zoneMap.delete(zoneId);
    }
  }

  public saveNewZoneDetails() {
    if (!this.zoneToEdit) {
      console.error('No zone to edit');
      return;
    }
    const updatedZone: MapZone = {
      ...this.zoneToEdit,
      name: this.zoneName,
      type: this.zoneType
    };
    this.mapZoneService.updateZone(updatedZone).subscribe((savedZone: MapZone) => {
      console.log('Zone updated successfully:', savedZone);
      this.zoneToEdit = null;
      this.drawingReady = false;
      this.visible = false;
      const polygon = this.zoneMap.get(savedZone.id!)?.polygon;
      polygon?.unbindPopup();
      polygon?.bindPopup(this.createPopupComponent(savedZone, polygon!));
    }, error => {
      console.error('Error updating zone:', error);
    });
  }
}

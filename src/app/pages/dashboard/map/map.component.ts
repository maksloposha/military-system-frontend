import {
  AfterViewInit,
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  EmbeddedViewRef,
  Injector,
  OnInit
} from '@angular/core';
import * as L from 'leaflet';
import {MapPositionModalComponent} from './map-position-modal/map-position-modal.component';
import {NgIf} from '@angular/common';
import {MarkerService} from '../../../services/marker.service';
import {MapMarker} from '../../../models/marker.model';
import {MapZoneComponent} from './map-zone/map-zone.component';
import {MarkerPopupComponent} from './marker-popup/marker-popup.component';
import {MarkerSocketService} from '../../../service-socket/marker-socket-service';
import {UnitType} from '../../../models/unitType.model';
import {ConfirmDialogService} from '../../../utils/confirm-dialog/confirm-dialog.service';
import {TranslatePipe} from '../../../translate.pipe';
import {TranslationService} from '../../../services/translation.service';
import {Layer} from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  standalone: true,
  imports: [MapPositionModalComponent, NgIf, MapZoneComponent, TranslatePipe],
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {
  protected map: L.Map | undefined;
  protected markerToEdit: MapMarker | null = null;
  private markersLayer: L.LayerGroup = L.layerGroup();

  isSelectingPosition = false;
  selectedCoordinates: { lat: number, lng: number } | null = null;
  isModalVisible = false;
  isZoneCreationMode = false;
  markersMap: Map<number, L.Marker> = new Map();

  private tempMarker: L.Marker | null = null;

  constructor(private markerService: MarkerService,
              private componentFactoryResolver: ComponentFactoryResolver,
              private injector: Injector,
              private appRef: ApplicationRef,
              private markerSocketService: MarkerSocketService,
              private confirmDialogService: ConfirmDialogService,
              private translate: TranslationService) {
  }

  ngOnInit(): void {
    this.initMap();
    this.loadMarkers();
    this.initAutoUpdatingMarkers();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  private initMap(): void {
    this.map = L.map('map').setView([50.4501, 30.528], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => this.onMapClick(e));
  }

  onAddPositionClick(): void {
    this.isSelectingPosition = true;
  }

  onMapClick(e: L.LeafletMouseEvent): void {
    if (this.isSelectingPosition) {
      if (this.markerToEdit) {
        this.markerToEdit.latitude = e.latlng.lat;
        this.markerToEdit.longitude = e.latlng.lng;
        this.markerService.updateMarker(this.markerToEdit).subscribe(
          () => {
            this.loadMarkers();
            this.isSelectingPosition = false;
            this.selectedCoordinates = null;
          },
          (error) => {
            console.error('Error updating marker:', error);
          }
        );
      } else {
        this.selectedCoordinates = {
          lat: e.latlng.lat,
          lng: e.latlng.lng
        };

        if (this.tempMarker) {
          this.map?.removeLayer(this.tempMarker);
        }

        this.tempMarker = L.marker([e.latlng.lat, e.latlng.lng], {
          opacity: 0.7,
          draggable: false
        }).addTo(this.map!);

        this.isSelectingPosition = false;
        this.openModal();
      }
    }
  }

  openModal(): void {
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.markerToEdit = null;
    this.clearTempMarker();
  }

  cancelSelecting(): void {
    this.isSelectingPosition = false;
    this.selectedCoordinates = null;
    this.clearTempMarker();
    if (this.markerToEdit) {
      this.map?.addLayer(this.markersMap.get(this.markerToEdit.id)!);
      this.markerToEdit = null;
    }
  }

  private clearTempMarker(): void {
    if (this.tempMarker) {
      this.map?.removeLayer(this.tempMarker);
      this.tempMarker = null;
    }
  }

  private loadMarkers(): void {
    this.markerService.getMarkers().subscribe({
      next: (markers) => {
        this.markersLayer.clearLayers();
        markers.forEach(marker => this.addMarkerToMap(marker));
      },
      error: (err) => {
        console.error('Помилка завантаження маркерів', err);
      }
    });
  }

  private initAutoUpdatingMarkers() {
    this.markerSocketService.markerUpdates$.subscribe(event => {
      if (event.markers) {
        this.markersLayer.clearLayers();
        event.markers.forEach((marker: MapMarker) => {
          this.addMarkerToMap(marker)
        });
      }
    });
  }

  private addMarkerToMap(marker: MapMarker): void {
    if (!this.map) return;

    this.createMarker(marker).then(leafletMarker => {this.markersLayer.addLayer(leafletMarker as Layer);});
  }

  onMarkerSaved(): void {
    this.markerToEdit = null;
    this.closeModal();
    this.loadMarkers();
  }


  private async getIconByType(type: UnitType, side: string): Promise<L.Icon> {
    const color = side.toLowerCase() === 'ally' ? '#034269' : '#520b01';
    let recoloredSvg = this.recolorSvg(type.svgContent, color);

    const pngUrl = await this.convertSvgToPng(recoloredSvg, 100, 100);

    return L.icon({
      iconUrl: pngUrl,
      iconSize: [100, 100],
      iconAnchor: [50, 50],
      popupAnchor: [0, -50],
      className: 'fixed-icon'
    });
  }


  private async createMarker(marker: MapMarker): Promise<L.Marker> {
    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(MarkerPopupComponent)
      .create(this.injector);

    componentRef.instance.marker = marker;
    componentRef.instance.onEdit.subscribe((m) => this.handleEdit(m));
    componentRef.instance.onDelete.subscribe((id) => this.handleDelete(id));
    componentRef.instance.onChangeCoords.subscribe((m) => {
      this.handleChangeCoords(m);
    });

    this.appRef.attachView(componentRef.hostView);

    const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

    // Очікуємо отримання іконки
    const icon = await this.getIconByType(marker.unitType, marker.type);

    const leafletMarker = L.marker([marker.latitude, marker.longitude], { icon });

    if (this.map) {
      leafletMarker.addTo(this.map);
    }
    this.markersMap.set(marker.id, leafletMarker);

    leafletMarker.bindPopup(domElem);

    return leafletMarker;
  }

  private handleEdit(m: MapMarker) {
    this.markerToEdit = m;
    this.isModalVisible = true;
    this.selectedCoordinates = {
      lat: m.latitude,
      lng: m.longitude
    };
  }

  private handleDelete(id: number) {
    const dialogText = this.translate.instant("deleteMarkerConfirmation");
    const confirmBtn = this.translate.instant("delete");
    const cancelBtn = this.translate.instant("cancel");
    this.confirmDialogService.open(dialogText, confirmBtn, cancelBtn).then((confirmed) => {
      if (confirmed) {
        this.markerService.deleteMarker(id).subscribe({
          next: () => {
            this.loadMarkers();
          },
          error: (err) => {
            console.error('Помилка видалення маркера', err);
          }
        });
      }
    });
  }

  public buttonsAreDisabled(): boolean {
    return this.isZoneCreationMode || this.isSelectingPosition || this.isModalVisible;
  }

  private handleChangeCoords(m: MapMarker) {
    this.isSelectingPosition = true;
    this.markerToEdit = m;
    const marker = this.markersMap.get(m.id);
    if (marker) {
      this.map?.removeLayer(marker);
    }
  }

  private recolorSvg(svg: string, fillColor: string): string {
    return svg.replace(/fill="[^"]*"/g, `fill="${fillColor}"`);
  }

  private convertSvgToPng(svg: string, width: number, height: number): Promise<string> {
    return new Promise((resolve) => {
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = url;
    });
  }



}

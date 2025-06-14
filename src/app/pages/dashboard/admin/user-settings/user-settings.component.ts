import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {UserSettingsService} from '../../../../services/user.settings.service';
import {RouterLink} from '@angular/router';
import {UnitType} from '../../../../models/unitType.model';
import {TranslatePipe} from '../../../../translate.pipe';


@Component({
  selector: 'app-user-settings',
  imports: [
    FormsModule,
    NgForOf,
    RouterLink,
    NgIf,
    NgOptimizedImage,
    TranslatePipe
  ],
  templateUrl: './user-settings.component.html',
  standalone: true,
  styleUrl: './user-settings.component.css'
})
export class UserSettingsComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  newRank = '';
  newUnit = '';
  newUnitSvg = '';
  ranks: string[] = [];
  positionStatuses: string[] = [];
  newPositionStatus = '';
  units: UnitType[] = [];
  selectedFileName: string = '';

  constructor(private userSettingsService: UserSettingsService) {
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.userSettingsService.getRanks().subscribe(data => {
      this.ranks = data;
    });
    this.userSettingsService.getUnits().subscribe(data => this.units = data);
    this.userSettingsService.getPositionStatuses().subscribe(data => this.positionStatuses = data);
  }

  addRank(): void {
    if (this.newRank.trim()) {
      this.userSettingsService.addRank(this.newRank.trim()).subscribe(() => {
        this.newRank = '';
        this.loadData();
      });
    }
  }

  addPositionStatus(): void {
    this.userSettingsService.addPositionStatus(this.newPositionStatus.trim()).subscribe(() => {
      this.newPositionStatus = '';
      this.loadData();
    });
  }

  goBack() {
    this.close.emit();
  }

  onUnitImageSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) return;

    this.selectedFileName = file.name;
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {

        this.newUnitSvg = reader.result as string;
        console.log('SVG string loaded directly:', this.newUnitSvg);
      };
      reader.readAsText(file);

    } else if (file.type === 'image/png' || file.type === 'image/jpeg') {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const svgString = ImageTracer.imagedataToSVG(imageData);
            this.newUnitSvg = svgString;
            console.log('SVG string from traced image:', this.newUnitSvg);
          }
        };
      };
      reader.readAsDataURL(file);

    } else {
      alert('Лише PNG, JPG або SVG зображення підтримуються.');
    }
  }


  addUnit(): void {
    if (this.newUnit.trim() && this.newUnitSvg) {
      const newUnitObj: UnitType = {
        name: this.newUnit.trim(),
        svgContent: this.newUnitSvg
      };
      this.userSettingsService.addUnit(newUnitObj).subscribe(() => {
        this.newUnit = '';
        this.newUnitSvg = '';
        this.loadData();
      });
    }
  }

  encodeSvg(svg: string): string {
    return btoa(unescape(encodeURIComponent(svg)));
  }

  deleteRank(rank: string) {
    this.userSettingsService.deleteRank(rank).subscribe(() => {
      this.loadData();
    });
  }

  deleteUnitType(id: number | undefined) {
    if (id) {
      this.userSettingsService.deleteUnitType(id).subscribe(() => {
        this.loadData();
      });
    }
  }

  deleteStatus(status: string) {
    this.userSettingsService.deletePositionStatus(status).subscribe(() => {
      this.loadData();
    });
  }
}

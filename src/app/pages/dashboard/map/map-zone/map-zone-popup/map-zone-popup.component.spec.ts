import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapZonePopupComponent } from './map-zone-popup.component';

describe('MapZonePopupComponent', () => {
  let component: MapZonePopupComponent;
  let fixture: ComponentFixture<MapZonePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapZonePopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapZonePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

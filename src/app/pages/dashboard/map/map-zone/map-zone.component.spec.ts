import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapZoneComponent } from './map-zone.component';

describe('MapZoneComponent', () => {
  let component: MapZoneComponent;
  let fixture: ComponentFixture<MapZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapZoneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

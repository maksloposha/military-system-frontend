import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapPositionModalComponent } from './map-position-modal.component';

describe('MapPositionModalComponent', () => {
  let component: MapPositionModalComponent;
  let fixture: ComponentFixture<MapPositionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapPositionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapPositionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

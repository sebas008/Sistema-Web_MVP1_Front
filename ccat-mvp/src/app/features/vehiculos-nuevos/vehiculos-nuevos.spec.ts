import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculosNuevos } from './vehiculos-nuevos';

describe('VehiculosNuevos', () => {
  let component: VehiculosNuevos;
  let fixture: ComponentFixture<VehiculosNuevos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculosNuevos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiculosNuevos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

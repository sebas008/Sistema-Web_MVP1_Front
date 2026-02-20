import { TestBed } from '@angular/core/testing';

import { Guias } from './guias';

describe('Guias', () => {
  let service: Guias;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Guias);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

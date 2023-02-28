import { TestBed } from '@angular/core/testing';

import { EmergencyLoadService } from './emergency-load.service';

describe('EmergencyLoadService', () => {
  let service: EmergencyLoadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmergencyLoadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

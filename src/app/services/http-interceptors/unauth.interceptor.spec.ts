import { TestBed } from '@angular/core/testing';

import { UnauthService } from './unauth.service';

describe('UnauthService', () => {
  let service: UnauthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnauthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import { BookingApi } from './booking-api';

describe('BookingApi', () => {
  let service: BookingApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookingApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DigitalTicket } from './digital-ticket';

describe('DigitalTicket', () => {
  let component: DigitalTicket;
  let fixture: ComponentFixture<DigitalTicket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DigitalTicket],
    }).compileComponents();

    fixture = TestBed.createComponent(DigitalTicket);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdssDetails } from './cdss-details';

describe('CdssDetails', () => {
  let component: CdssDetails;
  let fixture: ComponentFixture<CdssDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdssDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdssDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

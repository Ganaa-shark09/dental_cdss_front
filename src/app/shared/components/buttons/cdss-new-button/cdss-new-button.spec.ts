import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdssNewButton } from './cdss-new-button';

describe('CdssNewButton', () => {
  let component: CdssNewButton;
  let fixture: ComponentFixture<CdssNewButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdssNewButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdssNewButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

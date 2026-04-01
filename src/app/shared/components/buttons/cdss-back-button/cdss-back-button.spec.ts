import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdssBackButton } from './cdss-back-button';

describe('CdssBackButton', () => {
  let component: CdssBackButton;
  let fixture: ComponentFixture<CdssBackButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdssBackButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdssBackButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdssSaveButton } from './cdss-save-button';

describe('CdssSaveButton', () => {
  let component: CdssSaveButton;
  let fixture: ComponentFixture<CdssSaveButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdssSaveButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdssSaveButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

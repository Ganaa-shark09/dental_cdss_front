import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdssDeleteButton } from './cdss-delete-button';

describe('CdssDeleteButton', () => {
  let component: CdssDeleteButton;
  let fixture: ComponentFixture<CdssDeleteButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdssDeleteButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdssDeleteButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

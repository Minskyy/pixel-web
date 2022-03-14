import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PixelTabComponent } from './pixel-tab.component';

describe('PixelTabComponent', () => {
  let component: PixelTabComponent;
  let fixture: ComponentFixture<PixelTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PixelTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PixelTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

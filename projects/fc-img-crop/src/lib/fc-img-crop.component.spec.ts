import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FcImgCropComponent } from './fc-img-crop.component';

describe('FcImgCropComponent', () => {
  let component: FcImgCropComponent;
  let fixture: ComponentFixture<FcImgCropComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FcImgCropComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FcImgCropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

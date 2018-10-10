import { TestBed } from '@angular/core/testing';

import { FcImgCropService } from './fc-img-crop.service';

describe('FcImgCropService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FcImgCropService = TestBed.get(FcImgCropService);
    expect(service).toBeTruthy();
  });
});

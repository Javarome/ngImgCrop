import {NgModule} from '@angular/core';

import {FcImgCropComponent} from "./fc-img-crop.component";
export {CropAreaType} from "./classes/crop-area";

@NgModule({
  declarations: [
    FcImgCropComponent
  ],
  exports: [
    FcImgCropComponent
  ]
})
export class FcImgCropModule {
}

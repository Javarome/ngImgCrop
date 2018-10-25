import {NgModule} from '@angular/core';

import {FcImgCropComponent} from "./fc-img-crop.component";
export {FcImgCropAreaType} from "./classes/crop-area";
export {FcImgCropEvent} from "./classes/crop-pubsub";

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

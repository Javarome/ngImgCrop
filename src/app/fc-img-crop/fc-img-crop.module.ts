import {NgModule} from '@angular/core';

import {FcImgCropComponent} from "./fc-img-crop.component";

@NgModule({
    declarations: [
        FcImgCropComponent
    ],
    exports: [
        FcImgCropComponent
    ]
})
export class CropModule {
}

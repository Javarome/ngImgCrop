# FcImgCrop

This is an Angular (6+) version of [ngImgCrop](https://github.com/famicity/ngImgCrop).

## Usage

In the module of your choice, import the crop module:

```js
import {CropModule} from "fc-img-crop";

@NgModule({
  declarations: [
    YourComponent
  ],
  imports: [
    CropModule
  ]
})
export class YourModule {
}
```

then the components of this module will be able to use the crop component in their template:

```html
<fc-img-crop
  [image]="imageDataURI"
  [(resultImage)]="resultImageDataURI"
  [(areaDetails)]="cropDetails"
  [changeOnFly]="changeOnFly"
  [areaType]="type"
  [areaMinSize]="selMinSize"
  [resultImageFormat]="resultImageFormat"
  [resultImageQuality]="resultImgQuality"
  [resultImageSize]="resImgSize"
  (onChange)="onChange($event)"
  (onLoadBegin)="onLoadBegin()"
  (onLoadDone)="onLoadDone()"
  (onLoadError)="onLoadError()"
></fc-img-crop>
```
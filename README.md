# FcImgCrop

This is an Angular (2+) version of [ngImgCrop](https://github.com/famicity/ngImgCrop).

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Packaging

Run `ng build fc-img-crop` to build the (npm) library project. The build artifacts will be stored in the `dist/` directory.

## Usage

In the module of your choice, import the crop module:

```js
import {CropModule} from "fc-img-crop";

@NgModule({
  declarations: [
    YourComponent,
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

See the sample `/app` for an example.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

_This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.2.4._

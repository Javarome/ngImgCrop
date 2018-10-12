# FcImgCrop

This is an Angular (6+) version of [ngImgCrop](https://github.com/famicity/ngImgCrop).

## Build the component

Run `ng build fc-img-crop` to build the (npm) library project. The build artifacts will be stored in the `dist/` directory.

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

then the components of this module will be able to use the crop component:

```js
import {CropAreaDetails, CropAreaType} from "fc-img-crop";

@Component({
  selector: 'your-component',
  template: `
    <p>Here is a crop of the image in imageDataURI:</p>
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
    <p>Crop result:</p>
    <img [src]="resultImageDataURI"/>
    <p>{{cropDetails | json}}</p>`
})
export class YourComponent {
  type = CropAreaType.Circle;
  imageDataURI = '';
  resultImageDataURI = '';
  resultImageFormat = 'image/png';
  resultImgQuality = 1;
  selMinSize = 100;
  resImgSize = 200;
  edtImageURI: string;
  changeOnFly: boolean;
  cropDetails: CropAreaDetails;
}
```

See the test app for an example.

## Build the test app

Run `ng build` to build the `src/app` test project, which uses the component. 
The build artifacts will be stored in the `dist/` directory. 
Use the `--prod` flag for a production build.

## Development server

Run `ng serve` for a dev server that (re)builds the test app at every change of the source files. 
Navigate to `http://localhost:4200/` to access the test app. 

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

_This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.2.4._

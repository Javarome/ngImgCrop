# FcImgCrop

fgImgCrop, a Simple Image Crop directive for Angular (6+). Enables to crop a circle or a square out of an image.

This forks of [ngImgCrop](https://github.com/famicity/ngImgCrop) adds:

 - a way to get details (coordinates) about the crop area. Same as the one from
 - bugfixes about EXIF parsing
 - Support for Angular (6+)

## Screenshots

![Circle Crop](https://raw.github.com/alexk111/ngImgCrop/master/screenshots/circle_1.jpg "Circle Crop")

![Square Crop](https://raw.github.com/alexk111/ngImgCrop/master/screenshots/square_1.jpg "Square Crop")

## Live demo

[Live demo on CodePen](http://codepen.io/Javarome/pen/RPLZvd)

## Requirements

 - Angular
 - Modern Browser supporting `<canvas>

## Installing

`npm install fc-img-crop --save`

## Usage

1. Add the image crop component `<fc-img-crop>` to the HTML file where you want to use an image crop control. 
   _A container, you place the directive to, should have some pre-defined size (absolute or relative to its parent). 
   That's required, because the image crop control fits the size of its container._
2. Bind the directive to a source image property (using `[image]=""` option). 
   The component will read the image data from that property and watch for updates. 
   The property can be a url to an image, or a data uri.
3. Bind the directive to a result image property (using `[(resultImage)]=""` option). 
   On each update, the component will put the content of the crop area to that property in the data uri format.
4. Set up the options that make sense to your application.
5. Done!

## Result image

The result image will always be a square for the both circle and square area types. 
It's highly recommended to store the image as a square on your back-end, because this will enable you to easily update your pics later, if you decide to implement some design changes. 
Showing a square image as a circle on the front-end is not a problem - it is as easy as adding a *border-radius* style for that image in a css.

## Example code

The following code enables to select an image using a file input and crop it. 
The cropped image data is inserted into img each time the crop area updates.

In the module of your choice, import the crop module:

```js
import {FcImgCropModule} from "fc-img-crop";

@NgModule({
  declarations: [
    YourComponent
  ],
  imports: [
    FcImgCropModule
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
      [changeOnFly]="true"
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

See the test app for the complete example.

## Options

### image

Assignable angular expression to data-bind to. NgImgCrop gets an image for cropping from it.

### resultImage

Assignable angular expression to data-bind to. NgImgCrop puts a data uri of a cropped image into it.

### changeOnFly

*Optional*. By default, to reduce CPU usage, when a user drags/resizes the crop area, the result image is only updated after the user stops dragging/resizing. Set true to always update the result image as the user drags/resizes the crop area.

### areaType

*Optional*. Type of the crop area. Possible values: circle|square. Default: circle.

### areaDetails

*Optional*. Details of the crop area. An object with properties "x", "y", "size", "image":{"width","height"},"canvas":{"width","height"}}.

### areaMinZize

*Optional*. Min. width/height of the crop area (in pixels). Default: 80.

### resultImageSize

*Optional*. Width/height of the result image (in pixels). Default: 200.

### resultImageFormat

*Optional*. Format of result image. Possible values include image/jpeg, image/png, and image/webp. Browser support varies. Default: image/png.

### resultImageQuality

*Optional*. Quality of result image. Possible values between 0.0 and 1.0 inclusive. Default: browser default.

### onChange

*Optional*. Expression to evaluate upon changing the cropped part of the image. The cropped image data is available as $dataURI.

### onLoadBegin

*Optional*. Expression to evaluate when the source image starts loading.

### onLoadDone

*Optional*. Expression to evaluate when the source image successfully loaded.

### onLoadError

*Optional*. Expression to evaluate when the source image didn't load.

## License

See the [LICENSE](https://github.com/Javarome/ngImgCrop/blob/master/LICENSE) file.

## Build the component

Run `ng build fc-img-crop` to build the (npm) library project. The build artifacts will be stored in the `dist/` directory.

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


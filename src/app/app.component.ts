import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CropAreaDetails} from "./fc-img-crop/fc-img-crop.component";
import {CropAreaType} from "./fc-img-crop/classes/crop-area";

enum Size {
  Small = 'small'
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  enableCrop = true;
  size = Size.Small;
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
  x: number;
  y: number;
  w: any;
  h: any;

  constructor(private ref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    //this.aspectRatio=1.2;
    var handleFileSelect = evt => {
      var file = evt.currentTarget.files[0];
      var reader = new FileReader();
      reader.onload = evt => {
        this.imageDataURI = evt.target.result;
        this.ref.detectChanges();
      };
      reader.readAsDataURL(file);
    };
    document.querySelector('#fileInput').addEventListener('change', handleFileSelect);
  }

  onChange(change) {
    console.log('onChange fired', change);
  }

  onLoadBegin() {
    console.log('onLoadBegin fired');
  }

  onLoadDone() {
    console.log('onLoadDone fired');
  }

  onLoadError() {
    console.log('onLoadError fired');
  }
}

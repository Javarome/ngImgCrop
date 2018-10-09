import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CropAreaDetails} from "./fc-img-crop/fc-img-crop.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  size = 'small';
  type = 'circle';
  imageDataURI = '';
  resImageDataURI = '';
  resImgFormat = 'image/png';
  resImgQuality = 1;
  selMinSize = 100;
  resImgSize = 200;
  enableCrop = true;
  edtImageURI: string;
  changeOnFly: boolean;

  cropDetails: CropAreaDetails;
  x: number;
  y: number;
  w: any;
  h: any;
  newDetailsJSON: string;

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
    console.log('onChange fired');

    if (change) {
      this.resImageDataURI = change.$dataURI;
      console.log('Res image', this.resImageDataURI);
    }
    const newDetails = this.cropDetails;
    if (newDetails && newDetails.image && newDetails.image.width) {
      this.x = newDetails.x - newDetails.size / 2;
      this.y = newDetails.y - newDetails.size / 2;
      this.w = newDetails.size;
      this.h = newDetails.size;
      this.newDetailsJSON = JSON.stringify(newDetails, null, 2);
    }
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

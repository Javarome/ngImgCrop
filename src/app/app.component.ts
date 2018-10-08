import {ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnChanges {
    size: string;
    type: string;
    imageDataURI: string;
    resImageDataURI: string;
    resImgFormat: string;
    resImgQuality: number;
    selMinSize: number;
    resImgSize: number;
    enableCrop = true;
    edtImageURI: string;

    constructor(private ref: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        this.size = 'small';
        this.type = 'circle';
        this.imageDataURI = '';
        this.resImageDataURI = '';
        this.resImgFormat = 'image/png';
        this.resImgQuality = 1;
        this.selMinSize = 100;
        this.resImgSize = 200;
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

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.resImageDataURI) {
            //console.log('Res image', this.resImageDataURI);
        }
    }

    onChange($dataURI) {
        console.log('onChange fired');
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

import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {FormsModule} from "@angular/forms";
import {CropModule} from "./fc-img-crop/fc-img-crop.module";

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}

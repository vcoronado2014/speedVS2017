import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
//paginas
import { HomePage } from '../pages/home/home';
import { vistaDigitalUnoPage } from '../pages/vistaDigitalUno/vistaDigitalUno';
//proveedores
import { Weather } from '../providers/weather';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    vistaDigitalUnoPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    vistaDigitalUnoPage
  ],
  providers: [Weather, {provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}

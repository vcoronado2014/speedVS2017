import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

//paginas
import { vistaDigitalUnoPage } from '../vistaDigitalUno/vistaDigitalUno';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController) {
    
  }
  openSkinUno() {
    this.navCtrl.push(vistaDigitalUnoPage);
  }
  onLink(url: string) {
      window.open(url);
  }
}

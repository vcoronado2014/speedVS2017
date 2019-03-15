import { Component } from '@angular/core';
import { AlertController, LoadingController, NavController, Platform, NavParams } from 'ionic-angular';
//moment
//import * as moment from 'moment';
//home
import { HomePage } from '../home/home';
//nuevos
import { Geolocation, Keyboard } from 'ionic-native';
import { Weather } from '../../providers/weather';

/*
  Generated class for the vistaDigitalUno page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-vistaDigitalUno',
    templateUrl: 'vistaDigitalUno.html'
})
export class vistaDigitalUnoPage {
  degreeStr: string = ' degrees (C)';
  //an empty object (for now) to store our location data passed to the API
  currentLoc: any = {};
  //current weather items array
  c_items: Array<any> = [];
  //variables del clima
  nombreLocalidad: any = "No definida";
  iconoTiempo: any;
  estadoTiempo: any = "Sin Información";
  minMax: any = "Sin Información";
  velocidadViento: any;
  velocidadVientoStr: any = "Sin Información";
  tempActual: any = 0;
  humedad: any = "Sin Info";
  salidaSol: any = "Sin info";
  entradaSol: any = "Sin info";
  fechaActual: any = "";


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertController: AlertController,
    public loadingCtrl: LoadingController,
    public platform: Platform,
    public weather: Weather
  ) { }

    ionViewDidLoad() {
      //Once the main view loads
      //and after the platform is ready...
      this.platform.ready().then(() => {
        //Setup a resume event listener
        document.addEventListener('resume', () => {
          
          //Get the local weather when the app resumes
          this.getLocalWeather();
        });
        //Populate the form with the current location data
        this.getLocalWeather();
      });
    }
    refreshPage() {
      this.showCurrent();
    }
    getLocalWeather() {
      let locOptions = { 'maximumAge': 3000, 'timeout': 5000, 'enableHighAccuracy': true };
      Geolocation.getCurrentPosition(locOptions).then(pos => {
        //Store our location object for later use
        this.currentLoc = { 'lat': pos.coords.latitude, 'long': pos.coords.longitude };
        //and ask for the weather for the current location
        this.showCurrent();
      }).catch(e => {
        console.error('Unable to determine current location');
        if (e) {
          console.log('%s: %s', e.code, e.message);
          console.dir(e);
        }
      })
    }
    showCurrent() {
      //clear out the previous array contents
      this.c_items = [];
      //Create the loading indicator
      let loader = this.loadingCtrl.create({
        content: "Retrieving current conditions..."
      });
      //Show the loading indicator
      loader.present();
      this.weather.getCurrent(this.currentLoc).then(
        data => {
          //Hide the loading indicator
          loader.dismiss();
          //Now, populate the array with data from the weather service
          if (data) {
            //We have data, so lets do something with it
            this.c_items = this.formatWeatherData(data);
          } else {
            //This really should never happen
            console.error('Error retrieving weather data: Data object is empty');
          }
        },
        error => {
          //Hide the loading indicator
          loader.dismiss();
          console.error('Error retrieving weather data');
          console.dir(error);
          this.showAlert(error);
        }
      );
    }
    private formatDate(date) {
      var monthNames = [
        "Enero", "Febrero", "Marzo",
        "Abril", "Mayo", "Junio", "Julio",
        "Agosto", "Septiembre", "Octubre",
        "Noviembre", "Diciembre"
      ];

      var day = date.getDate();
      var monthIndex = date.getMonth();
      var year = date.getFullYear();

      return day + ' de ' + monthNames[monthIndex] + ' del ' + year;
    }
    private camelize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    private formatWeatherData(data): any {
      //fecha actual "MMM DD YYYY"
      var fecha = new Date();
      this.fechaActual = this.formatDate(fecha);
      //this.fechaActual = moment().format("dddd, MMMM Do YYYY");
      //create a blank array to hold our results
      let tmpArray = [];
      //Add the weather data values to the array
      if (data.name) {
        //Location name will only be available for current conditions
        tmpArray.push({ 'name': 'Location', 'value': data.name });
        this.nombreLocalidad = data.name;
      }
      if (data.weather) {
        //tomamos el primero
        var tiempo = data.weather[0];
        this.estadoTiempo = this.camelize(tiempo.description);
        this.iconoTiempo = "http://openweathermap.org/img/w/" + tiempo.icon + ".png";
      }
      if (data.main) {
        this.minMax = 'Min: ' + data.main.temp_min.toFixed() + ' - Max: ' + data.main.temp_max.toFixed();
        var factorVelocidad = 1.60934;
        this.velocidadViento = parseFloat(data.wind.speed) * factorVelocidad;
        this.velocidadVientoStr = this.velocidadViento.toFixed(1) + " Km/Hr";
        this.tempActual = parseInt(data.main.temp);
        this.humedad = data.main.humidity + '%';

      }
      tmpArray.push({ 'name': 'Temperature', 'value': data.main.temp + this.degreeStr });
      tmpArray.push({ 'name': 'Low', 'value': data.main.temp_min + this.degreeStr });
      tmpArray.push({ 'name': 'High', 'value': data.main.temp_max + this.degreeStr });
      tmpArray.push({ 'name': 'Humidity', 'value': data.main.humidity + '%' });
      tmpArray.push({ 'name': 'Pressure', 'value': data.main.pressure + ' hPa' });
      tmpArray.push({ 'name': 'Wind', 'value': data.wind.speed + ' mph' });
      //Do we have visibility data?
      if (data.visibility) {
        tmpArray.push({ 'name': 'Visibility', 'value': data.visibility + ' meters' });
      }
      //do we have sunrise/sunset data?
      if (data.sys.sunrise) {
        var sunriseDate = new Date(data.sys.sunrise * 1000);
        tmpArray.push({ 'name': 'Sunrise', 'value': sunriseDate.toLocaleTimeString() });
        this.salidaSol = sunriseDate.toLocaleTimeString();
      }
      if (data.sys.sunset) {
        var sunsetDate = new Date(data.sys.sunset * 1000);
        tmpArray.push({ 'name': 'Sunset', 'value': sunsetDate.toLocaleTimeString() });
        this.entradaSol = sunsetDate.toLocaleTimeString();
      }
      //Do we have a coordinates object? only if we passed it in on startup
      if (data.coord) {
        //Then grab long and lat
        tmpArray.push({ 'name': 'Latitude', 'value': data.coord.lat });
        tmpArray.push({ 'name': 'Longitude', 'value': data.coord.lon });
      }
      //Return the new array to the calling function
      return tmpArray;
    }
    showAlert(message: string) {
      let alert = this.alertController.create({
        title: 'Error',
        subTitle: 'Source: Weather Service',
        message: message,
        buttons: [{ text: 'Sorry' }]
      });
      alert.present();
    }
    volver() {
      this.navCtrl.setRoot(HomePage);
    }

}

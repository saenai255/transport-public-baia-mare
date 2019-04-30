import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// @ts-ignore
import Hammer from 'hammerjs';
import { DataService } from '../../../../shared/services/data.service';
import { Station } from '../../../../shared/models/station.model';
import { GeoService } from '../../../../shared/services/geo.service';

@Component({
  selector: 'app-stations',
  template: `
  <ion-header>
    <ion-toolbar>
      <ion-title>
        Statii
      </ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content id="stations-content">
    <ion-list lines="full" *ngIf="stations">
      <ion-item [routerLink]="['/tabs/stations/' + station.id]" 
                *ngFor="let station of stations">
        <ion-icon slot="start" color="medium" name="pin"></ion-icon>
        <ion-label>Statia {{ station.name }}</ion-label>
        <ion-text *ngIf="station.distance">{{ station.distance }}</ion-text>
        <ion-icon *ngIf="!station.distance" slot="end" color="medium" name="alert"></ion-icon>
      </ion-item>
    </ion-list>
    <app-loading *ngIf="!stations"></app-loading>
  </ion-content>
`,
  styleUrls: ['stations.page.scss']
})
export class StationsPage implements OnInit, OnDestroy {
  stations: Station[];

  constructor(private router: Router,
              private dataService: DataService,
              private geoService: GeoService
  ) { }

  async ngOnInit() {
    this.handleSwipes();
    this.stations = await this.fetchAndSortStations();

    this.dataService.stationHitsChanged$.asObservable().subscribe(async () => this.stations = await this.fetchAndSortStations());
  }

  ngOnDestroy() {
    console.log('got destroyed');
  }

  private async fetchAndSortStations() {
    let stations = await this.dataService.getStations();
    stations = stations.sort((a, b) => {
      const hits = JSON.parse(localStorage.getItem('stationHits')) || [];

      const hitsA = hits.find(hit => hit.id === a.id) || { id: a.id, value: 0 };
      const hitsB = hits.find(hit => hit.id === b.id) || { id: b.id, value: 0 };

      return hitsB.value - hitsA.value;
    });

    for (const station of stations) {
      await this.geoService.calculateDistance(station);
    }

    return stations;
  }

  private handleSwipes() {
    const hammer = new Hammer(document.querySelector('#stations-content'));
    hammer.on('swiperight', () => {
      console.log('swiperight');

      this.router.navigate(['/tabs/buses']);
    });
  }
}

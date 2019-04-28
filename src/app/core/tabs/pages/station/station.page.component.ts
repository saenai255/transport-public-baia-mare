import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../../shared/services/data.service';
import { take } from 'rxjs/operators';
// @ts-ignore
import Hammer from 'hammerjs';
import { Station } from '../../../../shared/models/station.model';

@Component({
  selector: 'app-bus',
  template: `
      <ion-header *ngIf="station">
        <ion-toolbar>
          <ion-row>
            <ion-title>
              Statia: {{ station.name }}
            </ion-title>

            <ion-button (click)="openMaps()">
              Vezi traseu
            </ion-button>
          </ion-row>
        </ion-toolbar>
      </ion-header>
      
      <ion-content id="station-content">
        <app-loading *ngIf="!station"></app-loading>
        <div *ngIf="station">
          <app-google-maps margin-bottom [coords]="{ x: station.coords._lat, y: station.coords._long }"
                           style="display: block"
          ></app-google-maps>

          <ion-text class="ion-margin-top ion-padding-start">Busurile care trec prin aceasta statie:</ion-text>

          <ion-list lines="full">
            <ion-item [routerLink]="['/tabs/buses/' + bus.id]" *ngFor="let bus of station.buses">
              <ion-icon slot="start" color="medium" name="bus"></ion-icon>
              <ion-label>Linia {{ bus.line }}</ion-label>
              <ion-text>{{ bus.arrivesIn }}</ion-text>
            </ion-item>
          </ion-list>
        </div>
      </ion-content>
  `,
  styleUrls: ['./station.page.component.scss'],
})
export class StationPageComponent implements OnInit, OnDestroy {
  station: Station;
  private refreshId: number;

  constructor(private route: ActivatedRoute,
              private dataService: DataService,
              private router: Router) { }

  async ngOnInit() {
    this.station = (await this.getStation()) || this.station;
    this.handleSwipes();

    this.refreshId = setInterval(() => {
      this.getStation().then(station => this.station = station ? station : this.station);

    }, 1000 * 15);

    this.incrementHits();
  }

  openMaps() {
    // tslint:disable-next-line:max-line-length
    window.location.href = `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${this.station.coords._lat},${this.station.coords._long}&travelmode=walking`;
  }

  private incrementHits() {
    let hits: { id: number, value: number }[] = JSON.parse(localStorage.getItem('stationHits'));

    if (!hits) {
      hits = [];
    }

    let stationHits = hits.find(hit => hit.id === this.station.id);
    if (!stationHits) {
      stationHits = { id: this.station.id, value: 0 };
      hits.push(stationHits);
    }

    stationHits.value++;

    localStorage.setItem('stationHits', JSON.stringify(hits));

    this.dataService.stationHitsChanged$.next();
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshId);
  }

  getStation() {
    let id = null;
    this.route.params.pipe(take(1)).subscribe(params => id = +params.id);
    return this.dataService.getStation(id);
  }

  private handleSwipes() {
    const hammer = new Hammer(document.querySelector('#station-content'));
    hammer.on('swipeup', () => {
      console.log('swipeup');
    });
  }


}

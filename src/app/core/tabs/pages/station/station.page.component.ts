import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../../../shared/services/data.service';
import { take } from 'rxjs/operators';
import { Station } from '../../../../shared/models/station.model';
import { Bus } from '../../../../shared/models/bus.model';

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
        <app-loading *ngIf="!station || !buses"></app-loading>
        <div *ngIf="station && buses">
          <app-google-maps margin-bottom [coords]="{ x: station.latitude, y: station.longitude }"
                           style="display: block"
          ></app-google-maps>

          <ion-text class="ion-margin-top ion-padding-start">Busurile care trec prin aceasta statie:</ion-text>

          <ion-list lines="full">
            <ion-item [routerLink]="['/tabs/buses/' + bus.id]" *ngFor="let bus of buses">
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
  buses: Bus[];

  private refreshId: number;

  constructor(private route: ActivatedRoute,
              private dataService: DataService) { }

  async ngOnInit() {
    this.station = (await this.getStation()) || this.station;
    this.buses = await this.getBuses();

    this.refreshId = setInterval(async () => this.buses = await this.getBuses(), 1000 * 60);

    this.incrementHits();
  }

  openMaps() {
    // tslint:disable-next-line:max-line-length
    window.location.href = `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${this.station.latitude},${this.station.longitude}&travelmode=walking`;
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

  async getBuses() {
    const buses = await this.dataService.getStationBuses(this.station.id);
    buses.forEach(bus => bus.arrivesIn = this.dataService.getRemainingTime(bus, this.station));
    return buses;
  }

  getStation() {
    let id = null;
    this.route.params.pipe(take(1)).subscribe(params => id = +params.id);
    return this.dataService.getStation(id);
  }
}

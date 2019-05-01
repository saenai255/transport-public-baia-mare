import { Component, OnDestroy, OnInit } from '@angular/core';
import { Bus } from '../../../../shared/models/bus.model';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../../../shared/services/data.service';
import { take } from 'rxjs/operators';
import { Station } from '../../../../shared/models/station.model';

@Component({
  selector: 'app-bus',
  template: `
      <ion-header *ngIf="bus">
        <ion-toolbar>
          <ion-title>
            Linia: {{ bus.line }}
          </ion-title>
        </ion-toolbar>
      </ion-header>
        
      <ion-content id="bus-content">
        <app-loading *ngIf="!bus || !stations"></app-loading>

        <ion-list *ngIf="bus && stations">
          <ion-item *ngFor="let station of stations" 
                    lines="full"
                    [routerLink]="['/tabs/stations/' + station.id]">
            <ion-icon slot="start" color="medium" name="pin"></ion-icon>
            <ion-label>{{ station.name }}</ion-label>
            <ion-text>{{ station.arrivesIn }}</ion-text>
          </ion-item>
        </ion-list>
      </ion-content>
  `,
  styleUrls: ['./bus.page.component.scss'],
})
export class BusPageComponent implements OnInit, OnDestroy {
  bus: Bus;
  stations: Station[];

  private refreshId: number;

  constructor(private route: ActivatedRoute,
              private dataService: DataService
  ) { }

  ngOnInit() {
    (async () => {
      this.bus = (await this.getBus()) || this.bus;
      this.stations = await this.getStations();
      this.incrementHits();
    })();
    setInterval(async () => this.stations = await this.getStations(), 60 * 1000);
  }

  private incrementHits() {
    let hits: { id: number, value: number }[] = JSON.parse(localStorage.getItem('busHits'));

    if (!hits) {
      hits = [];
    }

    let busHits = hits.find(hit => hit.id === this.bus.id);
    if (!busHits) {
      busHits = { id: this.bus.id, value: 0 };
      hits.push(busHits);
    }

    busHits.value++;

    localStorage.setItem('busHits', JSON.stringify(hits));

    this.dataService.busHitsChanged$.next();
  }

  getBus() {
    let id = null;
    this.route.params.pipe(take(1)).subscribe(params => id = +params.id);
    return this.dataService.getBus(id);
  }

  async getStations() {
    const stations = await this.dataService.getBusStations(this.bus.id);
    stations.forEach(station => station.arrivesIn = this.dataService.getRemainingTime(this.bus, station));
    return stations;
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshId);
  }
}

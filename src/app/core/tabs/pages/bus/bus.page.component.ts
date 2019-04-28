import { Component, OnInit } from '@angular/core';
import { Bus } from '../../../../shared/models/bus.model';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../../shared/services/data.service';
import { take } from 'rxjs/operators';
// @ts-ignore
import Hammer from 'hammerjs';

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
        <app-loading *ngIf="!bus"></app-loading>

        <ion-list *ngIf="bus">
          <ion-item *ngFor="let station of bus.stations" 
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
export class BusPageComponent implements OnInit {
  bus: Bus;

  constructor(private route: ActivatedRoute,
              private dataService: DataService,
              private router: Router) { }

  async ngOnInit() {
    this.bus = (await this.getBus()) || this.bus;
    this.handleSwipes();
    this.incrementHits();
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

  private handleSwipes() {
    const hammer = new Hammer(document.querySelector('#bus-content'));
    hammer.on('swipeup', () => {
      console.log('swipeup');

      // this.router.navigate(['/tabs/stations']);
    });
  }

}

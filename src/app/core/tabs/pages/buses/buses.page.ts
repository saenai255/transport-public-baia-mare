import { Component, OnInit } from '@angular/core';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
// @ts-ignore
import Hammer from 'hammerjs';
import { Router } from '@angular/router';
import { DataService } from '../../../../shared/services/data.service';
import { Bus } from '../../../../shared/models/bus.model';
import { throttleTime } from 'rxjs/operators';

@Component({
    selector: 'app-buses',
    template: `
    <ion-header *ngIf="buses">
      <ion-toolbar>
        <ion-title>
          Mijloace de Transport
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content id="buses-content">
        <ion-list lines="full" *ngIf="buses">
          <ion-item [routerLink]="['/tabs/buses/' + bus.id]" *ngFor="let bus of buses">
            <ion-icon slot="start" color="medium" name="bus"></ion-icon>
            <ion-label>Linia {{ bus.line }}</ion-label>
          </ion-item>
        </ion-list>

        <app-loading *ngIf="!buses"></app-loading>
    </ion-content>
  `,
    styleUrls: ['buses.page.scss']
})
export class BusesPage implements OnInit {
    buses: Bus[];

    constructor(private router: Router,
                private dataService: DataService,
                private fb: Facebook
    ) { }

    fbLogin() {
        this.fb.login(['public_profile', 'email'])
            .then((res: FacebookLoginResponse) => console.log('Logged into Facebook!', res))
            .catch(e => console.log('Error logging into Facebook', e));


        this.fb.logEvent(this.fb.EVENTS.EVENT_NAME_ADDED_TO_CART);
    }

    ngOnInit() {
        // this.fbLogin();
        this.handleSwipes();
        this.fetchAndSortBuses().then(result => this.buses = result);
        this.dataService.busHitsChanged$.asObservable().pipe(
            throttleTime(3 * 60 * 1000)
        ).subscribe(async () => this.buses = await this.fetchAndSortBuses());
    }

    private async fetchAndSortBuses() {
        let buses = await this.dataService.getBuses();
        buses = buses.sort((a, b) => {
            const hits = JSON.parse(localStorage.getItem('busHits')) || [];

            const hitsA = hits.find(hit => hit.id === a.id) || { id: a.id, value: 0 };
            const hitsB = hits.find(hit => hit.id === b.id) || { id: b.id, value: 0 };

            return hitsB.value - hitsA.value;
        });

        return buses;
    }

    private handleSwipes() {
        const hammer = new Hammer(document.querySelector('#buses-content'));
        hammer.on('swipeleft', () => {
            console.log('swipeleft');

            this.router.navigate(['/tabs/stations']);
        });
    }
}

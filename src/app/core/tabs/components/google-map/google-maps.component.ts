import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { google } from 'google-maps';

@Component({
    selector: 'app-google-maps',
    template: `
      <div id="map_canvas" style="height: 30vh"></div>
    `,
    styleUrls: ['./google-maps.component.scss'],
})
export class GoogleMapsComponent implements OnInit, OnDestroy {
    @Input() coords: { x: number, y: number};
    intervalId: number;

    map: any;

    constructor(private platform: Platform) { }

    async ngOnInit() {
        console.log('load map');
        await this.loadMap();

        this.intervalId = setInterval(async () => {
            if (document.querySelector('#map_canvas').children.length !== 0) {
                return;
            }

            console.log('reload map');
            await this.loadMap();
        }, 10);
    }

    ngOnDestroy(): void {
        clearInterval(this.intervalId);
    }

    loadMap() {
        const coords = new google.maps.LatLng(this.coords.x, this.coords.y);

        const mapOptions: google.maps.MapOptions = {
            center: coords,
            zoom: 18,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            streetViewControl: false,
            disableDefaultUI: true
        };

        this.map = new google.maps.Map(document.querySelector('#map_canvas'), mapOptions);

        const marker: google.maps.Marker = new google.maps.Marker({
            map: this.map,
            position: coords
        });
    }
}

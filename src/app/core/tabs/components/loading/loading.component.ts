import { Component, Input, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { google } from 'google-maps';

@Component({
    selector: 'app-loading',
    template: `
        <div class="loading">Loading&#8230;</div>
    `,
    styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnInit {
    @Input() coords: { x: number, y: number};

    map: any;

    constructor() { }

    async ngOnInit() {
    }
}

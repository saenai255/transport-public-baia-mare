import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PartialStation } from '../models/station.model';

@Injectable()
export class GeoService {
    constructor(private http: HttpClient) { }

    public async getLocation(): Promise<{ lat: number, lon: number, timestamp: number }> {
        const location: { lat: number, lon: number, timestamp: number } = JSON.parse(localStorage.getItem('location'));

        if (location && (new Date().getTime() - location.timestamp) / 1000 < 15) {
            return location;
        }

        const result = (await this.http.get('http://ip-api.com/json/').toPromise()) as { lat: number, lon: number };
        const out = { lat: result.lat, lon: result.lon, timestamp: new Date().getTime() };

        localStorage.setItem('location', JSON.stringify(out));
        return out;
    }

    public async calculateDistance(station: PartialStation) {
        const currentLocation = await this.getLocation();
        const request = new google.maps.DistanceMatrixService();
        const pendingResult = new Promise((resolve) => {
            request.getDistanceMatrix({
                origins: [ { lat: currentLocation.lat, lng: currentLocation.lon } ],
                destinations: [ { lat: station.coords._lat, lng: station.coords._long } ],
                unitSystem: google.maps.UnitSystem.METRIC,
                travelMode: google.maps.TravelMode.WALKING,
            }, data => resolve(data));
        });

        try {
            const result = (await pendingResult) as { rows: { elements: { distance: { text: string, value: number } }[] }[] };
            station.distance = result.rows[0].elements[0].distance.text;
        } catch (e) {
            station.distance = '';
        }

    }
}

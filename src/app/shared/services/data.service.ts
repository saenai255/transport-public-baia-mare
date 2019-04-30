import { Injectable } from '@angular/core';
import { Bus, BusStop } from '../models/bus.model';
import { Station } from '../models/station.model';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public readonly stationHitsChanged$ = new Subject();
  public readonly busHitsChanged$ = new Subject();

  constructor(private httpClient: HttpClient
  ) { }

  public async getStations(): Promise<Station[]> {
    return this.httpClient.get<Station[]>(environment.serverUrl + '/stations').toPromise();
  }

  public async getBuses(): Promise<Bus[]> {
    return this.httpClient.get<Bus[]>(environment.serverUrl + '/buses').toPromise();

  }

  public async getBus(id: number): Promise<Bus> {
    if (id === null) {
      return null;
    }

    return this.httpClient.get<Bus>(environment.serverUrl + '/buses/' + id).toPromise();
  }

  public async getStation(id: number): Promise<Station> {
    if (id === null) {
      return null;
    }

    return this.httpClient.get<Station>(environment.serverUrl + '/stations/' + id).toPromise();
  }

  public async getStationBuses(id): Promise<Bus[]> {
    if (id === null) {
      return null;
    }

    return this.httpClient.get<Bus[]>(environment.serverUrl + '/stations/' + id + '/buses').toPromise();
  }

  public async getBusStations(id): Promise<Station[]> {
    if (id === null) {
      return null;
    }

    return this.httpClient.get<Station[]>(environment.serverUrl + '/buses/' + id + '/stations').toPromise();
  }

  public getRemainingTime(bus: Bus, station: Station): string {
    let stops: BusStop[] = station.stops;

    const addDays = (date: Date, days: number): Date => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    if (new Date().getDay() - 2 >= 4) {
      stops = bus.stops.filter(stop => !stop.workingDay);
    } else {
      stops = bus.stops.filter(stop => stop.workingDay);
    }

    const currentDate = new Date();
    const dateOfNextStop = (stop: BusStop, extraDays = 0): Date => {
      const stopDate = new Date();
      const oldDate = new Date(stop.time);
      stopDate.setHours(oldDate.getHours(), oldDate.getMinutes());

      return addDays(stopDate, extraDays);
    };

    const allStops = stops.filter(stop => currentDate < dateOfNextStop(stop));

    if (stops.length === 0) {
      stops = allStops.filter(stop => currentDate < dateOfNextStop(stop, 1));
    }

    if (stops.length === 0) {
      return '??';
    }
    const getFastest = (busStops: BusStop[]) => {
      let min = busStops[0];

      for (const stop of busStops) {
        if (dateOfNextStop(min) > dateOfNextStop(stop)) {
          min = stop;
        }
      }

      return min;
    };

    let fastest = dateOfNextStop(getFastest(stops));
    while (fastest < currentDate) {
      fastest = dateOfNextStop(getFastest(stops), 1);
    }

    let minutes: any = (fastest.getTime() - currentDate.getTime()) / 1000 / 60 % 60;
    minutes = Math.ceil(minutes);
    if (minutes === 0) {
      minutes = null;
    } else {
      minutes += 'min';
    }

    let hours: any = (fastest.getTime() - currentDate.getTime()) / 1000 / 60 / 60;
    hours = Math.floor(hours);
    if (hours === 0) {
      hours = null;
    } else {
      hours += 'h';
    }

    return `${hours ? hours : ''} ${minutes ? minutes : ''}`;
  }
}

import { Injectable } from '@angular/core';
import { Bus, BusStop, STOP_TYPES } from '../models/bus.model';
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

  public async getStops(): Promise<BusStop[]> {
    return this.httpClient.get<BusStop[]>(environment.serverUrl + '/stops').toPromise();
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

  public async getRemainingTime({ id: busId }: Bus, { id: stationId }: Station): Promise<string> {
    const [ bus, station ] = await Promise.all([this.getBus(busId), this.getStation(stationId)]);

    const [stationStops, busStops] = await Promise.all([
      (async () => {
        return (await this.getStops()).filter(stop =>
            station.stops.map(it => it.id).includes(stop.id));
      })(),
      (async () => {
        return (await this.getStops()).filter(stop =>
            bus.stops.map(it => it.id).includes(stop.id));
      })()
    ]);

    bus.stops = busStops;
    station.stops = stationStops;


    const filterStopsForToday = (input: BusStop[], plusDays = 0) => {
      const today = new Date();
      today.setDate(today.getDate() + plusDays);

      const day = today.getDay();

      if (day === 7) {
        return input.filter(stop => stop.type - STOP_TYPES.SUNDAY >= 0);
      } else if (day === 6) {
        return input.filter(stop => stop.type - STOP_TYPES.SATURDAY >= 0);
      }

      return input.filter(stop => stop.type - STOP_TYPES.WEEK >= 0);
    };

    let stops = filterStopsForToday(station.stops);
    stops = stops.filter(stop => bus.stops.map(item => item.bus.id).includes(stop.bus.id));

    const isInFuture = (stop: BusStop): boolean => {
      const currentDate = new Date();
      const currentTime = { hour: currentDate.getHours(), minute: currentDate.getMinutes() };

      return currentTime.hour * 60 + currentTime.minute < stop.hour * 60 + stop.minute;
    };

    const getQuickest = (stop1: BusStop, stop2: BusStop) => {
      return stop1.hour * 60 + stop1.minute <= stop2.hour * 60 + stop2.minute ? stop1 : stop2;
    };

    stops = stops.filter(stop => isInFuture(stop));

    let notToday = false;
    stops = ((allStops) => {
      let out = allStops;

      let extraDay = 1;
      while (allStops.length === 0 && extraDay < 7) {
        out = filterStopsForToday(station.stops, extraDay);
        extraDay++;
      }

      notToday = extraDay !== 1;
      return out;
    })(stops);


    if (stops.length === 0) {
      return '??';
    }

    const nextStop = stops.reduce((stop1, stop2) => getQuickest(stop1, stop2));

    if (notToday) {
      return `la ${nextStop.hour}:${nextStop.minute}`;
    }

    const fastest = new Date();
    fastest.setHours(nextStop.hour);
    fastest.setMinutes(nextStop.minute);

    return (function parseDateToDuration(date: Date) {
      const currentDate = new Date();

      let minutes: any = (date.getTime() - currentDate.getTime()) / 1000 / 60 % 60;
      minutes = Math.ceil(minutes);
      if (minutes === 0) {
        minutes = null;
      } else {
        minutes += 'm';
      }

      let hours: any = (date.getTime() - currentDate.getTime()) / 1000 / 60 / 60;
      hours = Math.floor(hours);
      if (hours === 0) {
        hours = null;
      } else {
        hours += 'h';
      }

      return `in ${hours ? hours : ''} ${minutes ? minutes : ''}`;
    })(fastest);
  }
}

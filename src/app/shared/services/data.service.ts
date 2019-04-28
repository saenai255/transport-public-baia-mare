import { Injectable } from '@angular/core';
import { Bus, BusStop, PartialBus } from '../models/bus.model';
import { PartialStation, Station } from '../models/station.model';
import * as CircularJSON from 'circular-json';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public readonly stationHitsChanged$ = new Subject();
  public readonly busHitsChanged$ = new Subject();

  private buses: Bus[] = null;
  private stations: Station[] = null;

  get firestore() {
    return ((window as any).firebase.firestore as () => firebase.firestore.Firestore);
  }

  private async prepareStation(stationDoc) {
    let result: any;

    if (stationDoc.get) {
      const res = await stationDoc.get();
      result = { ...res.data(), id: +res.id };
    } else {
      result = { ...stationDoc, id: +stationDoc.id };
    }

    for (let i = 0; i < result.buses.length; i++) {
      if (result.buses[i].get) {
        const busDoc = await result.buses[i].get();
        result.buses[i] = { ...busDoc.data(), id: +busDoc.id };
      }
    }

    return result;
  }

  private async prepareStations(stationDocs) {
    const results = stationDocs.docs.map(doc => ({ ...doc.data(), id: +doc.id }));

    for (let i = 0; i < results.length; i++) {
      results[i] = await this.prepareStation(results[i]);
    }

    return results;
  }

  private async fetchStations(): Promise<Station[]> {
    let results: any = await this.firestore().collection('stations').get();
    results = this.prepareStations(results);

    return results as Station[];
  }

  private async prepareBus(busDoc) {
    const result = busDoc;

    for (let i = 0; i < result.week.length; i++) {
      const stationDoc = await result.week[i].station.get();
      result.week[i].station = { ...stationDoc.data(), id: +stationDoc.id };
    }

    for (let i = 0; i < result.weekend.length; i++) {
      const stationDoc = await result.weekend[i].station.get();
      result.weekend[i].station = { ...stationDoc.data(), id: +stationDoc.id };
    }

    for (let i = 0; i < result.stations.length; i++) {
      const stationDoc = await result.stations[i].get();
      result.stations[i] = { ...stationDoc.data(), id: +stationDoc.id };
    }

    return result;
  }

  private async prepareBuses(busDocs) {
    const results = busDocs.docs.map(doc => ({ ...doc.data(), id: +doc.id }));

    for (let i = 0; i < results.length; i++) {
      results[i] = await this.prepareBus(results[i]);
    }

    return results;
  }

  private async fetchBuses(): Promise<Bus[]> {
    let results: any = await this.firestore().collection('buses').get();
    results = await this.prepareBuses(results);

    return results as Bus[];
  }

  public async getStations(): Promise<Station[]> {
    const stationFetchDate = new Date(JSON.parse(localStorage.getItem('stationFetchDate')) || 0);
    if (stationFetchDate.getDate() + 7 < new Date().getDate() || stationFetchDate.getMonth() < new Date().getMonth()) {
      console.log('cleared stations cache');
      localStorage.removeItem('stations');
    }

    const storedStations = CircularJSON.parse(localStorage.getItem('stations'));

    if (!this.stations) {
      if (storedStations) {
        this.stations = storedStations;
        console.log('loaded stations from cache');
      } else {
        this.stations = await this.fetchStations();

        localStorage.setItem('stationFetchDate', new Date().getTime() + '');
        localStorage.setItem('stations', CircularJSON.stringify(this.stations));
        console.log('fetched stations');
      }
    }
    return this.stations as Station[];
  }

  public async getBus(id: number): Promise<Bus> {
    if (id === null) {
      return null;
    }

    const buses = await this.getBuses();
    const out = buses.find(bus => bus.id === id);
    const stations = (await this.getStations()).filter(station =>
        out.stations.map(item => item.id).includes(station.id));

    for (const station of stations) {
      station.arrivesIn = await this.getRemainingTime(out, station);
    }

    out.stations = stations;

    return out;
  }

  public async getStation(id: number): Promise<Station> {
    if (id === null) {
      return null;
    }

    const out = (await this.getStations()).find(station => station.id === id);
    const buses = (await this.getBuses()).filter(bus =>
        out.buses.map(item => item.id).includes(bus.id));

    for (const bus of buses) {
      bus.arrivesIn = await this.getRemainingTime(bus, out);
    }

    out.buses = buses;

    return out;
  }

  public async getBuses(): Promise<Bus[]> {
    const busFetchDate = new Date(JSON.parse(localStorage.getItem('busFetchDate')) || 0);
    if (busFetchDate.getDate() + 7 < new Date().getDate() || busFetchDate.getMonth() < new Date().getMonth()) {
      console.log('cleared buses cache');
      localStorage.removeItem('buses');
    }

    const storedBuses = CircularJSON.parse(localStorage.getItem('buses'));

    if (!this.buses) {
      if (storedBuses) {
        this.buses = storedBuses;
        console.log('loaded buses from cache');
      } else {
        this.buses = await this.fetchBuses();

        localStorage.setItem('busFetchDate', new Date().getTime() + '');
        localStorage.setItem('buses', CircularJSON.stringify(this.buses));
        console.log('fetched buses');
      }
    }

    return this.buses as Bus[];
  }

  private async getRemainingTime(bus: PartialBus, station: PartialStation): Promise<string> {
    let stops: BusStop[] | any;

    const addDays = (date: Date, days: number): Date => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    if (new Date().getDay() - 2 >= 4) {
      stops = bus.weekend;
    } else {
      stops = bus.week;
    }

    for (const stop of stops) {
      stop.station = await this.prepareStation(stop.station);
    }

    const currentDate = new Date();
    const timeToDate = (stop: BusStop, extraDays = 0): Date => {
      const stopDate = new Date();
      stopDate.setHours(stop.hour, stop.minute);

      return addDays(stopDate, extraDays);
    };

    const allStops = stops.filter((stop: BusStop) => stop.station.id === station.id);
    stops = allStops.filter(stop => currentDate < timeToDate(stop));

    if (stops.length === 0) {
      stops = allStops.filter(stop => currentDate < timeToDate(stop, 1));
    }

    if (stops.length === 0) {
      return '??';
    }

    // @ts-ignore
    // stops = [ ...new Set(stops) ];

    const getFastest = (busStops: BusStop[]) => {
      let min = busStops[0];

      for (const stop of busStops) {
        if (timeToDate(min) > timeToDate(stop)) {
          min = stop;
        }
      }

      return min;
    };

    let fastest = timeToDate(getFastest(stops));
    while (fastest < currentDate) {
      fastest = timeToDate(getFastest(stops), 1);
    }

    let minutes: any = (fastest.getTime() - currentDate.getTime()) / 1000 / 60 % 60;
    minutes = Math.ceil(minutes);
    if (minutes === 1) {
      minutes = 'un minut';
    } else if (minutes === 0) {
      minutes = null;
    } else {
      minutes += ' minute';
    }

    let hours: any = (fastest.getTime() - currentDate.getTime()) / 1000 / 60 / 60 % 24;
    hours = Math.floor(hours);
    if (hours === 1) {
      hours = 'o ora';
    } else if (hours === 0) {
      hours = null;
    } else if (hours < 20) {
      hours += ' ore';
    } else {
      hours += ' de ore';
    }

    if (minutes !== null && hours !== null) {
      hours += ' si ';
    }

    return `${hours ? hours : ''}${minutes ? minutes : ''}`;
  }
}

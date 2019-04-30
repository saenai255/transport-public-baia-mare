import { BusStop } from './bus.model';

export interface Station {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    stops?: BusStop[];

    // transient
    arrivesIn?: string;
    distance?: string;
}

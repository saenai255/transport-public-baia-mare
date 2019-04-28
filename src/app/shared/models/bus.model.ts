import { PartialStation, Station } from './station.model';
import * as firebase from 'firebase';

export interface PartialBus {
    id: number;
    line: string;
    week: BusStop[];
    weekend: BusStop[];
    arrivesIn?: string;
}

export interface BusStop {
    hour: number;
    minute: number;
    station: PartialStation;
}

export interface Bus extends PartialBus {
    stations: PartialStation[];
}

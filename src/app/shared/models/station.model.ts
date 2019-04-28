import { Bus, PartialBus } from './bus.model';
import * as firebase from 'firebase';

export interface PartialStation {
    id: number;
    name: string;
    coords: { latitude: number, longitude: number };
    arrivesIn?: string;
}

export interface Station extends PartialStation {
    buses: PartialBus[];
}

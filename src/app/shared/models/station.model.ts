import { PartialBus } from './bus.model';

export interface PartialStation {
    id: number;
    name: string;
    coords: { _lat: number, _long: number };
    arrivesIn?: string;
    distance?: string;
}

export interface Station extends PartialStation {
    buses: PartialBus[];
}

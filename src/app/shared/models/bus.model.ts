import { Station } from './station.model';

export interface Bus {
    id: number;
    line: string;
    stops?: BusStop[];

    // transient
    arrivesIn?: string;
}

export type StopType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export const STOP_TYPES = {
    NONE: 0 as StopType,

    WEEK: 1 as StopType,
    SATURDAY: 2 as StopType,
    SUNDAY: 4 as StopType,

    WEEK_SATURDAY: 3 as StopType,
    WEEK_SUNDAY: 5 as StopType,
    WEEK_SATURDAY_SUNDAY: 7 as StopType,

    SATURDAY_SUNDAY: 6 as StopType,
};

export interface BusStop {
    id?: number;
    station: Station;
    bus: Bus;
    type: StopType;
    hour: number;
    minute: number;
    priority: number;
}

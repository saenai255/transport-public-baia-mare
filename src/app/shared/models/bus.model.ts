export interface Bus {
    id: number;
    line: string;
    stops?: BusStop[];

    // transient
    arrivesIn?: string;
}

export interface BusStop {
    time: Date | string;
    workingDay: boolean;
}

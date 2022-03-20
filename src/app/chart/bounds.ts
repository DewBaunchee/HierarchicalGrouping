import {Interval} from "./interval";

export interface Bounds {
    readonly x: Interval;
    readonly y: Interval;
}

export const zeroBounds: Bounds = {x: {from: 0, to: 0}, y: {from: 0, to: 0}};

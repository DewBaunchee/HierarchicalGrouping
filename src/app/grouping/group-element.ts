import {Mapper, HierarchyNode} from "./hierarchyNode";

export type Distance = { readonly distance: number; readonly element: HierarchyNode }

export class GroupElement implements HierarchyNode {

    readonly height: number = 0;

    public readonly distances: Map<string, Distance> = new Map<string, Distance>()

    constructor(public readonly id: string) {
    }

    public getClosest(id: string): number {
        return this.distances.get(id).distance;
    }

    public getIds(): string[] {
        return [this.id];
    }

    public map<R>(mapper: Mapper<R>): R {
        return mapper(this, undefined, undefined);
    }
}


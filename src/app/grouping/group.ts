import {Mapper, HierarchyNode} from "./hierarchyNode";

export class Group implements HierarchyNode {

    constructor(public readonly id: string,
                public readonly height: number,
                public readonly first: HierarchyNode,
                public readonly second: HierarchyNode) {
    }

    public getClosest(id: string): number {
        return Math.min(this.first.getClosest(id), this.second.getClosest(id));
    }

    public getIds(): string[] {
        return [...this.first.getIds(), ...this.second.getIds()];
    }

    public map<R>(mapper: Mapper<R>): R {
        return mapper(this, this.first.map(mapper), this.second.map(mapper));
    }
}

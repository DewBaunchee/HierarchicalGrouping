export type Mapper<R> = (current: HierarchyNode, first: R, second: R) => R;

export interface HierarchyNode {

    readonly id: string;

    readonly height: number;

    getIds(): string[];

    getClosest(id: string): number;

    map<R>(mapper: Mapper<R>): R;

}

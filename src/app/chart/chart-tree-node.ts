import {Coordinates} from "./point";

export type Iterator = (current: ChartTreeNode, left: ChartTreeNode, right: ChartTreeNode) => void;

export class ChartTreeNode {

    constructor(public readonly name: string,
                public readonly point: Coordinates,
                private readonly left: ChartTreeNode,
                private readonly right: ChartTreeNode) {
    }

    public iterate(iterator: Iterator) {
        iterator(this, this.left, this.right);
        this.left?.iterate(iterator);
        this.right?.iterate(iterator);
    }
}

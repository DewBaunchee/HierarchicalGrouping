import {Group} from "./group";
import {GroupElement} from "./group-element";
import {HierarchyNode} from "./hierarchyNode";
import {IdGenerator} from "./id-generator";

export class Grouper {

    public group(distances: number[][]): Group {
        const idGenerator: IdGenerator = new IdGenerator();
        let nodes: HierarchyNode[] = getNodes(distances);
        if (nodes.length < 2) throw new Error("Need at least two elements!");

        while (nodes.length > 1) {
            let firstIndex: number;
            let secondIndex: number;
            let minDistance: number = Infinity;

            for (let i = 0; i < nodes.length; i++) {
                const node: HierarchyNode = nodes[i];
                for (let j = 0; j < nodes.length; j++) {
                    if (i === j) continue;
                    node.getIds().forEach((id: string) => {
                        const closest: number = nodes[j].getClosest(id);
                        if (closest < minDistance) {
                            firstIndex = i;
                            secondIndex = j;
                            minDistance = closest;
                        }
                    })
                }
            }

            const group: Group = new Group(idGenerator.next(), minDistance, nodes[firstIndex], nodes[secondIndex]);
            nodes.splice(Math.max(firstIndex, secondIndex), 1);
            nodes.splice(Math.min(firstIndex, secondIndex), 1);
            nodes.push(group);
        }

        return nodes[0] as Group;
    }
}

function getNodes(distances: number[][]): GroupElement[] {
    const nodes: Map<number, GroupElement> = new Map<number, GroupElement>();
    for (let i = 0; i < distances.length; i++) {
        nodes.set(i, new GroupElement(`x${i + 1}`));
    }
    for (let i = 0; i < distances.length; i++) {
        for (let j = 0; j < distances.length; j++) {
            if (i === j) continue;
            nodes.get(i).distances.set(`x${j + 1}`, {distance: distances[i][j], element: nodes.get(j)});
        }
    }
    return Array.from(nodes.values());
}


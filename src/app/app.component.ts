import {Component, ElementRef, OnInit} from "@angular/core";
import {ChartControl} from "./chart/control";
import {Grouper} from "./grouping/grouper";
import {Group} from "./grouping/group";
import {ChartTreeNode} from "./chart/chart-tree-node";
import {HierarchyNode} from "./grouping/hierarchyNode";

function equals(previousDomRect: DOMRect, domRect: DOMRect) {
    if (!previousDomRect) return false;
    return previousDomRect.width === domRect.width && previousDomRect.height === domRect.height;
}

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {

    public n: number = 3;

    public distances: number[][];

    private readonly element: Element;

    private readonly chartControl: ChartControl = new ChartControl();

    private readonly grouper: Grouper = new Grouper();

    private previousDomRect: DOMRect;

    constructor(private elementRef: ElementRef) {
        this.element = elementRef.nativeElement;
    }

    public ngOnInit() {
        this.createMatrix();
        const timeout = () => setTimeout(() => {
            checker = timeout();
            const domRect: DOMRect = this.element.getBoundingClientRect();
            if (domRect.width === 0 || domRect.height === 0 || equals(this.previousDomRect, domRect)) return;
            this.previousDomRect = domRect;
            this.chartControl.resize(this.element);
        }, 100);
        let checker: number = timeout();
    }

    public createMatrix() {
        this.distances = new Array(this.n);
        for (let i = 0; i < this.n; i++) {
            this.distances[i] = new Array(this.n);
        }
        this.generate();
    }

    public generate() {
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < i + 1; j++) {
                if (i === j) {
                    this.distances[i][j] = 0;
                    continue;
                }
                this.distances[i][j] = this.distances[j][i] = generateNumber(1, 10);
            }
        }
        this.display();
    }

    public display() {
        const step: number = 0.1;
        const root: Group = this.grouper.group(this.distances);
        this.chartControl.setMaxY(root.height * 1.1);

        let mostRight: number = -Infinity;

        let leafCounter: number = 0;
        this.chartControl.draw(root.map(
            (current: HierarchyNode, first: ChartTreeNode, second: ChartTreeNode) => {
                let left: ChartTreeNode;
                let right: ChartTreeNode;
                if(first && first.point.x > second.point.x) {
                    left = second;
                    right = first;
                } else {
                    left = first;
                    right = second;
                }
                if(right && right.point.x > mostRight) mostRight = right.point.x;
                return new ChartTreeNode(
                    current.id,
                    {
                        y: current.height,
                        x: left ? (right.point.x - left.point.x) / 2 + left.point.x : (leafCounter += 2) * step
                    },
                     left,
                    right
                );
            }
        ));
        this.chartControl.setMaxX(mostRight + step);
    }
}

function generateNumber(min: number, max: number): number {
    return Number((Math.random() * (max - min) + min).toFixed(1));
}

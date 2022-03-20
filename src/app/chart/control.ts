import * as d3 from "d3";
import {BaseType, Line, Selection} from "d3";
import {ChartOptions} from "./chart-options";
import {Bounds} from "./bounds";
import {Scales} from "./scales";
import {Axes} from "./axes";
import {combineLatest, ReplaySubject} from "rxjs";
import {Rectangle} from "./Rectangle";
import {Coordinates, Point} from "./point";
import {ChartTreeNode} from "./chart-tree-node";

const leftMargin: number = 50;

export class ChartControl {

    private drawChartRequests: ReplaySubject<ChartTreeNode> = new ReplaySubject<ChartTreeNode>();

    private drawPointRequests: ReplaySubject<Point> = new ReplaySubject<Point>();

    private initialized: boolean = false;

    private readonly chartOptions: ChartOptions = new ChartOptions();

    private drawnChart: Selection<SVGGElement, unknown, BaseType, unknown>;

    public resize(element: Element) {
        if (!this.initialized) {
            this.initialize(element);
            return;
        }
        this.chartOptions.svgSize.next(this.chartOptions.svg.node().getBoundingClientRect());
    }

    public draw(chart: ChartTreeNode) {
        this.drawChartRequests.next(chart);
    }

    public drawPoint(point: Point) {
        this.drawPointRequests.next(point);
    }

    public setMaxY(maxY: number) {
        const currentBounds: Bounds = this.chartOptions.bounds.getValue();
        this.chartOptions.bounds.next({
            ...currentBounds,
            y: {
                ...currentBounds.y,
                to: maxY,
            }
        })
    }

    public setMaxX(maxX: number) {
        const currentBounds: Bounds = this.chartOptions.bounds.getValue();
        this.chartOptions.bounds.next({
            ...currentBounds,
            x: {
                ...currentBounds.x,
                to: maxX,
            }
        })
    }

    public nextScales(bounds: Bounds) {
        this.chartOptions.bounds.next(bounds);
    }

    private processChartRequest(root: ChartTreeNode) {
        this.drawnChart?.remove();
        this.drawnChart = this.chartOptions.chartsGroup.append("g");
        root.iterate(((current, left, right) => {
            const circle: Selection<SVGCircleElement, unknown, BaseType, unknown> =
                this.drawnChart.append("circle")
                    .attr("r", 3);

            const leftBranch: Selection<SVGPathElement, unknown, BaseType, unknown> =
                this.drawnChart.append("path")
                    .attr("stroke", "#000")
                    .attr("stroke-width", 1)
                    .attr("fill", "none");

            const rightBranch: Selection<SVGPathElement, unknown, BaseType, unknown> =
                this.drawnChart.append("path")
                    .attr("stroke", "#000")
                    .attr("stroke-width", 1)
                    .attr("fill", "none");

            const text: Selection<SVGTextElement, unknown, BaseType, unknown> =
                this.drawnChart.append("text")
                    .text(() => current.name)
                    .attr("text-anchor", "middle");

            combineLatest([this.chartOptions.line, this.chartOptions.scales])
                .subscribe(([line, scales]: [Line<[number, number]>, Scales]) => {
                    circle
                        .attr("cx", scales.x(current.point.x))
                        .attr("cy", scales.y(current.point.y));

                    if (left) {
                        leftBranch
                            .attr("d", line([
                                [current.point.x, current.point.y],
                                [left.point.x, current.point.y],
                                [left.point.x, left.point.y]
                            ]));
                    }

                    if (right) {
                        rightBranch
                            .attr("d", line([
                                [current.point.x, current.point.y],
                                [right.point.x, current.point.y],
                                [right.point.x, right.point.y]
                            ]));
                    }

                    text
                        .attr("x", scales.x(current.point.x) - 10)
                        .attr("y", scales.y(current.point.y) - 10)
                });
        }));
    }

    private processPointRequest(point: Point) {
        const circle: Selection<SVGCircleElement, unknown, BaseType, unknown> = this.chartOptions.chartsGroup.append("circle")
            .style("fill", point.color)
            .attr("r", point.radius)
        combineLatest([this.chartOptions.scales, point.coordinates()])
            .subscribe(([scales, coordinates]: [Scales, Coordinates]) => {
                circle
                    .attr("cx", scales.x(coordinates.x))
                    .attr("cy", scales.y(coordinates.y));
            });
    }

    private initialize(element: Element) {
        this.initialized = true;
        this.chartOptions.svg = d3.select(element.querySelector("#chart"))
            .append("svg")
            .attr("height", "100%")
            .attr("width", "100%");

        this.chartOptions.chartsGroup = this.chartOptions.svg.append("g");

        this.chartOptions.svgSize.next(this.chartOptions.svg.node().getBoundingClientRect());

        this.initializeScales();
        this.initializeAxes();

        this.chartOptions.scales
            .subscribe((scales: Scales) => {
                this.chartOptions.line.next(
                    d3.line()
                        .x(d => scales.x(d[0]))
                        .y(d => scales.y(d[1]))
                );
            });

        this.drawChartRequests.subscribe(chart => this.processChartRequest(chart));
        this.drawPointRequests.subscribe(chart => this.processPointRequest(chart));
    }

    private initializeScales() {
        combineLatest([this.chartOptions.svgSize, this.chartOptions.bounds])
            .subscribe(([svgSize, bounds]: [Rectangle, Bounds]) => {
                this.chartOptions.scales.next({
                    x: d3.scaleLinear()
                        .range([leftMargin, svgSize.width - leftMargin])
                        .domain([bounds.x.from, bounds.x.to]),
                    y: d3.scaleLinear()
                        .range([svgSize.height - 20, 10])
                        .domain([bounds.y.from, bounds.y.to])
                });
            })
    }

    private initializeAxes() {
        this.chartOptions.xAxis = this.chartOptions.svg.append("g");
        this.chartOptions.yAxis = this.chartOptions.svg.append("g");
        this.chartOptions.svgSize
            .subscribe((svgSize: Rectangle) => {
                this.chartOptions.xAxis
                    .style("transform", `translate(${0}px, ${svgSize.height - 20}px)`);
                this.chartOptions.yAxis
                    .style("transform", `translate(${leftMargin}px, ${0}px)`);
            })
        this.chartOptions.scales
            .subscribe((scales: Scales) => {
                this.chartOptions.axes.next({
                    x: d3.axisBottom(scales.x).tickValues([]),
                    y: d3.axisLeft(scales.y),
                });
            });
        this.chartOptions.axes
            .subscribe((axes: Axes) => {
                this.chartOptions.xAxis.call(axes.x);
                this.chartOptions.yAxis.call(axes.y);
            })
    }
}

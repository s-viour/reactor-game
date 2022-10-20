export class ReactorCell {
    constructor(
        public heat: number,
        public power: number,
        public component?: ReactorComponent,
    ) {}
}

export abstract class ReactorComponent {
    constructor(
        public willTakeHeat: boolean
    ) {}

    abstract update(cell: ReactorCell, adjs: ReactorCell[]): void;
}

export class ReactorGenerator extends ReactorComponent {
    heatGenerated: number;
    powerGenerated: number;

    constructor(heatGenerated: number, powerGenerated: number) {
        super(false);
        this.heatGenerated = heatGenerated;
        this.powerGenerated = powerGenerated;
    }

    update(cell: ReactorCell, _adjs: ReactorCell[]): void {
        cell.heat += this.heatGenerated;
        cell.power += this.powerGenerated;
    }
}

export class ReactorVent extends ReactorComponent {
    heatVented: number;

    constructor(heatVented: number) {
        super(true);
        this.heatVented = heatVented;
    }

    update(cell: ReactorCell, _adjs: ReactorCell[]): void {
        let newHeat = cell.heat - this.heatVented;
        if (newHeat < 0) {
            newHeat = 0;
        }

        cell.heat = newHeat;
    }
}

export class Reactor {
    width: number;
    height: number;
    cells: Array<ReactorCell>

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.cells = new Array<ReactorCell>();
        for (let i = 0; i < width * height; ++i) {
            this.cells.push(new ReactorCell(0, 0));
        }
    }

    cellAt(x: number, y: number): ReactorCell {
        return this.cells[this.width * y + x];
    }

    heatAt(x: number, y: number): number {
        return this.cellAt(x, y).heat;
    }

    powerAt(x: number, y: number): number {
        return this.cellAt(x, y).power;
    }

    setComponent(x: number, y: number, comp: ReactorComponent): void {
        this.cellAt(x, y).component = comp;
    }

    removeComponent(x: number, y: number): void {
        this.cellAt(x, y).component = undefined;
    }

    adjacents(x: number, y: number): Array<ReactorCell> {
        const indices: Array<[number, number]> = [
            [x + 1, y],
            [x - 1, y],
            [x, y + 1],
            [x, y - 1],
        ];

        let cells = new Array<ReactorCell>;
        for (let index of indices) {
            let val = this.cellAt(index[0], index[1]);
            if (val) {
                cells.push(val);
            }
        }

        return cells;
    }

    tick(): void {
        // phase 1, do heat generation
        for (let cell of this.cells) {
            if (cell.component && cell.component instanceof ReactorGenerator) {
                cell.component.update(cell, []);
            }
        }

        // phase 2, transfer heat to adjacents
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                let cell = this.cellAt(x, y);
                if (cell.heat != 0) {
                    let heatCount = 0;
                    let adjs = this.adjacents(x, y);
                    for (let adj of adjs) {
                        if (adj.component?.willTakeHeat) { heatCount += 1; }
                    }
                    let dist = cell.heat / heatCount;
                    for (let adj of adjs) {
                        if (adj.component?.willTakeHeat) {
                            adj.heat += dist;
                        }
                    }
                    if (heatCount != 0) {
                        cell.heat = 0;
                    }
                }
            }
        }

        // phase 3, update all other components
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                let cell = this.cellAt(x, y);
                if (cell.component && cell.component instanceof ReactorGenerator) {
                    continue;
                }

                cell.component?.update(cell, this.adjacents(x, y));
            }
        }
    }
}

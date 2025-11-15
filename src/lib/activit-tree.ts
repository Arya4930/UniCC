export interface dayNode {
    day: number;
    count: number;
}

export interface monthNode {
    month: number;
    days: Record<number, dayNode>;
}

export interface yearNode {
    year: number;
    months: Record<number, monthNode>;
}

export interface HeatMapEntry {
    date: string;
    count: number;
}

export class ActivityTree {
    years: Record<number, yearNode> = {};

    constructor(initialData?: Record<number, yearNode>) {
        if (initialData) {
            this.years = initialData;
        }
    }

    increment(date: Date = new Date()): void {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        if (!this.years[year]) {
            this.years[year] = { year, months: {} };
        }
        if (!this.years[year].months[month]) {
            this.years[year].months[month] = { month, days: {} };
        }
        if (!this.years[year].months[month].days[day]) {
            this.years[year].months[month].days[day] = { day, count: 0 };
        }
        this.years[year].months[month].days[day].count++;
    }

    toHeatMap(): HeatMapEntry[] {
        const heatMap: HeatMapEntry[] = [];

        for (const yearKey in this.years) {
            const yearNode = this.years[parseInt(yearKey)];

            for (const monthKey in yearNode.months) {
                const monthNode = yearNode.months[parseInt(monthKey)];
                for (const dayKey in monthNode.days) {
                    const dayNode = monthNode.days[parseInt(dayKey)];

                    const d = `${yearNode.year}/${monthNode.month}/${dayNode.day}`;
                    heatMap.push({ date: d, count: dayNode.count });
                }
            }
        }
        return heatMap;
    }
}

export function loadActivityTree(): ActivityTree {
    const data = localStorage.getItem("activityTree");
    if (data) {
        return new ActivityTree(JSON.parse(data));
    }
    return new ActivityTree();
}

export function saveActivityTree(activityTree: ActivityTree): void {
    localStorage.setItem("activityTree", JSON.stringify(activityTree.years));
}
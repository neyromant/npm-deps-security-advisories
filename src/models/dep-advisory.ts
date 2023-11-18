import { Advisory } from "./advisory";

export interface DepAdvisory {
    readonly name: string;
    readonly version: string;
    readonly advisories: readonly Advisory[];
}

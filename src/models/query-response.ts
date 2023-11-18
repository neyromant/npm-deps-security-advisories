
export interface QueryResponse {
    readonly versions: readonly Version[];
}

interface Version {
    readonly versionKey: VersionKey;
    readonly isDefault: boolean;
    readonly licenses: readonly string[];
    readonly advisoryKeys: readonly AdvisoryKey[];
    readonly links: readonly Link[];
}

interface Link {
    readonly label: string;
    readonly url: string;
}

interface AdvisoryKey {
    readonly id: string;
}

interface VersionKey {
    readonly system: string;
    readonly name: string;
    readonly version: string;
}
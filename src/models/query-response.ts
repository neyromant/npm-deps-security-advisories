
/*
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
*/
export interface QueryResponse {
  results: Result[]
}

interface Result {
  version: Version
}

interface Version {
  versionKey: VersionKey
  publishedAt: string
  isDefault: boolean
  licenses: string[]
  advisoryKeys: AdvisoryKey[]
  links: Link[]
  slsaProvenances: any[]
  registries: string[]
  relatedProjects: RelatedProject[]
}

interface VersionKey {
  system: string
  name: string
  version: string
}

interface Link {
  label: string
  url: string
}

interface RelatedProject {
  projectKey: ProjectKey
  relationProvenance: string
  relationType: string
}

interface ProjectKey {
  id: string
}

interface AdvisoryKey {
    readonly id: string;
}




/**
 * {"results":[{"version":{"versionKey":{"system":"NPM","name":"ajv","version":"6.12.6"},"publishedAt":"2020-10-10T17:01:40Z","isDefault":false,"licenses":["MIT"],"advisoryKeys":[],"links":[{"label":"HOMEPAGE","url":"https://github.com/ajv-validator/ajv"},{"label":"ISSUE_TRACKER","url":"https://github.com/ajv-validator/ajv/issues"},{"label":"ORIGIN","url":"https://registry.npmjs.org/ajv/6.12.6"},{"label":"SOURCE_REPO","url":"git+https://github.com/ajv-validator/ajv.git"}],"slsaProvenances":[],"registries":["https://registry.npmjs.org/"],"relatedProjects":[{"projectKey":{"id":"github.com/ajv-validator/ajv"},"relationProvenance":"UNVERIFIED_METADATA","relationType":"ISSUE_TRACKER"},{"projectKey":{"id":"github.com/ajv-validator/ajv"},"relationProvenance":"UNVERIFIED_METADATA","relationType":"SOURCE_REPO"}]}}]}
 * 
 */
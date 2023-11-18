import { OsvVulnerability } from "./osv-vulnerability";

export interface Advisory {
  readonly advisoryKey: AdvisoryKey;
  readonly url: string;
  readonly title: string;
  readonly aliases: readonly string[];
  readonly cvss3Score: number;
  readonly cvss3Vector: string;
  details?: OsvVulnerability;
}

interface AdvisoryKey {
    readonly id: string;
}
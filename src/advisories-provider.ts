import axios, { CancelToken } from 'axios';
import * as vscode from 'vscode';
import { Advisory } from './models/advisory';
import { QueryResponse } from './models/query-response';
import { OsvVulnerability } from './models/osv-vulnerability';
import { Dependency } from './models/dependency';
import { DepAdvisory } from './models/dep-advisory';

export const getAdvisories = async (deps: readonly Dependency[], ct: vscode.CancellationToken): Promise<readonly DepAdvisory[]> => {
	const results = await Promise.all(deps.map(dep => getVulns(dep, ct)));
	return results.filter(x => !!x && x.advisories.length).map(x => x!);
};

const depAdvisoryCache = new Map<string, DepAdvisory>();

const getVulns = async (dep: Dependency, ct: vscode.CancellationToken): Promise<DepAdvisory | undefined> => {
	const key = `${dep.name}@${dep.version}`;
	const fromCache = depAdvisoryCache.get(key);
	if (fromCache) {
		return fromCache;
	}

	try {
		let cancellationToken: CancelToken | undefined = undefined;
		if (ct) {
			const cancelToken = axios.CancelToken;
			const cancelTokenSource = cancelToken.source();
			ct.onCancellationRequested(() => cancelTokenSource.cancel());
			cancellationToken = cancelTokenSource.token;
		}

		const depInfo = await axios<QueryResponse>(
			`https://api.deps.dev/v3/query?versionKey.system=npm&versionKey.name=${encodeURIComponent(dep.name)}&versionKey.version=${encodeURIComponent(dep.version)}`, {
			method: 'get',
			cancelToken: cancellationToken,
		}
		);
		const advisoryKeys = depInfo.data.results[0].version.advisoryKeys.map(k => k.id);
		var advisoriesInfo = await Promise.all(advisoryKeys.map(k => getAdvisory(k, cancellationToken)));
		
		const result: DepAdvisory = {
			name: dep.name,
			version: dep.version,
			advisories: advisoriesInfo.filter(x => !!x) as readonly Advisory[],
		};

		depAdvisoryCache.set(key, result);
		return result;
	} catch (ex) {
		return;
	}
};

const advisoryCache = new Map<string, Advisory>();

const getAdvisory = async (key: string, ct: CancelToken | undefined): Promise<Advisory | undefined> => {
	const fromCache = advisoryCache.get(key);
	if (fromCache) {
		return fromCache;
	}

	try {
		const advisoryResponse = await axios<Advisory>(
			`https://api.deps.dev/v3/advisories/${encodeURIComponent(key)}`, {
				method: 'get',
				cancelToken: ct,
			}
		);
		const result = advisoryResponse.data;
		if (result.advisoryKey?.id) {
			const details = await osvVulnerability(result.advisoryKey.id, ct);
			result.details = details;			
		}
		advisoryCache.set(key, result);
		return result;
	} catch (ex) {
		return;
	}
};

const osvVulnerabilityCache = new Map<string, OsvVulnerability>();

const osvVulnerability = async (id: string, ct: CancelToken | undefined): Promise<OsvVulnerability | undefined> => {
	const fromCache = osvVulnerabilityCache.get(id);
	if (fromCache) {
		return fromCache;
	}

	try {
		const osvVulnerabilityResponse = await axios<OsvVulnerability>(
			`https://api.osv.dev/v1/vulns/${encodeURIComponent(id)}`, {
				method: 'get',
				cancelToken: ct,
			}
		);
		osvVulnerabilityCache.set(id, osvVulnerabilityResponse.data);
		return osvVulnerabilityResponse.data;
	} catch (ex) {
		// NOPE
	}
};

import { DepTreeDep } from "snyk-nodejs-lockfile-parser/dist/parsers";
import { buildDepTreeFromFiles } from 'snyk-nodejs-lockfile-parser';
import { Dependency } from './models/dependency';

export const parseLockFileAsync = async (workspaceDir: string, manifestFile: string, lockFileName: string): Promise<readonly Dependency[]> => {
    const tree = await buildDepTreeFromFiles(workspaceDir, manifestFile, lockFileName, true);

    var depsMap = new Map<string, Dependency>();
    fillDepsMap(tree, depsMap, true);
    
    const result = [...depsMap].map(x => x[1]);
    return result;
};

const fillDepsMap = (subTree: DepTreeDep, target: Map<string, Dependency>, skipAddSelf = false): void => {
    if (!skipAddSelf && (!subTree.name || !subTree.version)) {        
        return;
    }

    if (!skipAddSelf) {
        const key = `${subTree.name}@${subTree.version}`;
        target.set(key, { name: subTree.name!, version: subTree.version! });
    }

    if (subTree.dependencies) {
        for (const [, value] of Object.entries(subTree.dependencies)) {
            fillDepsMap(value, target);            
        }        
    }    
};
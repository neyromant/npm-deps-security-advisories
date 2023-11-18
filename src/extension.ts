import * as vscode from 'vscode';
import * as fs from 'fs';
import { parseLockFileAsync } from './dependencies-provider';
import { getAdvisories } from './advisories-provider';
import { prepareReportHtml } from './report-provider';
import { ReportPanel } from './results';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('npm-deps-security-advisories.analyze', () => {

		if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
			vscode.window.showWarningMessage('It is no active workspaces!');
			return;
		}

		const workspaceDir = vscode.workspace.workspaceFolders![0].uri.fsPath;
		const workspaceDirContent = fs.readdirSync(workspaceDir);
		const files = workspaceDirContent.filter((elm) => elm.match(/(package-lock\.json)|(yarn\.lock)/ig));
		if (files.length === 0) {
			vscode.window.showWarningMessage('It is no lock files found!');
			return;
		}
		const lockFile = files[0];
		const manifestFile = 'package.json';
		
		vscode.window.withProgress({
			cancellable: true,
			title: 'Analizing...',
			location: vscode.ProgressLocation.Notification,
		}, async (progress, ct) => {
			try {
				progress.report({ message: `Reading ${lockFile}...` });

				var allDeps = await parseLockFileAsync(workspaceDir, manifestFile, lockFile);

				progress.report({ message: `Analyzing ${lockFile}...` });

				const results = await getAdvisories(allDeps, ct);

				progress.report({ message: `Analyzing ${lockFile} done!` });
				progress.report({ message: `Prepare report...` });

				const reportHtml = prepareReportHtml(results);

				ReportPanel.createOrShow(reportHtml);
			} catch (ex) {
				if (ct.isCancellationRequested) {
					await vscode.window.showErrorMessage('Cancelled.', { modal: true });
				} else {
					progress.report({ message: `Analyzing ${lockFile} failed!` });
					await vscode.window.showErrorMessage('Exception: ' + JSON.stringify(ex), { modal: true });
				}
			}
		});
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }

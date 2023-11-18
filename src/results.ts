import * as vscode from 'vscode';

export class ReportPanel {
    private readonly _panel: vscode.WebviewPanel;
	private _disposables: vscode.Disposable[] = [];

	public static currentPanel: ReportPanel | undefined;
	public static readonly viewType = 'npm-deps-security-advisories';
	
	public static createOrShow(data: string) {
		
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		if (ReportPanel.currentPanel) {
			ReportPanel.currentPanel._panel.reveal(column);
			return;
		}

		const panel = vscode.window.createWebviewPanel(
			ReportPanel.viewType,
			'npm-deps-security-advisories',
			column || vscode.ViewColumn.One,
			{
				enableScripts: false,
			},
		);

		ReportPanel.currentPanel = new ReportPanel(panel, data);
	}

	private constructor(panel: vscode.WebviewPanel, data: string) {
		this._panel = panel;
		this._panel.webview.html = data;
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
	}

	public dispose() {
		ReportPanel.currentPanel = undefined;
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}
}
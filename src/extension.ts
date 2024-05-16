// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


export const file = [
	{ scheme: 'file', language: 'vue' },
	{ scheme: 'file', language: 'html' },
];

function findClassDefinition(cssContent: string, className: string): string | null {
	// 构建正则表达式来匹配指定的 CSS 类及其内容
	// 使用非贪婪模式来确保只匹配到第一个闭合的大括号
	const pattern = new RegExp(`\\.${className}\\s*\\{[^\\}]*\\}`, 's');

	// 执行正则表达式匹配
	const match = cssContent.match(pattern);

	// 如果找到匹配项，则返回它
	return match ? match[0] : null;
}

function findClassDefinitionByList(cssContent: string[], className: string): string | null {
	for (let i = 0; i < cssContent.length; i++) {
		const match = findClassDefinition(cssContent[i], className);
		if (match) {
			return match;
		}
	}
	return null;
}



let hitCache = new Map<string, string>();
let fileList: string[] = [];
let contentList: string[] = [];

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const folderPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
	if (!folderPath) {
		vscode.window.showWarningMessage('No folder or workspace opened');
		return;
	}

	const filePath = path.join(folderPath, 'node_modules', 'vuetify', 'lib', "styles", "main.css");
	if (fs.existsSync(filePath)) {
		fileList.push(filePath);
	}

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "test" is now active!');
	let customCssPath: any = vscode.workspace.getConfiguration('vuetifyHelper').get('customCssPath');
	if (customCssPath && customCssPath.length > 0) {
		const filePath = path.join(folderPath, customCssPath[0]);

		if (fs.existsSync(filePath)) {
			fileList.push(filePath);
		}
	}

	fileList.forEach(file => {
		console.log("filePath", filePath);
		fs.readFile(file, 'utf8', (err, data) => {
			contentList.push(data);
		});
	});

	let provider = vscode.languages.registerHoverProvider(file, {
		provideHover(document, position, token) {
			const range = document.getWordRangeAtPosition(position);
			const word = document.getText(range);
			if (hitCache.has(word)) {
				let hover = hitCache.get(word)
				return new vscode.Hover(`\`\`\`scss\n${hover}\n\`\`\``);
			}
			let hover = findClassDefinitionByList(contentList, word);
			if (!hover) {
				return;
			}
			hitCache.set(word, hover);
			return new vscode.Hover(`\`\`\`scss\n${hover}\n\`\`\``);
		}
	});

	context.subscriptions.push(provider);

}
console.log('提示插件启动成功');
// This method is called when your extension is deactivated
export function deactivate() { }

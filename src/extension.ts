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

let cssContent = ""

let hitCache = new Map<string, string>();


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "test" is now active!');
	const folderPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

	if (!folderPath) {
		vscode.window.showWarningMessage('No folder or workspace opened');
		return;
	}
	console.log(folderPath);
	// vuetify\lib\styles
	// 指定要读取的 node_modules 中的文件路径
	const filePath = path.join(folderPath, 'node_modules', 'vuetify', 'lib', "styles", "main.css");
	console.log(filePath);
	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) {
			vscode.window.showErrorMessage('Failed to read file: ' + err.message);
			return;
		}
		cssContent = data;
		// 显示文件内容或进行其他处理
		// vscode.window.showInformationMessage(data);
	});

	let provider = vscode.languages.registerHoverProvider(file, {
		provideHover(document, position, token) {
			const range = document.getWordRangeAtPosition(position);
			const word = document.getText(range);
			if (hitCache.has(word)) {
				let hover = hitCache.get(word)
				return new vscode.Hover(`\`\`\`scss\n${hover}\n\`\`\``);
			}
			let hover = findClassDefinition(cssContent, word);
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

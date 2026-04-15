import chalk from 'chalk';
import Table from 'cli-table3';

let jsonMode = false;

export function setJsonMode(enabled: boolean): void {
  jsonMode = enabled;
}

export function isJsonMode(): boolean {
  return jsonMode;
}

export function printJson(data: any): void {
  console.log(JSON.stringify(data, null, 2));
}

export function printTable(headers: string[], rows: any[][]): void {
  if (jsonMode) return;
  const table = new Table({
    head: headers.map((h) => chalk.cyan.bold(h)),
    style: { head: [], border: [] },
    wordWrap: true,
  });
  rows.forEach((r) => table.push(r));
  console.log(table.toString());
}

export function printSuccess(msg: string): void {
  if (jsonMode) return;
  console.log(chalk.green('✓ ') + msg);
}

export function printError(msg: string, errorType?: string, status?: number): void {
  if (jsonMode) {
    const errorObj: any = {
      error: msg,
    };
    if (errorType) errorObj.type = errorType;
    if (status !== undefined) errorObj.status = status;
    console.error(JSON.stringify(errorObj, null, 2));
    return;
  }
  console.error(chalk.red('✗ ') + msg);
}

export function printInfo(msg: string): void {
  if (jsonMode) return;
  console.log(chalk.blue('ℹ ') + msg);
}

export function printWarning(msg: string): void {
  if (jsonMode) return;
  console.log(chalk.yellow('⚠ ') + msg);
}

export function output(data: any, tableFormatter?: () => void): void {
  if (jsonMode) {
    printJson(data);
  } else if (tableFormatter) {
    tableFormatter();
  } else {
    printJson(data);
  }
}

export function formatDate(ts: number | string | undefined): string {
  if (!ts) return '-';
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

export function truncate(s: string, len: number = 40): string {
  if (!s) return '-';
  return s.length > len ? s.substring(0, len - 3) + '...' : s;
}

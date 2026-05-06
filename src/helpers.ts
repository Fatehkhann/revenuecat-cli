import { getProjectId } from './config';
import * as readline from 'readline';

export function requireProjectId(opts: any): string {
  const id = opts.project || getProjectId();
  if (!id) {
    throw new Error(
      'No project ID set. Use --project <id> or run: rcat configure --project-id <id>',
    );
  }
  return id;
}

export function requireProductIdArg(productId: string | undefined): string {
  if (!productId) {
    throw new Error('Product ID is required.');
  }
  return productId;
}

export async function confirmAction(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (yes/no): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

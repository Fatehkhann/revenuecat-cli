import { Command } from 'commander';
import * as api from '../../client';
import { output, printTable } from '../../output';
import { requireProjectId } from '../../helpers';
import { Product } from './products-types';

export function registerGetCommand(cmd: Command): void {
  cmd
    .command('get <productId>')
    .description('Get product details')
    .option('-p, --project <id>', 'Project ID')
    .action(async (productId: string | undefined, opts) => {
      if (!productId) {
        output(null, () => console.error('Error: Product ID is required.'));
        return;
      }
      const pid = requireProjectId(opts);
      const data: Product = await api.get(`/projects/${pid}/products/${productId}`);
      output(data, () => {
        printTable(
          ['Field', 'Value'],
          Object.entries(data).map(([k, v]) => [
            k,
            typeof v === 'object' ? JSON.stringify(v) : String(v ?? '-'),
          ]),
        );
      });
    });
}

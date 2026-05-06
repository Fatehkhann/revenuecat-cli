import { Command } from 'commander';
import * as api from '../../client';
import { output, printTable, printSuccess } from '../../output';
import { requireProjectId } from '../../helpers';
import { Product } from './products-types';

export function registerListCommand(cmd: Command): void {
  cmd
    .command('list')
    .alias('ls')
    .description('List products')
    .option('-p, --project <id>', 'Project ID')
    .action(async (opts) => {
      const pid = requireProjectId(opts);
      const data: Product[] = await api.paginate(`/projects/${pid}/products`);
      if (data.length === 0) {
        printSuccess('No products found');
      } else {
        output(data, () => {
          printTable(
            ['ID', 'Store Identifier', 'Type', 'App ID'],
            data.map((p: Product) => [
              p.id,
              p.store_identifier || '-',
              p.type || '-',
              p.app_id || '-',
            ]),
          );
        });
      }
    });
}

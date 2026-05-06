import { Command } from 'commander';
import * as api from '../../client';
import { output, printSuccess } from '../../output';
import { requireProjectId } from '../../helpers';

export function registerArchiveCommand(cmd: Command): void {
  cmd
    .command('archive <productId>')
    .description('Archive a product')
    .option('-p, --project <id>', 'Project ID')
    .action(async (productId: string | undefined, opts) => {
      if (!productId) {
        output(null, () => console.error('Error: Product ID is required.'));
        return;
      }
      const pid = requireProjectId(opts);
      const data = await api.post(`/projects/${pid}/products/${productId}/actions/archive`);
      output(data, () => printSuccess(`Product ${productId} archived.`));
    });
}

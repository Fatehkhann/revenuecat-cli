import { Command } from 'commander';
import * as api from '../../client';
import { output, printSuccess } from '../../output';
import { requireProjectId, confirmAction } from '../../helpers';

export function registerDeleteCommand(cmd: Command): void {
  cmd
    .command('delete <productId>')
    .description('Delete a product')
    .option('-p, --project <id>', 'Project ID')
    .option('-f, --force', 'Force deletion without confirmation')
    .action(async (productId: string | undefined, opts) => {
      if (!productId) {
        output(null, () => console.error('Error: Product ID is required.'));
        return;
      }
      const pid = requireProjectId(opts);
      if (!opts.force) {
        const confirmed = await confirmAction(
          `Are you sure you want to delete product ${productId}?`,
        );
        if (!confirmed) {
          output(null, () => printSuccess('Deletion cancelled.'));
          return;
        }
      }
      await api.del(`/projects/${pid}/products/${productId}`);
      output(null, () => printSuccess(`Product ${productId} deleted.`));
    });
}

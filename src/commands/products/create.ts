import { Command, Option } from 'commander';
import * as api from '../../client';
import { output, printSuccess } from '../../output';
import { requireProjectId } from '../../helpers';
import { ProductCreateOptions, validateProductType } from './products-types';

export function registerCreateCommand(cmd: Command): void {
  cmd
    .command('create')
    .description('Create a product')
    .option('-p, --project <id>', 'Project ID')
    .requiredOption('--store-identifier <id>', 'Store identifier (e.g. com.app.monthly)')
    .option('--display-name <name>', 'Display name')
    .requiredOption('--app-id <id>', 'App ID')
    .addOption(new Option('--type <type>', 'Product type: subscription or one_time').choices(['subscription', 'one_time']).makeOptionMandatory())
    .action(async (opts: ProductCreateOptions) => {
      const pid = requireProjectId(opts);
      validateProductType(opts.type);
      const data = await api.post(`/projects/${pid}/products`, {
        store_identifier: opts.storeIdentifier,
        app_id: opts.appId,
        type: opts.type,
        ...(opts.displayName ? { display_name: opts.displayName } : {}),
      });
      output(data, () => printSuccess(`Product created: ${data.id}`));
    });
}

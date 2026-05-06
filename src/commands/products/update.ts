import { Command, Option } from 'commander';
import * as api from '../../client';
import { output, printSuccess } from '../../output';
import { requireProjectId } from '../../helpers';
import { ProductUpdateBody, validateProductType } from './products-types';

export function registerUpdateCommand(cmd: Command): void {
  cmd
    .command('update <productId>')
    .description('Update a product')
    .option('-p, --project <id>', 'Project ID')
    .option('--display-name <name>', 'Display name')
    .option('--store-identifier <id>', 'Store identifier')
    .option('--app-id <id>', 'App ID')
    .addOption(new Option('--type <type>', 'Product type: subscription or one_time').choices(['subscription', 'one_time']))
    .action(async (productId, opts) => {
        const pid = requireProjectId(opts);
      const body: ProductUpdateBody = {};
      if (opts.displayName !== undefined) body.display_name = opts.displayName;
      if (opts.storeIdentifier !== undefined) body.store_identifier = opts.storeIdentifier;
      if (opts.appId !== undefined) body.app_id = opts.appId;
      if (opts.type) {
        validateProductType(opts.type);
        body.type = opts.type;
      }
      if (Object.keys(body).length === 0) {
        output(null, () => printSuccess('No update options provided. Nothing to do.'));
        return;
      }
      const data = await api.patch(`/projects/${pid}/products/${productId}`, body);
      output(data, () => printSuccess(`Product ${productId} updated.`));
    });
}

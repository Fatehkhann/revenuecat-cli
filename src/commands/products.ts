import { Command } from 'commander';
import * as api from '../client';
import { output, printTable, printSuccess } from '../output';
import { requireProjectId, confirmAction } from '../helpers';

const VALID_PRODUCT_TYPES = ['subscription', 'one_time'] as const;
type ProductType = typeof VALID_PRODUCT_TYPES[number];

function validateProductType(type: string): asserts type is ProductType {
  if (!VALID_PRODUCT_TYPES.includes(type as any)) {
    throw new Error(
      `Invalid product type: ${type}. Must be either 'subscription' or 'one_time'.`,
    );
  }
}

export function register(program: Command): void {
  const cmd = program.command('products').description('Manage products');

  cmd
    .command('list')
    .alias('ls')
    .description('List products')
    .option('-p, --project <id>', 'Project ID')
    .action(async (opts) => {
      const pid = requireProjectId(opts);
      const data = await api.paginate(`/projects/${pid}/products`);
      if (data.length === 0) {
        printSuccess('No products found');
      } else {
        output(data, () => {
          printTable(
            ['ID', 'Store Identifier', 'Type', 'App ID'],
            data.map((p: any) => [
              p.id,
              p.store_identifier || '-',
              p.type || '-',
              p.app_id || '-',
            ]),
          );
        });
      }
    });

  cmd
    .command('get <productId>')
    .description('Get product details')
    .option('-p, --project <id>', 'Project ID')
    .action(async (productId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(`/projects/${pid}/products/${productId}`);
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

  cmd
    .command('create')
    .description('Create a product')
    .option('-p, --project <id>', 'Project ID')
    .requiredOption('--store-identifier <id>', 'Store identifier (e.g. com.app.monthly)')
    .option('--display-name <name>', 'Display name')
    .requiredOption('--app-id <id>', 'App ID')
    .requiredOption('--type <type>', 'Product type: subscription or one_time')
    .action(async (opts) => {
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

  cmd
    .command('update <productId>')
    .description('Update a product')
    .option('-p, --project <id>', 'Project ID')
    .option('--display-name <name>', 'Display name')
    .option('--store-identifier <id>', 'Store identifier')
    .option('--app-id <id>', 'App ID')
    .option('--type <type>', 'Product type: subscription or one_time')
    .action(async (productId, opts) => {
      const pid = requireProjectId(opts);
      const body: any = {};
      if (opts.displayName) body.display_name = opts.displayName;
      if (opts.storeIdentifier) body.store_identifier = opts.storeIdentifier;
      if (opts.appId) body.app_id = opts.appId;
      if (opts.type) {
        validateProductType(opts.type);
        body.type = opts.type;
      }
      const data = await api.patch(`/projects/${pid}/products/${productId}`, body);
      output(data, () => printSuccess(`Product ${productId} updated.`));
    });

  cmd
    .command('delete <productId>')
    .description('Delete a product')
    .option('-p, --project <id>', 'Project ID')
    .option('-f, --force', 'Force deletion without confirmation')
    .action(async (productId, opts) => {
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

  cmd
    .command('archive <productId>')
    .description('Archive a product')
    .option('-p, --project <id>', 'Project ID')
    .action(async (productId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.post(`/projects/${pid}/products/${productId}/actions/archive`);
      output(data, () => printSuccess(`Product ${productId} archived.`));
    });

  cmd
    .command('unarchive <productId>')
    .description('Unarchive a product')
    .option('-p, --project <id>', 'Project ID')
    .action(async (productId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.post(`/projects/${pid}/products/${productId}/actions/unarchive`);
      output(data, () => printSuccess(`Product ${productId} unarchived.`));
    });
}

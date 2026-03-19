import { Command } from 'commander';
import * as api from '../client';
import { output, printTable, printSuccess } from '../output';
import { requireProjectId } from '../helpers';

export function register(program: Command): void {
  const cmd = program.command('packages').description('Manage packages');

  cmd
    .command('list <offeringId>')
    .alias('ls')
    .description('List packages in an offering')
    .option('-p, --project <id>', 'Project ID')
    .action(async (offeringId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.paginate(`/projects/${pid}/offerings/${offeringId}/packages`);
      output(data, () => {
        printTable(
          ['ID', 'Lookup Key', 'Display Name', 'Position'],
          data.map((p: any) => [
            p.id,
            p.lookup_key || '-',
            p.display_name || '-',
            p.position?.toString() || '-',
          ]),
        );
      });
    });

  cmd
    .command('get <packageId>')
    .description('Get package details')
    .option('-p, --project <id>', 'Project ID')
    .action(async (packageId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(`/projects/${pid}/packages/${packageId}`);
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
    .command('create <offeringId>')
    .description('Create a package in an offering')
    .option('-p, --project <id>', 'Project ID')
    .requiredOption('--lookup-key <key>', 'Lookup key')
    .requiredOption('--display-name <name>', 'Display name')
    .option('--position <n>', 'Position in offering')
    .action(async (offeringId, opts) => {
      const pid = requireProjectId(opts);
      const body: any = {
        lookup_key: opts.lookupKey,
        display_name: opts.displayName,
      };
      if (opts.position) {
        const pos = parseInt(opts.position, 10);
        if (Number.isNaN(pos)) throw new Error('--position must be a number');
        body.position = pos;
      }
      const data = await api.post(
        `/projects/${pid}/offerings/${offeringId}/packages`,
        body,
      );
      output(data, () => printSuccess(`Package created: ${data.id}`));
    });

  cmd
    .command('update <packageId>')
    .description('Update a package')
    .option('-p, --project <id>', 'Project ID')
    .option('--display-name <name>', 'New display name')
    .option('--position <n>', 'New position')
    .action(async (packageId, opts) => {
      const pid = requireProjectId(opts);
      const body: any = {};
      if (opts.displayName) body.display_name = opts.displayName;
      if (opts.position) {
        const pos = parseInt(opts.position, 10);
        if (Number.isNaN(pos)) throw new Error('--position must be a number');
        body.position = pos;
      }
      const data = await api.post(`/projects/${pid}/packages/${packageId}`, body);
      output(data, () => printSuccess(`Package ${packageId} updated.`));
    });

  cmd
    .command('delete <packageId>')
    .description('Delete a package')
    .option('-p, --project <id>', 'Project ID')
    .action(async (packageId, opts) => {
      const pid = requireProjectId(opts);
      await api.del(`/projects/${pid}/packages/${packageId}`);
      printSuccess(`Package ${packageId} deleted.`);
    });

  cmd
    .command('products <packageId>')
    .description('List products in a package')
    .option('-p, --project <id>', 'Project ID')
    .action(async (packageId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(`/projects/${pid}/packages/${packageId}/products`);
      const items = data.items || [];
      output(data, () => {
        printTable(
          ['Product ID', 'Store Identifier', 'Type'],
          items.map((p: any) => [p.id || '-', p.store_identifier || '-', p.type || '-']),
        );
      });
    });

  cmd
    .command('attach-products <packageId>')
    .description('Attach products to a package')
    .option('-p, --project <id>', 'Project ID')
    .requiredOption('--product-ids <ids>', 'Comma-separated product IDs')
    .action(async (packageId, opts) => {
      const pid = requireProjectId(opts);
      const productIds = opts.productIds.split(',').map((s: string) => s.trim());
      await api.post(`/projects/${pid}/packages/${packageId}/actions/attach_products`, {
        product_ids: productIds,
      });
      printSuccess(`Products attached to package ${packageId}.`);
    });

  cmd
    .command('detach-products <packageId>')
    .description('Detach products from a package')
    .option('-p, --project <id>', 'Project ID')
    .requiredOption('--product-ids <ids>', 'Comma-separated product IDs')
    .action(async (packageId, opts) => {
      const pid = requireProjectId(opts);
      const productIds = opts.productIds.split(',').map((s: string) => s.trim());
      await api.post(`/projects/${pid}/packages/${packageId}/actions/detach_products`, {
        product_ids: productIds,
      });
      printSuccess(`Products detached from package ${packageId}.`);
    });
}

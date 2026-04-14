import { Command } from 'commander';
import * as api from '../client';
import { output, printTable, printSuccess } from '../output';
import { requireProjectId } from '../helpers';

export function register(program: Command): void {
  const cmd = program.command('entitlements').description('Manage entitlements');

  cmd
    .command('list')
    .alias('ls')
    .description('List entitlements')
    .option('-p, --project <id>', 'Project ID')
    .action(async (opts) => {
      const pid = requireProjectId(opts);
      const data = await api.paginate(`/projects/${pid}/entitlements`);
      output(data, () => {
        printTable(
          ['ID', 'Lookup Key', 'Display Name'],
          data.map((e: any) => [e.id, e.lookup_key || '-', e.display_name || '-']),
        );
      });
    });

  cmd
    .command('get <entitlementId>')
    .description('Get entitlement details')
    .option('-p, --project <id>', 'Project ID')
    .action(async (entitlementId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(`/projects/${pid}/entitlements/${entitlementId}`);
      output(data, () => {
        printTable(
          ['Field', 'Value'],
          Object.entries(data).map(([k, v]) => [k, String(v ?? '-')]),
        );
      });
    });

  cmd
    .command('create')
    .description('Create an entitlement')
    .option('-p, --project <id>', 'Project ID')
    .requiredOption('--lookup-key <key>', 'Lookup key')
    .requiredOption('--display-name <name>', 'Display name')
    .action(async (opts) => {
      const pid = requireProjectId(opts);
      const data = await api.post(`/projects/${pid}/entitlements`, {
        lookup_key: opts.lookupKey,
        display_name: opts.displayName,
      });
      output(data, () => printSuccess(`Entitlement created: ${data.id}`));
    });

  cmd
    .command('update <entitlementId>')
    .description('Update an entitlement')
    .option('-p, --project <id>', 'Project ID')
    .option('--display-name <name>', 'New display name')
    .action(async (entitlementId, opts) => {
      const pid = requireProjectId(opts);
      const body: any = {};
      if (opts.displayName) body.display_name = opts.displayName;
      const data = await api.post(`/projects/${pid}/entitlements/${entitlementId}`, body);
      output(data, () => printSuccess(`Entitlement ${entitlementId} updated.`));
    });

  cmd
    .command('delete <entitlementId>')
    .description('Delete an entitlement')
    .option('-p, --project <id>', 'Project ID')
    .action(async (entitlementId, opts) => {
      const pid = requireProjectId(opts);
      await api.del(`/projects/${pid}/entitlements/${entitlementId}`);
      printSuccess(`Entitlement ${entitlementId} deleted.`);
    });

  cmd
    .command('archive <entitlementId>')
    .description('Archive an entitlement')
    .option('-p, --project <id>', 'Project ID')
    .action(async (entitlementId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.post(`/projects/${pid}/entitlements/${entitlementId}/actions/archive`);
      output(data, () => printSuccess(`Entitlement ${entitlementId} archived.`));
    });

  cmd
    .command('unarchive <entitlementId>')
    .description('Unarchive an entitlement')
    .option('-p, --project <id>', 'Project ID')
    .action(async (entitlementId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.post(`/projects/${pid}/entitlements/${entitlementId}/actions/unarchive`);
      output(data, () => printSuccess(`Entitlement ${entitlementId} unarchived.`));
    });

  cmd
    .command('products <entitlementId>')
    .description('List products attached to an entitlement')
    .option('-p, --project <id>', 'Project ID')
    .action(async (entitlementId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(
        `/projects/${pid}/entitlements/${entitlementId}/products`,
      );
      const items = data.items || [];
      output(data, () => {
        printTable(
          ['Product ID', 'Store Identifier', 'Type'],
          items.map((p: any) => [p.id || '-', p.store_identifier || '-', p.type || '-']),
        );
      });
    });

  cmd
    .command('attach-products <entitlementId>')
    .description('Attach products to an entitlement')
    .option('-p, --project <id>', 'Project ID')
    .requiredOption('--product-ids <ids>', 'Comma-separated product IDs')
    .action(async (entitlementId, opts) => {
      const pid = requireProjectId(opts);
      const productIds = opts.productIds.split(',').map((s: string) => s.trim());
      await api.post(
        `/projects/${pid}/entitlements/${entitlementId}/actions/attach_products`,
        { product_ids: productIds },
      );
      printSuccess(`Products attached to entitlement ${entitlementId}.`);
    });

  cmd
    .command('detach-products <entitlementId>')
    .description('Detach products from an entitlement')
    .option('-p, --project <id>', 'Project ID')
    .requiredOption('--product-ids <ids>', 'Comma-separated product IDs')
    .action(async (entitlementId, opts) => {
      const pid = requireProjectId(opts);
      const productIds = opts.productIds.split(',').map((s: string) => s.trim());
      await api.post(
        `/projects/${pid}/entitlements/${entitlementId}/actions/detach_products`,
        { product_ids: productIds },
      );
      printSuccess(`Products detached from entitlement ${entitlementId}.`);
    });
}

import { Command } from 'commander';
import * as api from '../client';
import { output, printTable, printSuccess, formatDate } from '../output';
import { requireProjectId } from '../helpers';

export function register(program: Command): void {
  const cmd = program.command('purchases').description('Manage purchases');

  cmd
    .command('list')
    .alias('ls')
    .description('Search purchases')
    .option('-p, --project <id>', 'Project ID')
    .option('--starting-after <id>', 'Cursor')
    .option('--limit <n>', 'Limit')
    .action(async (opts) => {
      const pid = requireProjectId(opts);
      const query: Record<string, string> = {};
      if (opts.limit) query.limit = opts.limit;
      if (opts.startingAfter) query.starting_after = opts.startingAfter;
      const data = await api.get(`/projects/${pid}/purchases`, query);
      const items = data.items || [];
      output(data, () => {
        printTable(
          ['ID', 'Customer', 'Store', 'Revenue (USD)', 'Purchased At'],
          items.map((p: any) => [
            p.id || '-',
            p.customer_id || '-',
            p.store || '-',
            p.revenue_in_usd?.toString() || '-',
            formatDate(p.purchased_at),
          ]),
        );
      });
    });

  cmd
    .command('get <purchaseId>')
    .description('Get purchase details')
    .option('-p, --project <id>', 'Project ID')
    .action(async (purchaseId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(`/projects/${pid}/purchases/${purchaseId}`);
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
    .command('entitlements <purchaseId>')
    .description('List entitlements for a purchase')
    .option('-p, --project <id>', 'Project ID')
    .action(async (purchaseId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(`/projects/${pid}/purchases/${purchaseId}/entitlements`);
      const items = data.items || [];
      output(data, () => {
        printTable(
          ['Entitlement ID', 'Lookup Key'],
          items.map((e: any) => [e.id || '-', e.lookup_key || '-']),
        );
      });
    });

  cmd
    .command('refund <purchaseId>')
    .description('Refund a purchase')
    .option('-p, --project <id>', 'Project ID')
    .action(async (purchaseId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.post(`/projects/${pid}/purchases/${purchaseId}/actions/refund`);
      output(data, () => printSuccess(`Purchase ${purchaseId} refunded.`));
    });
}

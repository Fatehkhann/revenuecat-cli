import { Command } from 'commander';
import * as api from '../client';
import { output, printTable, printSuccess, formatDate } from '../output';
import { requireProjectId } from '../helpers';

export function register(program: Command): void {
  const cmd = program.command('subscriptions').alias('subs').description('Manage subscriptions');

  cmd
    .command('list')
    .alias('ls')
    .description('Search subscriptions')
    .option('-p, --project <id>', 'Project ID')
    .option('--starting-after <id>', 'Cursor')
    .option('--limit <n>', 'Limit')
    .action(async (opts) => {
      const pid = requireProjectId(opts);
      const query: Record<string, string> = {};
      if (opts.limit) query.limit = opts.limit;
      if (opts.startingAfter) query.starting_after = opts.startingAfter;
      const data = await api.get(`/projects/${pid}/subscriptions`, query);
      const items = data.items || [];
      output(data, () => {
        printTable(
          ['ID', 'Customer', 'Status', 'Store', 'Expires'],
          items.map((s: any) => [
            s.id || '-',
            s.customer_id || '-',
            s.status || '-',
            s.store || '-',
            formatDate(s.expires_at),
          ]),
        );
      });
    });

  cmd
    .command('get <subscriptionId>')
    .description('Get subscription details')
    .option('-p, --project <id>', 'Project ID')
    .action(async (subscriptionId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(`/projects/${pid}/subscriptions/${subscriptionId}`);
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
    .command('transactions <subscriptionId>')
    .description('List transactions for a subscription')
    .option('-p, --project <id>', 'Project ID')
    .action(async (subscriptionId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(
        `/projects/${pid}/subscriptions/${subscriptionId}/transactions`,
      );
      const items = data.items || [];
      output(data, () => {
        printTable(
          ['Transaction ID', 'Revenue (USD)', 'Type', 'Purchased At'],
          items.map((t: any) => [
            t.id || '-',
            t.revenue_in_usd?.toString() || '-',
            t.type || '-',
            formatDate(t.purchased_at),
          ]),
        );
      });
    });

  cmd
    .command('entitlements <subscriptionId>')
    .description('List entitlements for a subscription')
    .option('-p, --project <id>', 'Project ID')
    .action(async (subscriptionId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(
        `/projects/${pid}/subscriptions/${subscriptionId}/entitlements`,
      );
      const items = data.items || [];
      output(data, () => {
        printTable(
          ['Entitlement ID', 'Lookup Key'],
          items.map((e: any) => [e.id || '-', e.lookup_key || '-']),
        );
      });
    });

  cmd
    .command('cancel <subscriptionId>')
    .description('Cancel a subscription (Web Billing only)')
    .option('-p, --project <id>', 'Project ID')
    .action(async (subscriptionId, opts) => {
      const pid = requireProjectId(opts);
      await api.post(`/projects/${pid}/subscriptions/${subscriptionId}/actions/cancel`);
      printSuccess(`Subscription ${subscriptionId} cancelled.`);
    });

  cmd
    .command('refund <subscriptionId>')
    .description('Refund a subscription')
    .option('-p, --project <id>', 'Project ID')
    .action(async (subscriptionId, opts) => {
      const pid = requireProjectId(opts);
      await api.post(`/projects/${pid}/subscriptions/${subscriptionId}/actions/refund`);
      printSuccess(`Subscription ${subscriptionId} refunded.`);
    });

  cmd
    .command('management-url <subscriptionId>')
    .description('Get management URL for a subscription')
    .option('-p, --project <id>', 'Project ID')
    .action(async (subscriptionId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(
        `/projects/${pid}/subscriptions/${subscriptionId}/authenticated_management_url`,
      );
      output(data, () => {
        console.log(data.url || JSON.stringify(data));
      });
    });
}

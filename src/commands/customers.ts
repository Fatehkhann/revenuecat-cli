import { Command } from 'commander';
import * as api from '../client';
import { output, printTable, printSuccess, formatDate, truncate } from '../output';
import { requireProjectId } from '../helpers';

export function register(program: Command): void {
  const cmd = program.command('customers').description('Manage customers');

  cmd
    .command('list')
    .alias('ls')
    .description('List customers')
    .option('-p, --project <id>', 'Project ID')
    .option('--limit <n>', 'Max results', '20')
    .option('--starting-after <id>', 'Cursor for pagination')
    .action(async (opts) => {
      const pid = requireProjectId(opts);
      const query: Record<string, string> = {};
      if (opts.limit) query.limit = opts.limit;
      if (opts.startingAfter) query.starting_after = opts.startingAfter;
      const data = await api.get(`/projects/${pid}/customers`, query);
      const items = data.items || [];
      output(data, () => {
        printTable(
          ['ID', 'First Seen', 'Last Seen'],
          items.map((c: any) => [c.id, formatDate(c.first_seen), formatDate(c.last_seen)]),
        );
      });
    });

  cmd
    .command('get <customerId>')
    .description('Get customer details')
    .option('-p, --project <id>', 'Project ID')
    .action(async (customerId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(`/projects/${pid}/customers/${customerId}`);
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
    .command('create <customerId>')
    .description('Create a customer')
    .option('-p, --project <id>', 'Project ID')
    .action(async (customerId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.post(`/projects/${pid}/customers`, { id: customerId });
      output(data, () => printSuccess(`Customer ${customerId} created.`));
    });

  cmd
    .command('delete <customerId>')
    .description('Delete a customer')
    .option('-p, --project <id>', 'Project ID')
    .action(async (customerId, opts) => {
      const pid = requireProjectId(opts);
      await api.del(`/projects/${pid}/customers/${customerId}`);
      printSuccess(`Customer ${customerId} deleted.`);
    });

  cmd
    .command('entitlements <customerId>')
    .description('List active entitlements for a customer')
    .option('-p, --project <id>', 'Project ID')
    .action(async (customerId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(
        `/projects/${pid}/customers/${customerId}/active_entitlements`,
      );
      const items = data.items || [];
      output(data, () => {
        printTable(
          ['Entitlement ID', 'Lookup Key', 'Expires'],
          items.map((e: any) => [
            e.entitlement_id || e.id || '-',
            e.lookup_key || '-',
            formatDate(e.expires_at),
          ]),
        );
      });
    });

  cmd
    .command('subscriptions <customerId>')
    .description('List subscriptions for a customer')
    .option('-p, --project <id>', 'Project ID')
    .action(async (customerId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(`/projects/${pid}/customers/${customerId}/subscriptions`);
      const items = data.items || [];
      output(data, () => {
        printTable(
          ['ID', 'Status', 'Store', 'Product', 'Expires'],
          items.map((s: any) => [
            s.id || '-',
            s.status || '-',
            s.store || '-',
            s.product_identifier || truncate(s.store_identifier || '-'),
            formatDate(s.expires_at),
          ]),
        );
      });
    });

  cmd
    .command('purchases <customerId>')
    .description('List purchases for a customer')
    .option('-p, --project <id>', 'Project ID')
    .action(async (customerId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(`/projects/${pid}/customers/${customerId}/purchases`);
      const items = data.items || [];
      output(data, () => {
        printTable(
          ['ID', 'Store', 'Revenue (USD)', 'Purchased At'],
          items.map((p: any) => [
            p.id || '-',
            p.store || '-',
            p.revenue_in_usd?.toString() || '-',
            formatDate(p.purchased_at),
          ]),
        );
      });
    });

  cmd
    .command('aliases <customerId>')
    .description('List aliases for a customer')
    .option('-p, --project <id>', 'Project ID')
    .action(async (customerId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(`/projects/${pid}/customers/${customerId}/aliases`);
      const items = data.items || [];
      output(data, () => {
        printTable(
          ['Alias ID', 'Created'],
          items.map((a: any) => [a.id || '-', formatDate(a.created_at)]),
        );
      });
    });

  cmd
    .command('attributes <customerId>')
    .description('List/set customer attributes')
    .option('-p, --project <id>', 'Project ID')
    .option('--set <json>', 'JSON object of attributes to set')
    .action(async (customerId, opts) => {
      const pid = requireProjectId(opts);
      if (opts.set) {
        let attrs: Record<string, unknown>;
        try {
          attrs = JSON.parse(opts.set);
        } catch {
          throw new Error('Invalid JSON for --set. Example: \'{"key":"value"}\'');
        }
        await api.post(`/projects/${pid}/customers/${customerId}/attributes`, {
          attributes: attrs,
        });
        printSuccess('Attributes updated.');
      } else {
        const data = await api.get(`/projects/${pid}/customers/${customerId}/attributes`);
        const items = data.items || data.attributes || [];
        output(data, () => {
          if (Array.isArray(items)) {
            printTable(
              ['Key', 'Value', 'Updated'],
              items.map((a: any) => [a.key || '-', a.value || '-', formatDate(a.updated_at)]),
            );
          } else {
            console.log(JSON.stringify(items, null, 2));
          }
        });
      }
    });

  cmd
    .command('grant-entitlement <customerId>')
    .description('Grant an entitlement to a customer')
    .option('-p, --project <id>', 'Project ID')
    .requiredOption('--entitlement-id <id>', 'Entitlement identifier')
    .requiredOption('--expires-at <datetime>', 'Expiration (ISO 8601)')
    .action(async (customerId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.post(
        `/projects/${pid}/customers/${customerId}/actions/grant_entitlement`,
        { entitlement_id: opts.entitlementId, expires_at: opts.expiresAt },
      );
      output(data, () => printSuccess(`Entitlement granted to ${customerId}.`));
    });

  cmd
    .command('revoke-entitlement <customerId>')
    .description('Revoke a granted entitlement')
    .option('-p, --project <id>', 'Project ID')
    .requiredOption('--entitlement-id <id>', 'Entitlement identifier')
    .action(async (customerId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.post(
        `/projects/${pid}/customers/${customerId}/actions/revoke_granted_entitlement`,
        { entitlement_id: opts.entitlementId },
      );
      output(data, () => printSuccess(`Entitlement revoked from ${customerId}.`));
    });

  cmd
    .command('transfer <customerId>')
    .description('Transfer customer data to another customer')
    .option('-p, --project <id>', 'Project ID')
    .requiredOption('--to <targetId>', 'Target customer ID')
    .action(async (customerId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.post(
        `/projects/${pid}/customers/${customerId}/actions/transfer`,
        { new_app_user_id: opts.to },
      );
      output(data, () => printSuccess(`Data transferred from ${customerId} to ${opts.to}.`));
    });

  cmd
    .command('assign-offering <customerId>')
    .description('Assign a specific offering to a customer')
    .option('-p, --project <id>', 'Project ID')
    .requiredOption('--offering-id <id>', 'Offering ID')
    .action(async (customerId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.post(
        `/projects/${pid}/customers/${customerId}/actions/assign_offering`,
        { offering_id: opts.offeringId },
      );
      output(data, () => printSuccess(`Offering assigned to ${customerId}.`));
    });

  cmd
    .command('invoices <customerId>')
    .description('List invoices for a customer')
    .option('-p, --project <id>', 'Project ID')
    .action(async (customerId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(`/projects/${pid}/customers/${customerId}/invoices`);
      const items = data.items || [];
      output(data, () => {
        printTable(
          ['Invoice ID', 'Amount', 'Status', 'Created'],
          items.map((i: any) => [
            i.id || '-',
            i.total?.toString() || '-',
            i.status || '-',
            formatDate(i.created_at),
          ]),
        );
      });
    });
}

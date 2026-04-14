import { Command } from 'commander';
import * as api from '../client';
import { output, printTable, printSuccess } from '../output';
import { requireProjectId } from '../helpers';

export function register(program: Command): void {
  const cmd = program
    .command('virtual-currencies')
    .alias('vc')
    .description('Manage virtual currencies');

  cmd
    .command('list')
    .alias('ls')
    .description('List virtual currencies')
    .option('-p, --project <id>', 'Project ID')
    .action(async (opts) => {
      const pid = requireProjectId(opts);
      const data = await api.paginate(`/projects/${pid}/virtual_currencies`);
      output(data, () => {
        printTable(
          ['Code', 'Name', 'Description'],
          data.map((v: any) => [v.code || '-', v.name || '-', v.description || '-']),
        );
      });
    });

  cmd
    .command('get <code>')
    .description('Get virtual currency details')
    .option('-p, --project <id>', 'Project ID')
    .action(async (code, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(`/projects/${pid}/virtual_currencies/${code}`);
      output(data, () => {
        printTable(
          ['Field', 'Value'],
          Object.entries(data).map(([k, v]) => [k, String(v ?? '-')]),
        );
      });
    });

  cmd
    .command('create')
    .description('Create a virtual currency')
    .option('-p, --project <id>', 'Project ID')
    .requiredOption('--code <code>', 'Currency code (max 10, alphanumeric)')
    .requiredOption('--name <name>', 'Currency name (max 50)')
    .option('--description <desc>', 'Description')
    .action(async (opts) => {
      const pid = requireProjectId(opts);
      const body: any = { code: opts.code, name: opts.name };
      if (opts.description) body.description = opts.description;
      const data = await api.post(`/projects/${pid}/virtual_currencies`, body);
      output(data, () => printSuccess(`Virtual currency ${opts.code} created.`));
    });

  cmd
    .command('update <code>')
    .description('Update a virtual currency')
    .option('-p, --project <id>', 'Project ID')
    .option('--name <name>', 'New name')
    .option('--description <desc>', 'New description')
    .action(async (code, opts) => {
      const pid = requireProjectId(opts);
      const body: any = {};
      if (opts.name) body.name = opts.name;
      if (opts.description) body.description = opts.description;
      const data = await api.post(`/projects/${pid}/virtual_currencies/${code}`, body);
      output(data, () => printSuccess(`Virtual currency ${code} updated.`));
    });

  cmd
    .command('delete <code>')
    .description('Delete a virtual currency')
    .option('-p, --project <id>', 'Project ID')
    .action(async (code, opts) => {
      const pid = requireProjectId(opts);
      await api.del(`/projects/${pid}/virtual_currencies/${code}`);
      output(null, () => printSuccess(`Virtual currency ${code} deleted.`));
    });

  cmd
    .command('archive <code>')
    .description('Archive a virtual currency')
    .option('-p, --project <id>', 'Project ID')
    .action(async (code, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.post(`/projects/${pid}/virtual_currencies/${code}/actions/archive`);
      output(data, () => printSuccess(`Virtual currency ${code} archived.`));
    });

  cmd
    .command('unarchive <code>')
    .description('Unarchive a virtual currency')
    .option('-p, --project <id>', 'Project ID')
    .action(async (code, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.post(`/projects/${pid}/virtual_currencies/${code}/actions/unarchive`);
      output(data, () => printSuccess(`Virtual currency ${code} unarchived.`));
    });

  // Customer-level virtual currency commands
  cmd
    .command('balances <customerId>')
    .description('List virtual currency balances for a customer')
    .option('-p, --project <id>', 'Project ID')
    .action(async (customerId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(
        `/projects/${pid}/customers/${customerId}/virtual_currencies`,
      );
      const items = data.items || [];
      output(data, () => {
        printTable(
          ['Currency Code', 'Balance'],
          items.map((b: any) => [b.currency_code || '-', b.balance?.toString() || '0']),
        );
      });
    });

  cmd
    .command('transact <customerId>')
    .description('Create a virtual currency transaction for a customer')
    .option('-p, --project <id>', 'Project ID')
    .requiredOption('--currency-code <code>', 'Currency code')
    .requiredOption('--amount <n>', 'Amount (positive to credit, negative to debit)')
    .action(async (customerId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.post(
        `/projects/${pid}/customers/${customerId}/virtual_currencies/transactions`,
        {
          currency_code: opts.currencyCode,
          amount: (() => {
            const n = parseInt(opts.amount, 10);
            if (Number.isNaN(n)) throw new Error('--amount must be a number');
            return n;
          })(),
        },
      );
      output(data, () => printSuccess(`Transaction created for ${customerId}.`));
    });
}

import { Command } from 'commander';
import * as api from '../client';
import { output, printTable, printSuccess, truncate } from '../output';
import { requireProjectId } from '../helpers';

export function register(program: Command): void {
  const cmd = program.command('paywalls').description('Manage paywalls');

  cmd
    .command('list')
    .alias('ls')
    .description('List paywalls')
    .option('-p, --project <id>', 'Project ID')
    .action(async (opts) => {
      const pid = requireProjectId(opts);
      const data = await api.paginate(`/projects/${pid}/paywalls`);
      output(data, () => {
        printTable(
          ['ID', 'Name', 'Offering'],
          data.map((p: any) => [
            p.id || '-',
            p.name || '-',
            p.offering_id || '-',
          ]),
        );
      });
    });

  cmd
    .command('get <paywallId>')
    .description('Get paywall details')
    .option('-p, --project <id>', 'Project ID')
    .option('--expand <fields>', 'Expand fields (comma-separated: offering, components)')
    .action(async (paywallId, opts) => {
      const pid = requireProjectId(opts);
      const query: Record<string, string> = {};
      if (opts.expand) query.expand = opts.expand;
      const data = await api.get(`/projects/${pid}/paywalls/${paywallId}`, query);
      output(data, () => {
        console.log(JSON.stringify(data, null, 2));
      });
    });

  cmd
    .command('delete <paywallId>')
    .description('Delete a paywall')
    .option('-p, --project <id>', 'Project ID')
    .action(async (paywallId, opts) => {
      const pid = requireProjectId(opts);
      await api.del(`/projects/${pid}/paywalls/${paywallId}`);
      printSuccess(`Paywall ${paywallId} deleted.`);
    });
}

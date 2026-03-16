import { Command } from 'commander';
import * as api from '../client';
import { output, printTable, formatDate } from '../output';
import { requireProjectId } from '../helpers';

export function register(program: Command): void {
  const cmd = program.command('audit-logs').alias('audit').description('View audit logs');

  cmd
    .command('list')
    .alias('ls')
    .description('List audit logs')
    .option('-p, --project <id>', 'Project ID')
    .option('--start-date <date>', 'Start date (ISO 8601)')
    .option('--end-date <date>', 'End date (ISO 8601)')
    .option('--limit <n>', 'Max results')
    .option('--starting-after <id>', 'Cursor')
    .action(async (opts) => {
      const pid = requireProjectId(opts);
      const query: Record<string, string> = {};
      if (opts.startDate) query.start_date = opts.startDate;
      if (opts.endDate) query.end_date = opts.endDate;
      if (opts.limit) query.limit = opts.limit;
      if (opts.startingAfter) query.starting_after = opts.startingAfter;

      const data = await api.get(`/projects/${pid}/audit_logs`, query);
      const items = data.items || [];
      output(data, () => {
        printTable(
          ['ID', 'Action', 'Actor', 'Resource', 'Created'],
          items.map((l: any) => [
            l.id || '-',
            l.action || '-',
            l.actor?.email || l.actor?.id || '-',
            l.resource_type || '-',
            formatDate(l.created_at),
          ]),
        );
      });
    });
}

import { Command } from 'commander';
import * as api from '../client';
import { output, printTable } from '../output';
import { requireProjectId } from '../helpers';

export function register(program: Command): void {
  const cmd = program.command('collaborators').description('View collaborators');

  cmd
    .command('list')
    .alias('ls')
    .description('List project collaborators')
    .option('-p, --project <id>', 'Project ID')
    .action(async (opts) => {
      const pid = requireProjectId(opts);
      const data = await api.paginate(`/projects/${pid}/collaborators`);
      output(data, () => {
        printTable(
          ['ID', 'Email', 'Role'],
          data.map((c: any) => [c.id || '-', c.email || '-', c.role || '-']),
        );
      });
    });
}

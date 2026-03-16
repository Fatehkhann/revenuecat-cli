import { Command } from 'commander';
import * as api from '../client';
import { output, printTable, truncate } from '../output';

export function register(program: Command): void {
  const cmd = program.command('projects').description('Manage projects');

  cmd
    .command('list')
    .alias('ls')
    .description('List all projects')
    .action(async () => {
      const data = await api.paginate('/projects');
      output(data, () => {
        printTable(
          ['ID', 'Name', 'Created'],
          data.map((p: any) => [p.id, p.name || '-', p.created_at || '-']),
        );
      });
    });

  cmd
    .command('create')
    .description('Create a new project')
    .requiredOption('--name <name>', 'Project name')
    .action(async (opts) => {
      const data = await api.post('/projects', { name: opts.name });
      output(data, () => {
        printTable(
          ['ID', 'Name'],
          [[data.id, data.name]],
        );
      });
    });
}

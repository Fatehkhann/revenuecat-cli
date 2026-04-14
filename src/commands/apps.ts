import { Command } from 'commander';
import * as api from '../client';
import { output, printTable, printSuccess } from '../output';
import { requireProjectId } from '../helpers';

export function register(program: Command): void {
  const cmd = program.command('apps').description('Manage apps');

  cmd
    .command('list')
    .alias('ls')
    .description('List apps in a project')
    .option('-p, --project <id>', 'Project ID')
    .action(async (opts) => {
      const pid = requireProjectId(opts);
      const data = await api.paginate(`/projects/${pid}/apps`);
      output(data, () => {
        printTable(
          ['ID', 'Name', 'Type', 'Platform'],
          data.map((a: any) => [a.id, a.name || '-', a.type || '-', a.platform || '-']),
        );
      });
    });

  cmd
    .command('get <appId>')
    .description('Get app details')
    .option('-p, --project <id>', 'Project ID')
    .action(async (appId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(`/projects/${pid}/apps/${appId}`);
      output(data, () => {
        printTable(
          ['Field', 'Value'],
          Object.entries(data).map(([k, v]) => [k, String(v)]),
        );
      });
    });

  cmd
    .command('create')
    .description('Create an app')
    .option('-p, --project <id>', 'Project ID')
    .requiredOption('--name <name>', 'App name')
    .requiredOption('--type <type>', 'App type (app_store, play_store, stripe, amazon, rc_billing, roku, paddle)')
    .action(async (opts) => {
      const pid = requireProjectId(opts);
      const data = await api.post(`/projects/${pid}/apps`, {
        name: opts.name,
        type: opts.type,
      });
      output(data, () => {
        printTable(['ID', 'Name', 'Type'], [[data.id, data.name, data.type]]);
      });
    });

  cmd
    .command('update <appId>')
    .description('Update an app')
    .option('-p, --project <id>', 'Project ID')
    .option('--name <name>', 'New app name')
    .action(async (appId, opts) => {
      const pid = requireProjectId(opts);
      const body: any = {};
      if (opts.name) body.name = opts.name;
      const data = await api.post(`/projects/${pid}/apps/${appId}`, body);
      output(data, () => printSuccess(`App ${appId} updated.`));
    });

  cmd
    .command('delete <appId>')
    .description('Delete an app')
    .option('-p, --project <id>', 'Project ID')
    .action(async (appId, opts) => {
      const pid = requireProjectId(opts);
      await api.del(`/projects/${pid}/apps/${appId}`);
      output(null, () => printSuccess(`App ${appId} deleted.`));
    });
}

import { Command } from 'commander';
import * as api from '../client';
import { output, printTable, printSuccess } from '../output';
import { requireProjectId } from '../helpers';

export function register(program: Command): void {
  const cmd = program.command('offerings').description('Manage offerings');

  cmd
    .command('list')
    .alias('ls')
    .description('List offerings')
    .option('-p, --project <id>', 'Project ID')
    .action(async (opts) => {
      const pid = requireProjectId(opts);
      const data = await api.paginate(`/projects/${pid}/offerings`);
      output(data, () => {
        printTable(
          ['ID', 'Lookup Key', 'Display Name', 'Current?'],
          data.map((o: any) => [
            o.id,
            o.lookup_key || '-',
            o.display_name || '-',
            o.is_current ? 'Yes' : 'No',
          ]),
        );
      });
    });

  cmd
    .command('get <offeringId>')
    .description('Get offering details')
    .option('-p, --project <id>', 'Project ID')
    .action(async (offeringId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(`/projects/${pid}/offerings/${offeringId}`);
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
    .command('create')
    .description('Create an offering')
    .option('-p, --project <id>', 'Project ID')
    .requiredOption('--lookup-key <key>', 'Lookup key')
    .requiredOption('--display-name <name>', 'Display name')
    .action(async (opts) => {
      const pid = requireProjectId(opts);
      const data = await api.post(`/projects/${pid}/offerings`, {
        lookup_key: opts.lookupKey,
        display_name: opts.displayName,
      });
      output(data, () => printSuccess(`Offering created: ${data.id}`));
    });

  cmd
    .command('update <offeringId>')
    .description('Update an offering')
    .option('-p, --project <id>', 'Project ID')
    .option('--display-name <name>', 'New display name')
    .action(async (offeringId, opts) => {
      const pid = requireProjectId(opts);
      const body: any = {};
      if (opts.displayName) body.display_name = opts.displayName;
      const data = await api.post(`/projects/${pid}/offerings/${offeringId}`, body);
      output(data, () => printSuccess(`Offering ${offeringId} updated.`));
    });

  cmd
    .command('delete <offeringId>')
    .description('Delete an offering')
    .option('-p, --project <id>', 'Project ID')
    .action(async (offeringId, opts) => {
      const pid = requireProjectId(opts);
      await api.del(`/projects/${pid}/offerings/${offeringId}`);
      output(null, () => printSuccess(`Offering ${offeringId} deleted.`));
    });

  cmd
    .command('archive <offeringId>')
    .description('Archive an offering')
    .option('-p, --project <id>', 'Project ID')
    .action(async (offeringId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.post(`/projects/${pid}/offerings/${offeringId}/actions/archive`);
      output(data, () => printSuccess(`Offering ${offeringId} archived.`));
    });

  cmd
    .command('unarchive <offeringId>')
    .description('Unarchive an offering')
    .option('-p, --project <id>', 'Project ID')
    .action(async (offeringId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.post(`/projects/${pid}/offerings/${offeringId}/actions/unarchive`);
      output(data, () => printSuccess(`Offering ${offeringId} unarchived.`));
    });
}

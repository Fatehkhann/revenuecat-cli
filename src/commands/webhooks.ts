import { Command } from 'commander';
import * as api from '../client';
import { output, printTable, printSuccess, truncate } from '../output';
import { requireProjectId } from '../helpers';

export function register(program: Command): void {
  const cmd = program.command('webhooks').description('Manage webhook integrations');

  cmd
    .command('list')
    .alias('ls')
    .description('List webhooks')
    .option('-p, --project <id>', 'Project ID')
    .action(async (opts) => {
      const pid = requireProjectId(opts);
      const data = await api.paginate(`/projects/${pid}/integrations/webhooks`);
      output(data, () => {
        printTable(
          ['ID', 'Name', 'URL', 'Environment'],
          data.map((w: any) => [
            w.id || '-',
            w.name || '-',
            truncate(w.url || '-', 50),
            w.environment || 'all',
          ]),
        );
      });
    });

  cmd
    .command('get <webhookId>')
    .description('Get webhook details')
    .option('-p, --project <id>', 'Project ID')
    .action(async (webhookId, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(
        `/projects/${pid}/integrations/webhooks/${webhookId}`,
      );
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
    .description('Create a webhook')
    .option('-p, --project <id>', 'Project ID')
    .requiredOption('--name <name>', 'Webhook name')
    .requiredOption('--url <url>', 'Webhook URL')
    .option('--auth-header <header>', 'Authorization header value')
    .option('--environment <env>', 'Environment: production, sandbox')
    .option('--event-types <types>', 'Comma-separated event types')
    .option('--app-id <id>', 'Scope to specific app')
    .action(async (opts) => {
      const pid = requireProjectId(opts);
      const body: any = {
        name: opts.name,
        url: opts.url,
      };
      if (opts.authHeader) body.authorization_header = opts.authHeader;
      if (opts.environment) body.environment = opts.environment;
      if (opts.eventTypes) body.event_types = opts.eventTypes.split(',').map((s: string) => s.trim());
      if (opts.appId) body.app_id = opts.appId;

      const data = await api.post(`/projects/${pid}/integrations/webhooks`, body);
      output(data, () => printSuccess(`Webhook created: ${data.id}`));
    });

  cmd
    .command('update <webhookId>')
    .description('Update a webhook')
    .option('-p, --project <id>', 'Project ID')
    .option('--name <name>', 'New name')
    .option('--url <url>', 'New URL')
    .option('--auth-header <header>', 'New authorization header')
    .option('--environment <env>', 'New environment')
    .option('--event-types <types>', 'Comma-separated event types')
    .action(async (webhookId, opts) => {
      const pid = requireProjectId(opts);
      const body: any = {};
      if (opts.name) body.name = opts.name;
      if (opts.url) body.url = opts.url;
      if (opts.authHeader) body.authorization_header = opts.authHeader;
      if (opts.environment) body.environment = opts.environment;
      if (opts.eventTypes) body.event_types = opts.eventTypes.split(',').map((s: string) => s.trim());

      const data = await api.post(
        `/projects/${pid}/integrations/webhooks/${webhookId}`,
        body,
      );
      output(data, () => printSuccess(`Webhook ${webhookId} updated.`));
    });

  cmd
    .command('delete <webhookId>')
    .description('Delete a webhook')
    .option('-p, --project <id>', 'Project ID')
    .action(async (webhookId, opts) => {
      const pid = requireProjectId(opts);
      await api.del(`/projects/${pid}/integrations/webhooks/${webhookId}`);
      output(null, () => printSuccess(`Webhook ${webhookId} deleted.`));
    });
}

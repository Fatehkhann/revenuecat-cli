import { Command } from 'commander';
import * as config from '../config';
import { printSuccess, printTable, output } from '../output';

export function register(program: Command): void {
  const cmd = program
    .command('configure')
    .alias('config')
    .description('Configure CLI settings (API key, default project)');

  cmd
    .command('set')
    .description('Set configuration values')
    .option('--api-key <key>', 'RevenueCat API v2 secret key')
    .option('--project-id <id>', 'Default project ID')
    .action((opts) => {
      if (opts.apiKey) {
        config.setApiKey(opts.apiKey);
        printSuccess('API key saved.');
      }
      if (opts.projectId) {
        config.setProjectId(opts.projectId);
        printSuccess(`Default project set to: ${opts.projectId}`);
      }
      if (!opts.apiKey && !opts.projectId) {
        console.log('Provide --api-key and/or --project-id');
      }
    });

  cmd
    .command('show')
    .description('Show current configuration')
    .action(() => {
      const all = config.getAll();
      output(all, () => {
        printTable(
          ['Setting', 'Value'],
          Object.entries(all).map(([k, v]) => [k, String(v)]),
        );
      });
    });

  cmd
    .command('clear')
    .description('Clear all stored configuration')
    .action(() => {
      config.clearConfig();
      printSuccess('Configuration cleared.');
    });

  // Shorthand: rcat configure --api-key <key> --project-id <id>
  cmd
    .option('--api-key <key>', 'RevenueCat API v2 secret key')
    .option('--project-id <id>', 'Default project ID')
    .action((opts) => {
      if (opts.apiKey) {
        config.setApiKey(opts.apiKey);
        printSuccess('API key saved.');
      }
      if (opts.projectId) {
        config.setProjectId(opts.projectId);
        printSuccess(`Default project set to: ${opts.projectId}`);
      }
      if (!opts.apiKey && !opts.projectId) {
        const all = config.getAll();
        output(all, () => {
          printTable(
            ['Setting', 'Value'],
            Object.entries(all).map(([k, v]) => [k, String(v)]),
          );
        });
      }
    });
}

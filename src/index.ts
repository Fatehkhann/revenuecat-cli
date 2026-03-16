#!/usr/bin/env node

import { Command } from 'commander';
import { setJsonMode, printError } from './output';
import { ApiError } from './client';

import * as configure from './commands/configure';
import * as projects from './commands/projects';
import * as apps from './commands/apps';
import * as customers from './commands/customers';
import * as entitlements from './commands/entitlements';
import * as offerings from './commands/offerings';
import * as packages from './commands/packages';
import * as products from './commands/products';
import * as subscriptions from './commands/subscriptions';
import * as purchases from './commands/purchases';
import * as charts from './commands/charts';
import * as webhooks from './commands/webhooks';
import * as paywalls from './commands/paywalls';
import * as virtualCurrencies from './commands/virtual-currencies';
import * as auditLogs from './commands/audit-logs';
import * as collaborators from './commands/collaborators';

const program = new Command();

program
  .name('rcat')
  .description('Unofficial CLI for RevenueCat REST API v2')
  .version('0.1.0')
  .option('--json', 'Output raw JSON')
  .option('-p, --project <id>', 'Project ID (overrides configured default)')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.json) setJsonMode(true);
  });

// Register all command groups
configure.register(program);
projects.register(program);
apps.register(program);
customers.register(program);
entitlements.register(program);
offerings.register(program);
packages.register(program);
products.register(program);
subscriptions.register(program);
purchases.register(program);
charts.register(program);
webhooks.register(program);
paywalls.register(program);
virtualCurrencies.register(program);
auditLogs.register(program);
collaborators.register(program);

// Global error handler
const originalParse = program.parseAsync.bind(program);
program.parseAsync = async (argv?: string[]) => {
  try {
    return await originalParse(argv);
  } catch (err: any) {
    if (err instanceof ApiError) {
      printError(`[${err.status}] ${err.message}`);
      if (err.docUrl) printError(`Docs: ${err.docUrl}`);
      if (err.retryable) printError('This error is retryable.');
      process.exit(1);
    } else {
      printError(err.message || String(err));
      process.exit(1);
    }
  }
};

program.parseAsync(process.argv);

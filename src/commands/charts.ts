import { Command } from 'commander';
import * as api from '../client';
import { output, printTable, printInfo } from '../output';
import { requireProjectId } from '../helpers';

const CHART_NAMES = [
  'actives', 'actives_movement', 'actives_new', 'arr', 'churn',
  'cohort_explorer', 'conversion_to_paying', 'customers_new',
  'ltv_per_customer', 'ltv_per_paying_customer', 'mrr', 'mrr_movement',
  'refund_rate', 'revenue', 'subscription_retention', 'subscription_status',
  'trials', 'trials_movement', 'trials_new', 'customers_active',
  'trial_conversion_rate',
];

export function register(program: Command): void {
  const cmd = program.command('charts').alias('metrics').description('Charts & metrics');

  cmd
    .command('overview')
    .description('Get overview metrics')
    .option('-p, --project <id>', 'Project ID')
    .action(async (opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(`/projects/${pid}/metrics/overview`);
      output(data, () => {
        const metrics = data.metrics || data;
        if (Array.isArray(metrics)) {
          printTable(
            ['Metric', 'Value', 'Change'],
            metrics.map((m: any) => [
              m.name || m.id || '-',
              m.value?.toString() || '-',
              m.delta?.toString() || '-',
            ]),
          );
        } else {
          console.log(JSON.stringify(metrics, null, 2));
        }
      });
    });

  cmd
    .command('get <chartName>')
    .description(`Get chart data. Charts: ${CHART_NAMES.join(', ')}`)
    .option('-p, --project <id>', 'Project ID')
    .option('--start-date <date>', 'Start date (YYYY-MM-DD)')
    .option('--end-date <date>', 'End date (YYYY-MM-DD)')
    .option('--resolution <res>', 'Resolution: day, week, month')
    .option('--currency <code>', 'Currency code (USD, EUR, etc.)')
    .option('--segment <dim>', 'Segment dimension')
    .option('--filters <json>', 'Filters as JSON array')
    .option('--selectors <json>', 'Selectors as JSON object')
    .option('--aggregate <agg>', 'Aggregate: average, total')
    .action(async (chartName, opts) => {
      const pid = requireProjectId(opts);
      const query: Record<string, string> = {};
      if (opts.startDate) query.start_date = opts.startDate;
      if (opts.endDate) query.end_date = opts.endDate;
      if (opts.resolution) query.resolution = opts.resolution;
      if (opts.currency) query.currency = opts.currency;
      if (opts.segment) query.segment = opts.segment;
      if (opts.filters) query.filters = opts.filters;
      if (opts.selectors) query.selectors = opts.selectors;
      if (opts.aggregate) query.aggregate = opts.aggregate;

      const data = await api.get(`/projects/${pid}/charts/${chartName}`, query);
      output(data, () => {
        if (data.values && Array.isArray(data.values)) {
          const headers = data.values[0] ? Object.keys(data.values[0]) : ['Date', 'Value'];
          printTable(
            headers,
            data.values.map((v: any) =>
              headers.map((h: string) => String(v[h] ?? '-')),
            ),
          );
        } else {
          console.log(JSON.stringify(data, null, 2));
        }
      });
    });

  cmd
    .command('options <chartName>')
    .description('Get chart options (available filters, segments, etc.)')
    .option('-p, --project <id>', 'Project ID')
    .action(async (chartName, opts) => {
      const pid = requireProjectId(opts);
      const data = await api.get(`/projects/${pid}/charts/${chartName}/options`);
      output(data, () => {
        console.log(JSON.stringify(data, null, 2));
      });
    });

  cmd
    .command('list-charts')
    .alias('ls')
    .description('List available chart names')
    .action(() => {
      output(CHART_NAMES, () => {
        printInfo('Available charts:');
        printTable(
          ['Chart Name'],
          CHART_NAMES.map((c) => [c]),
        );
      });
    });
}

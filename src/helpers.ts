import { getProjectId } from './config';

export function requireProjectId(opts: any): string {
  const id = opts.project || getProjectId();
  if (!id) {
    throw new Error(
      'No project ID set. Use --project <id> or run: rcat configure --project-id <id>',
    );
  }
  return id;
}

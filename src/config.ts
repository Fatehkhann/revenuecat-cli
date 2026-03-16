import Conf from 'conf';

const config = new Conf({
  projectName: 'revenuecat-cli',
  schema: {
    apiKey: { type: 'string', default: '' },
    projectId: { type: 'string', default: '' },
  },
});

export function getApiKey(): string {
  return process.env.RCAT_API_KEY || (config.get('apiKey') as string) || '';
}

export function setApiKey(key: string): void {
  config.set('apiKey', key);
}

export function getProjectId(): string {
  return process.env.RCAT_PROJECT_ID || (config.get('projectId') as string) || '';
}

export function setProjectId(id: string): void {
  config.set('projectId', id);
}

export function clearConfig(): void {
  config.clear();
}

export function getAll(): Record<string, unknown> {
  return {
    apiKey: getApiKey() ? '****' + getApiKey().slice(-8) : '(not set)',
    projectId: getProjectId() || '(not set)',
    configPath: config.path,
  };
}

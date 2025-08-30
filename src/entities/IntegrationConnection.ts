export interface IIntegrationConnection {
  id: string;
  name: string;
  type: 'email' | 'slack';
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  config: Record<string, unknown>;
}

export interface EmailIntegrationConfig {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  apiKey?: string;
  fromEmail: string;
  fromName?: string;
  tls?: boolean;
}

export interface SlackIntegrationConfig {
  botToken: string;
  appToken?: string;
  workspace: string;
  channels?: string[];
  defaultChannel?: string;
}

export class IntegrationConnection implements IIntegrationConnection {
  public id: string;
  public name: string;
  public type: 'email' | 'slack';
  public config: Record<string, unknown>;
  public description?: string;
  public isActive: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    name: string,
    type: 'email' | 'slack',
    config: EmailIntegrationConfig | SlackIntegrationConfig,
    description?: string,
    isActive: boolean = true,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.config = config as unknown as Record<string, unknown>;
    this.description = description;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromJSON(json: Record<string, unknown>): IntegrationConnection {
    return new IntegrationConnection(
      json.id as string,
      json.name as string,
      json.type as 'email' | 'slack',
      json.config as EmailIntegrationConfig | SlackIntegrationConfig,
      json.description as string,
      json.isActive as boolean,
      new Date(json.createdAt as string),
      new Date(json.updatedAt as string)
    );
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      description: this.description,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      config: this.config
    };
  }

  // Validate integration configuration
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name.trim()) {
      errors.push('Integration name is required');
    }

    if (this.type === 'email') {
      const config = this.config as unknown as EmailIntegrationConfig;
      if (!config.fromEmail) {
        errors.push('From email address is required');
      }
      if (config.provider === 'smtp' && !config.host) {
        errors.push('SMTP host is required');
      }
      if ((config.provider === 'sendgrid' || config.provider === 'mailgun') && !config.apiKey) {
        errors.push('API key is required for this email provider');
      }
    } else if (this.type === 'slack') {
      const config = this.config as unknown as SlackIntegrationConfig;
      if (!config.botToken) {
        errors.push('Slack bot token is required');
      }
      if (!config.workspace) {
        errors.push('Slack workspace is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Test integration connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (this.type === 'email') {
        // TODO: Implement email test connection
        return { success: true, message: 'Email configuration looks valid' };
      } else if (this.type === 'slack') {
        // TODO: Implement Slack test connection
        return { success: true, message: 'Slack configuration looks valid' };
      }
      return { success: false, message: 'Unknown integration type' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  }
}

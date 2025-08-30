// Mock database connection entity
export class DatabaseConnection {
  static connections: DatabaseConnection[] = [];
  
  id?: string;
  name!: string;
  type!: 'postgresql' | 'mysql';
  host!: string;
  port!: number;
  database!: string;
  username!: string;
  password!: string;
  is_active!: boolean;

  constructor(data: Partial<DatabaseConnection>) {
    Object.assign(this, data);
    this.id = this.id || Math.random().toString(36).substr(2, 9);
    if (this.is_active === undefined) this.is_active = true;
  }

  static async list(): Promise<DatabaseConnection[]> {
    // Mock data for development
    const mockData = [
      {
        id: '1',
        name: 'Production Database',
        type: 'postgresql' as const,
        host: 'localhost',
        port: 5432,
        database: 'production',
        username: 'admin',
        password: 'password',
        is_active: true
      },
      {
        id: '2',
        name: 'Development Database',
        type: 'mysql' as const,
        host: 'localhost',
        port: 3306,
        database: 'development',
        username: 'dev',
        password: 'devpass',
        is_active: true
      }
    ];

    const mockConnections = mockData.map(data => new DatabaseConnection(data));

    // Return existing connections or mock data
    return this.connections.length > 0 ? this.connections : mockConnections;
  }

  static async create(data: Partial<DatabaseConnection>): Promise<DatabaseConnection> {
    const connection = new DatabaseConnection(data);
    this.connections.push(connection);
    return connection;
  }

  static async update(id: string, data: Partial<DatabaseConnection>): Promise<DatabaseConnection> {
    const index = this.connections.findIndex(c => c.id === id);
    if (index !== -1) {
      Object.assign(this.connections[index], data);
      return this.connections[index];
    }
    throw new Error('Connection not found');
  }

  static async delete(id: string): Promise<void> {
    this.connections = this.connections.filter(c => c.id !== id);
  }

  async save(): Promise<DatabaseConnection> {
    if (this.id) {
      return DatabaseConnection.update(this.id, this);
    } else {
      return DatabaseConnection.create(this);
    }
  }
}

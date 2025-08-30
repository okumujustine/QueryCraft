// Mock saved query entity
export class SavedQuery {
  static queries: SavedQuery[] = [];
  
  id?: string;
  name!: string;
  sql!: string;
  connection_id!: string;
  description?: string;
  last_executed?: string;

  constructor(data: Partial<SavedQuery>) {
    Object.assign(this, data);
    this.id = this.id || Math.random().toString(36).substr(2, 9);
  }

  static async list(): Promise<SavedQuery[]> {
    // Mock data for development
    const mockData = [
      {
        id: '1',
        name: 'Active Users Report',
        sql: 'SELECT * FROM users WHERE status = "active" ORDER BY last_login DESC;',
        connection_id: '1',
        description: 'Get all active users sorted by last login',
        last_executed: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      },
      {
        id: '2',
        name: 'Monthly Sales Summary',
        sql: 'SELECT DATE_FORMAT(created_at, "%Y-%m") as month, SUM(total) as monthly_total FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY month ORDER BY month DESC;',
        connection_id: '2',
        description: 'Monthly sales totals for the last 12 months',
        last_executed: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      },
      {
        id: '3',
        name: 'User Registration Stats',
        sql: 'SELECT DATE(created_at) as date, COUNT(*) as new_users FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY DATE(created_at) ORDER BY date;',
        connection_id: '1',
        description: 'Daily user registration counts for the last 30 days'
      }
    ];

    const mockQueries = mockData.map(data => new SavedQuery(data));

    // Return existing queries or mock data
    return this.queries.length > 0 ? this.queries : mockQueries;
  }

  static async create(data: Partial<SavedQuery>): Promise<SavedQuery> {
    const query = new SavedQuery(data);
    this.queries.push(query);
    return query;
  }

  static async update(id: string, data: Partial<SavedQuery>): Promise<SavedQuery> {
    const index = this.queries.findIndex(q => q.id === id);
    if (index !== -1) {
      Object.assign(this.queries[index], data);
      return this.queries[index];
    }
    throw new Error('Query not found');
  }

  static async delete(id: string): Promise<void> {
    this.queries = this.queries.filter(q => q.id !== id);
  }

  async save(): Promise<SavedQuery> {
    if (this.id) {
      return SavedQuery.update(this.id, this);
    } else {
      return SavedQuery.create(this);
    }
  }
}

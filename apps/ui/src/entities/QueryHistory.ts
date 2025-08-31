// Mock query history entity
export class QueryHistory {
  static history: QueryHistory[] = [];
  
  id?: string;
  sql!: string;
  connection_id!: string;
  execution_time?: number;
  row_count?: number;
  status!: 'success' | 'error';
  error_message?: string;
  created_date?: string;

  constructor(data: Partial<QueryHistory>) {
    Object.assign(this, data);
    this.id = this.id || Math.random().toString(36).substr(2, 9);
    this.created_date = this.created_date || new Date().toISOString();
  }

  static async list(orderBy: string = '-created_date', limit: number = 100): Promise<QueryHistory[]> {
    // Mock data for development
    const mockData = [
      {
        id: '1',
        sql: 'SELECT * FROM users WHERE status = "active" LIMIT 10;',
        connection_id: '1',
        execution_time: 125,
        row_count: 8,
        status: 'success' as const,
        created_date: new Date(Date.now() - 1000 * 60 * 5).toISOString()
      },
      {
        id: '2',
        sql: 'SELECT COUNT(*) FROM orders WHERE created_at > "2024-01-01";',
        connection_id: '2',
        execution_time: 87,
        row_count: 1,
        status: 'success' as const,
        created_date: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      },
      {
        id: '3',
        sql: 'SELECT * FROM non_existent_table;',
        connection_id: '1',
        execution_time: 45,
        row_count: 0,
        status: 'error' as const,
        error_message: 'Table "non_existent_table" does not exist',
        created_date: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: '4',
        sql: 'UPDATE users SET last_login = NOW() WHERE id = 123;',
        connection_id: '1',
        execution_time: 67,
        row_count: 1,
        status: 'success' as const,
        created_date: new Date(Date.now() - 1000 * 60 * 60).toISOString()
      },
      {
        id: '5',
        sql: 'SELECT u.name, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id;',
        connection_id: '2',
        execution_time: 234,
        row_count: 156,
        status: 'success' as const,
        created_date: new Date(Date.now() - 1000 * 60 * 90).toISOString()
      }
    ];

    const mockHistory = mockData.map(data => new QueryHistory(data));

    // Use existing history or mock data
    const result = this.history.length > 0 ? this.history : mockHistory;

    // Simple sorting (in a real app, this would be done by the database)
    if (orderBy.startsWith('-')) {
      const field = orderBy.substring(1);
      result.sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const aVal = (a as any)[field];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bVal = (b as any)[field];
        return new Date(bVal).getTime() - new Date(aVal).getTime();
      });
    }

    return result.slice(0, limit);
  }

  static async create(data: Partial<QueryHistory>): Promise<QueryHistory> {
    const historyItem = new QueryHistory(data);
    this.history.unshift(historyItem); // Add to beginning for newest first
    return historyItem;
  }

  async save(): Promise<QueryHistory> {
    if (this.id) {
      // Update existing
      const index = QueryHistory.history.findIndex(h => h.id === this.id);
      if (index !== -1) {
        QueryHistory.history[index] = this;
      }
      return this;
    } else {
      return QueryHistory.create(this);
    }
  }
}

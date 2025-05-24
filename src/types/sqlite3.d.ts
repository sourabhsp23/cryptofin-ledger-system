
declare module 'sqlite3' {
  namespace sqlite3 {
    interface RunResult {
      lastID: number;
      changes: number;
    }

    class Statement {
      bind(...params: any[]): this;
      reset(): this;
      finalize(callback?: (err: Error | null) => void): void;
      run(...params: any[]): this;
      get(...params: any[]): this;
      all(...params: any[]): this;
      each(...params: any[]): this;
    }

    class Database {
      constructor(filename: string, callback?: (err: Error | null) => void);
      run(sql: string, params: any[], callback?: (this: RunResult, err: Error | null) => void): this;
      run(sql: string, callback?: (this: RunResult, err: Error | null) => void): this;
      get(sql: string, params: any[], callback?: (err: Error | null, row: any) => void): this;
      get(sql: string, callback?: (err: Error | null, row: any) => void): this;
      all(sql: string, params: any[], callback?: (err: Error | null, rows: any[]) => void): this;
      all(sql: string, callback?: (err: Error | null, rows: any[]) => void): this;
      each(sql: string, params: any[], callback?: (err: Error | null, row: any) => void): this;
      each(sql: string, callback?: (err: Error | null, row: any) => void): this;
      exec(sql: string, callback?: (err: Error | null) => void): this;
      prepare(sql: string, params?: any[], callback?: (err: Error | null, statement: Statement) => void): Statement;
      prepare(sql: string, callback?: (err: Error | null, statement: Statement) => void): Statement;
      close(callback?: (err: Error | null) => void): void;
      configure(option: string, value: any): void;
      loadExtension(path: string, callback?: (err: Error | null) => void): void;
      serialize(callback?: () => void): void;
      parallelize(callback?: () => void): void;
      on(event: string, listener: (...args: any[]) => void): this;
    }
  }

  // Export the namespace so it can be used as both a namespace and a constructor
  const sqlite3: {
    OPEN_READONLY: number;
    OPEN_READWRITE: number;
    OPEN_CREATE: number;
    OPEN_FULLMUTEX: number;
    OPEN_URI: number;
    OPEN_SHAREDCACHE: number;
    OPEN_PRIVATECACHE: number;
    Database: typeof sqlite3.Database;
    Statement: typeof sqlite3.Statement;
    cached: {
      Database: typeof sqlite3.Database;
    };
    verbose(): typeof sqlite3;
  };

  export = sqlite3;
}

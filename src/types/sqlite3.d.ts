
declare module 'sqlite3' {
  export namespace sqlite3 {
    export class Database {
      constructor(filename: string, callback?: (err: Error | null) => void);
      run(sql: string, params: any[], callback?: Function): this;
      get(sql: string, params: any[], callback?: (err: Error | null, row: any) => void): this;
      all(sql: string, params: any[], callback?: (err: Error | null, rows: any[]) => void): this;
      close(callback?: (err: Error | null) => void): void;
    }
  }

  export = sqlite3;
}

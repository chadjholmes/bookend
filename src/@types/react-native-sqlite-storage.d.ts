declare module "react-native-sqlite-storage" {
  export interface SQLiteDatabase {
    transaction(callback: (tx: SQLTransaction) => void): Promise<void>;
    executeSql(sql: string, params?: any[]): Promise<[SQLResultSet]>;
    close(): Promise<void>;
  }

  export interface SQLTransaction {
    executeSql(
      sql: string,
      params?: any[],
      success?: (tx: SQLTransaction, results: SQLResultSet) => void,
      error?: (error: Error) => void
    ): void;
  }

  export interface SQLResultSet {
    insertId?: number;
    rowsAffected: number;
    rows: {
      length: number;
      item: (idx: number) => any;
      raw: () => any[];
    };
  }

  export interface SQLiteParams {
    name: string;
    location?: string;
    createFromLocation?: number | string;
  }

  export function openDatabase(
    params: SQLiteParams,
    success?: (db: SQLiteDatabase) => void,
    error?: (error: Error) => void
  ): Promise<SQLiteDatabase>;

  export function enablePromise(enabled: boolean): void;
} 
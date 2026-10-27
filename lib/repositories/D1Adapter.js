import { logger, classifyError } from "../observability/logger.js";
import { isD1Binding, getRuntimeD1Binding } from "../auth/betterAuthEngine.js";

export { isD1Binding, getRuntimeD1Binding };

function safeErrorDetails(error, operation) {
  const classification = classifyError(error);
  const rawCode = error?.code || classification?.code || "DATABASE_ERROR";
  const code =
    typeof rawCode === "string" && rawCode.length < 50 && !rawCode.includes("@") && !rawCode.includes(" ")
      ? rawCode
      : "DATABASE_ERROR";
  return {
    operation,
    code,
    category: classification?.category || "DATABASE_ERROR",
  };
}

let getCloudflareContext = null;
try {
  const cfModule = await import("@opennextjs/cloudflare");
  getCloudflareContext = cfModule.getCloudflareContext;
} catch {}

/**
 * D1Adapter establishes the controlled boundary for accessing Cloudflare D1.
 * This ensures that business logic and Repositories are decoupled from direct database drivers,
 * enabling easier testing, consistent error handling, and future-proofing.
 */
export class D1Adapter {
  constructor(db) {
    this.db = getRuntimeD1Binding(db);
  }

  _checkDb() {
    if (!this.db || typeof this.db !== "object" || typeof this.db.prepare !== "function") {
      this.db = getRuntimeD1Binding(this.db);
      if (!this.db || typeof this.db !== "object" || typeof this.db.prepare !== "function") {
        const err = new Error("D1 Database binding is missing. Ensure env.DB is provided.");
        err.code = "D1_BINDING_MISSING";
        throw err;
      }
    }
  }

  /**
   * Executes a query that returns multiple rows.
   */
  async query(sql, params = []) {
    this._checkDb();
    try {
      const stmt = this.db.prepare(sql).bind(...params);
      const { results } = await stmt.all();
      return results;
    } catch (error) {
      logger.error("D1_QUERY_ERROR", safeErrorDetails(error, "query"));
      const err = new Error("Database query failed", { cause: error });
      if (error?.code) err.code = error.code;
      throw err;
    }
  }

  /**
   * Executes a query that returns a single row.
   */
  async queryOne(sql, params = []) {
    this._checkDb();
    try {
      const stmt = this.db.prepare(sql).bind(...params);
      return await stmt.first();
    } catch (error) {
      logger.error("D1_QUERY_ONE_ERROR", safeErrorDetails(error, "queryOne"));
      const err = new Error("Database query failed", { cause: error });
      if (error?.code) err.code = error.code;
      throw err;
    }
  }

  /**
   * Executes an insert, update, or delete operation.
   */
  async execute(sql, params = []) {
    this._checkDb();
    try {
      const stmt = this.db.prepare(sql).bind(...params);
      const { success, meta } = await stmt.run();
      return { success, meta };
    } catch (error) {
      logger.error("D1_EXECUTE_ERROR", safeErrorDetails(error, "execute"));
      const err = new Error("Database execution failed", { cause: error });
      if (error?.code) err.code = error.code;
      throw err;
    }
  }

  /**
   * Executes a batch of statements in a single transaction-like block.
   */
  async batch(statements) {
    this._checkDb();
    try {
      const preparedStatements = statements.map((stmt) => {
        if (stmt && stmt.sql) {
          return this.db.prepare(stmt.sql).bind(...(stmt.params || []));
        }
        return stmt;
      });
      const batchResult = await this.db.batch(preparedStatements);
      return batchResult;
    } catch (error) {
      logger.error("D1_BATCH_ERROR", safeErrorDetails(error, "batch"));
      const err = new Error("Database batch execution failed", { cause: error });
      if (error?.code) err.code = error.code;
      throw err;
    }
  }
}

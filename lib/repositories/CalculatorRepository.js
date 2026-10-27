// lib/repositories/CalculatorRepository.js
import { BaseRepository } from './BaseRepository.js';

export class CalculatorRepository extends BaseRepository {
  constructor(adapter) {
    super(adapter, 'calculator_results');
  }

  /**
   * Replaces PostgreSQL RPC: upsert_calculator_result
   * Inserts the new result and marks older ones is_latest = 0 for the same user and calculator.
   */
  async upsertCalculatorResult(userId, calculatorId, inputData, resultData) {
    this._validateUser(userId);

    const newResultId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const statements = [
      // 1. Mark existing latest as not latest
      {
        sql: `UPDATE calculator_results SET is_latest = 0, update_at = CURRENT_TIMESTAMP WHERE user_id = ? AND calculator_id = ? AND is_latest = 1 AND deleted_at IS NULL`,
        params: [userId, calculatorId]
      },
      // 2. Insert new result
      {
        sql: `INSERT INTO calculator_results (id, user_id, calculator_id, input_data, result_data, is_latest, created_at, update_at)
         VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        params: [newResultId, userId, calculatorId, JSON.stringify(inputData), JSON.stringify(resultData)]
      }
    ];

    await this.adapter.batch(statements);

    return this.findById(newResultId, userId);
  }

  /**
   * Convenience alias for upsertCalculatorResult
   */
  async saveResult(userId, calculatorId, inputData, resultData) {
    return this.upsertCalculatorResult(userId, calculatorId, inputData, resultData);
  }

  /**
   * Gets history of calculator results for a specific user and calculator.
   */
  async getCalculatorHistory(userId, calculatorId, limit = 7) {
    this._validateUser(userId);
    const sql = `
      SELECT id, calculator_id, result_data, input_data, is_latest, created_at 
      FROM calculator_results 
      WHERE user_id = ? AND calculator_id = ? AND deleted_at IS NULL
      ORDER BY created_at DESC 
      LIMIT ?
    `;
    const rows = await this.adapter.query(sql, [userId, calculatorId, limit]);
    
    // Parse JSON fields
    return rows.map(row => ({
      ...row,
      calculator_type: row.calculator_id,
      result_data: typeof row.result_data === 'string' ? JSON.parse(row.result_data) : row.result_data,
      input_data: typeof row.input_data === 'string' ? JSON.parse(row.input_data) : row.input_data,
    }));
  }

  /**
   * Convenience alias for getCalculatorHistory
   */
  async getHistory(userId, calculatorId, limit = 7) {
    return this.getCalculatorHistory(userId, calculatorId, limit);
  }
}

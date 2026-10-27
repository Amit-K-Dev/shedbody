-- D1 Schema Migration for calculator_results

CREATE TABLE IF NOT EXISTS calculator_results (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    calculator_id TEXT NOT NULL,
    input_data TEXT NOT NULL,
    result_data TEXT NOT NULL,
    is_latest INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_calculator_results_user_id ON calculator_results (user_id);
CREATE INDEX IF NOT EXISTS idx_calculator_results_calc_id ON calculator_results (calculator_id);
CREATE INDEX IF NOT EXISTS idx_calculator_results_user_calc_latest ON calculator_results (user_id, calculator_id, is_latest) WHERE is_latest = 1 AND deleted_at IS NULL;

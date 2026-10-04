/**
 * Adapter to read from the canonical vw_metric_entries_latest EAV projection
 * and pivot rows back into the legacy columnar shapes expected by the app.
 */

export class MetricReadAdapter {
  /**
   * Fetches and pivots metrics for a user.
   * Internal reusable query builder.
   */
  static async _fetchAndPivot({ supabase, userId }, metricIds, { startDate, endDate, limit, orderAsc = false } = {}) {
    if (!userId || !metricIds || metricIds.length === 0) return [];
    if (!supabase) throw new Error("supabase client is required");

    let query = supabase
      .from('vw_metric_entries_latest')
      .select('metric_id, log_date, value_numeric, deleted_at')
      .eq('user_id', userId)
      .in('metric_id', metricIds)
      .is('deleted_at', null); // IMPORTANT: App-level tombstone filtering
      
    if (startDate) query = query.gte('log_date', startDate);
    if (endDate) query = query.lte('log_date', endDate);
    
    // The view guarantees one row per metric per date.
    // Order by log_date so grouping preserves chronological sequence.
    query = query.order('log_date', { ascending: orderAsc });

    const { data, error } = await query;
    
    if (error) {
      console.error("[MetricReadAdapter] Error fetching metrics:", error);
      return [];
    }
    
    if (!data || data.length === 0) return [];

    // Group by log_date
    // Using a Map or object, preserving the ordered insert
    const grouped = new Map();
    for (const row of data) {
      if (!grouped.has(row.log_date)) {
        grouped.set(row.log_date, { log_date: row.log_date });
      }
      grouped.get(row.log_date)[row.metric_id] = row.value_numeric;
    }

    const results = Array.from(grouped.values());
    
    if (limit) {
      return results.slice(0, limit);
    }
    
    return results;
  }

  /**
   * Progress Reader
   * Maps log_date -> entry_date
   */
  static async getProgress({ supabase, userId }, options = {}) {
    try {
      const raw = await this._fetchAndPivot({ supabase, userId }, ['weight', 'body_fat'], options);
      return raw.map(row => {
        const out = { entry_date: row.log_date };
        if (row.weight !== undefined) out.weight = row.weight;
        if (row.body_fat !== undefined) out.body_fat = row.body_fat;
        return out;
      });
    } catch (err) {
      console.error("MetricReadAdapter getProgress crash:", err);
      return [];
    }
  }

  /**
   * Nutrition Reader
   */
  static async getNutrition({ supabase, userId }, options = {}) {
    try {
      const raw = await this._fetchAndPivot({ supabase, userId }, ['calories', 'protein', 'water'], options);
      return raw.map(row => {
        const out = { log_date: row.log_date };
        if (row.calories !== undefined) out.calories_consumed = row.calories;
        if (row.protein !== undefined) out.protein_consumed = row.protein;
        if (row.water !== undefined) out.water_ml = row.water;
        return out;
      });
    } catch (err) {
      console.error("MetricReadAdapter getNutrition crash:", err);
      return [];
    }
  }

  /**
   * Lifestyle Reader
   */
  static async getLifestyle({ supabase, userId }, options = {}) {
    try {
      const raw = await this._fetchAndPivot({ supabase, userId }, ['steps', 'sleep', 'workout'], options);
      return raw.map(row => {
        const out = { log_date: row.log_date };
        if (row.steps !== undefined) out.steps_count = row.steps;
        if (row.sleep !== undefined) out.sleep_hours = row.sleep;
        
        if (row.workout !== undefined) {
          if (row.workout === 1.0) {
            out.workout_completed = true;
          } else if (row.workout === 0.0) {
            out.workout_completed = false;
          } else {
            console.warn(`[MetricReadAdapter] Invalid workout boolean representation: ${row.workout}. Ignoring.`);
            // Invalid values are ignored to prevent accidentally interpreting bad data as false/true.
          }
        }
        return out;
      });
    } catch (err) {
      console.error("MetricReadAdapter getLifestyle crash:", err);
      return [];
    }
  }
}

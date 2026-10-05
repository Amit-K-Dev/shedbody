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
      .select('metric_id, log_date, value_numeric, deleted_at, id, created_at')
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
        grouped.set(row.log_date, { log_date: row.log_date, _metadata: {} });
      }
      grouped.get(row.log_date)[row.metric_id] = row.value_numeric;
      grouped.get(row.log_date)._metadata[row.metric_id] = {
        id: row.id,
        created_at: row.created_at
      };
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
        const out = { entry_date: row.log_date, notes: null }; // Legacy stub
        
        // Expose metadata identity of the underlying metric
        // Downstream timeline strictly parses this as a 'weight' event, so adopting the weight metric's ID perfectly aligns semantics.
        if (row.weight !== undefined) {
          out.weight = row.weight;
          out.id = row._metadata.weight.id;
          out.created_at = row._metadata.weight.created_at;
        } else if (row.body_fat !== undefined) {
          out.id = row._metadata.body_fat.id;
          out.created_at = row._metadata.body_fat.created_at;
        }
        
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

  /**
   * Specialized reader for the Notification Engine
   * Fetches the absolute latest canonical record for each required metric globally.
   * Uses independent .limit(1) queries per metric to prevent dense metrics from truncating sparse metrics.
   * Fixes a legacy bug where deleted_at wasn't filtered.
   */
  static async getLatestAnchors({ supabase, userId }) {
    if (!userId || !supabase) return { habitEntries: [], lifestyleLogs: [], nutritionLogs: [], progressEntries: [] };

    try {
      const metrics = ['workout', 'steps', 'sleep', 'water', 'protein', 'weight'];
      const queries = metrics.map(metric => 
        supabase
          .from('vw_metric_entries_latest')
          .select('metric_id, log_date, value_numeric')
          .eq('user_id', userId)
          .eq('metric_id', metric)
          .is('deleted_at', null)
          .gt('value_numeric', 0) // Fits steps, sleep, water, protein, workout(1.0). Weight natively works.
          .order('log_date', { ascending: false })
          .limit(1)
      );

      const results = await Promise.all(queries);

      // Memory pivot
      const latest = {};
      results.forEach((res, index) => {
        if (!res.error && res.data && res.data.length > 0) {
          latest[metrics[index]] = res.data[0];
        }
      });

      return {
        lifestyleLogs: [
          latest['workout'] ? { log_date: latest['workout'].log_date, workout_completed: true } : null,
          latest['steps'] ? { log_date: latest['steps'].log_date, steps_count: latest['steps'].value_numeric } : null,
          latest['sleep'] ? { log_date: latest['sleep'].log_date, sleep_hours: latest['sleep'].value_numeric } : null
        ].filter(Boolean),

        nutritionLogs: [
          latest['water'] ? { log_date: latest['water'].log_date, water_ml: latest['water'].value_numeric } : null,
          latest['protein'] ? { log_date: latest['protein'].log_date, protein_consumed: latest['protein'].value_numeric } : null
        ].filter(Boolean),

        habitEntries: [], // Explicit habits like meditation are handled via habit_entries table directly in anchors.js

        progressEntries: [
          latest['weight'] ? { entry_date: latest['weight'].log_date, weight: latest['weight'].value_numeric } : null
        ].filter(Boolean)
      };
    } catch (err) {
      console.error("MetricReadAdapter getLatestAnchors crash:", err);
      return { habitEntries: [], lifestyleLogs: [], nutritionLogs: [], progressEntries: [] };
    }
  }
}

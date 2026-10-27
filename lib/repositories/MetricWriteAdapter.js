
/**
 * Centralized Write Adapter for the EAV Metric Ledger.
 * Supports sparse writes, atomic multi-metric inserts, 
 * target snapshot preservation, and tombstone deletion.
 */
export class MetricWriteAdapter {
  /**
   * Commits an array of metric changes securely.
   * Only processes metrics that are explicitly provided in the payload.
   * `undefined` values are ignored.
   * `null` values are treated as explicit clears (tombstones).
   * 
   * @param {Object} ctx 
   * @param {Object} ctx.supabase - Authenticated Supabase client
   * @param {string} ctx.userId - The authenticated user's ID
   * @param {string} ctx.logDate - YYYY-MM-DD calendar date
   * @param {Object} payload - Map of metric IDs to their new values (or null for clear)
   * @param {string} source - Source of the write ('manual', 'device', 'system')
   */
  static async commit({ supabase, userId, logDate }, payload, source = 'manual') {
    if (!supabase || !userId || !logDate) {
      throw new Error("Missing required context (supabase, userId, logDate).");
    }

    const rows = [];
    const now = new Date().toISOString();
    
    // We only need to fetch plans if calories or protein are being modified
    let activePlan = null;
    let fetchedPlan = false;

    // Define valid metrics and their mapping constraints
    const metricConstraints = {
      weight: { type: 'numeric' },
      body_fat: { type: 'numeric' },
      calories: { type: 'numeric', requiresSnapshot: true },
      protein: { type: 'numeric', requiresSnapshot: true },
      water: { type: 'numeric' },
      steps: { type: 'numeric' },
      sleep: { type: 'numeric' },
      workout: { type: 'boolean' }
    };

    for (const [metricId, value] of Object.entries(payload)) {
      if (value === undefined) continue; // Sparse update: Ignore omitted fields
      if (!metricConstraints[metricId]) continue; // Ignore unknown metrics

      const constraint = metricConstraints[metricId];
      let valueNumeric = null;
      let isDeleted = false;

      // Handle explicit clear (tombstone)
      if (value === null || value === "") {
        isDeleted = true;
      } else {
        // Parse value based on expected type
        if (constraint.type === 'boolean') {
          valueNumeric = value ? 1.0 : 0.0;
        } else {
          valueNumeric = Number(value);
          if (isNaN(valueNumeric) || !Number.isFinite(valueNumeric)) {
            console.error(`Invalid numeric value for metric ${metricId}:`, value);
            continue; // Skip invalid values
          }
        }
      }

      // Metadata for target snapshots
      let metadata = null;
      if (constraint.requiresSnapshot && !isDeleted) {
        if (!fetchedPlan) {
          const { data: planData } = await supabase
            .from('plans')
            .select('calories, protein')
            .eq('user_id', userId)
            .eq('is_active', true)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
            
          activePlan = planData;
          fetchedPlan = true;
        }

        if (activePlan) {
          metadata = {
            target_calories_snapshot: activePlan.calories,
            target_protein_snapshot: activePlan.protein
          };
        }
      }

      // Construct EAV row
      rows.push({
        user_id: userId,
        metric_id: metricId,
        log_date: logDate,
        value_numeric: isDeleted ? null : valueNumeric,
        source: source,
        metadata: metadata, // JSONB
        recorded_at: now,
        created_at: now,
        deleted_at: isDeleted ? now : null
      });
    }

    if (rows.length === 0) return { data: [], error: null }; // Nothing to do

    // Bulk atomic insert
    const { data, error } = await supabase
      .from('metric_entries')
      .insert(rows)
      .select();

    if (error) {
      console.error("[MetricWriteAdapter] Bulk insert failed:", error);
      throw error;
    }

    return { data, error: null };
  }
}

import test from 'node:test';
import assert from 'node:assert';
import { MetricReadAdapter } from './MetricReadAdapter.js';

/**
 * Mocks a Supabase chain
 */
function mockSupabase(mockData) {
  return {
    from: (table) => {
      assert.strictEqual(table, 'vw_metric_entries_latest', 'Must query canonical view');
      const chain = {
        _eq: {},
        select: () => chain,
        eq: (field, value) => {
          chain._eq[field] = value;
          return chain;
        },
        in: (field, values) => {
          return chain;
        },
        is: (field, value) => {
          if (field === 'deleted_at' && value === null) {
            chain.filterTombstones = true;
          }
          return chain;
        },
        gt: (field, value) => {
          chain._gt = { field, value };
          return chain;
        },
        gte: () => chain,
        lte: () => chain,
        order: (field, { ascending }) => {
          chain._order = { field, ascending };
          return chain;
        },
        limit: (n) => {
          chain._limit = n;
          return chain;
        },
        then: (resolve) => {
          let filtered = [...mockData];
          
          if (chain.filterTombstones) {
            filtered = filtered.filter(r => r.deleted_at === null);
          }
          
          if (chain._eq.metric_id) {
            filtered = filtered.filter(r => r.metric_id === chain._eq.metric_id);
          }
          
          if (chain._gt) {
            filtered = filtered.filter(r => r[chain._gt.field] > chain._gt.value);
          }
          
          if (chain._order) {
            filtered.sort((a, b) => {
              if (a[chain._order.field] < b[chain._order.field]) return chain._order.ascending ? -1 : 1;
              if (a[chain._order.field] > b[chain._order.field]) return chain._order.ascending ? 1 : -1;
              return 0;
            });
          }
          
          if (chain._limit) {
            filtered = filtered.slice(0, chain._limit);
          }
          
          resolve({ data: filtered, error: null });
        }
      };
      return chain;
    }
  };
}

test('MetricReadAdapter - Progress mapping', async (t) => {
  const dbData = [
    { id: 'w1', created_at: 'ts1', metric_id: 'weight', log_date: '2023-01-01', value_numeric: 80, deleted_at: null },
    { id: 'b1', created_at: 'ts2', metric_id: 'body_fat', log_date: '2023-01-01', value_numeric: 15, deleted_at: null },
    { id: 'w2', created_at: 'ts3', metric_id: 'weight', log_date: '2023-01-02', value_numeric: 79, deleted_at: null },
    { id: 'b2', created_at: 'ts4', metric_id: 'body_fat', log_date: '2023-01-03', value_numeric: 14, deleted_at: null }
  ];
  
  const supabase = mockSupabase(dbData);
  const result = await MetricReadAdapter.getProgress({ supabase, userId: '123' });
  
  assert.strictEqual(result.length, 3);
  // Default order is descending
  // Dominant weight metadata is adopted when weight exists
  assert.deepStrictEqual(result[0], { entry_date: '2023-01-03', body_fat: 14, id: 'b2', created_at: 'ts4', notes: null }); 
  assert.deepStrictEqual(result[1], { entry_date: '2023-01-02', weight: 79, id: 'w2', created_at: 'ts3', notes: null });
  assert.deepStrictEqual(result[2], { entry_date: '2023-01-01', weight: 80, body_fat: 15, id: 'w1', created_at: 'ts1', notes: null });
});

test('MetricReadAdapter - Logical Limit Behavior', async (t) => {
  const dbData = [
    { metric_id: 'weight', log_date: '2023-01-01', value_numeric: 80, deleted_at: null },
    { metric_id: 'body_fat', log_date: '2023-01-01', value_numeric: 15, deleted_at: null },
    { metric_id: 'weight', log_date: '2023-01-02', value_numeric: 79, deleted_at: null },
    { metric_id: 'body_fat', log_date: '2023-01-02', value_numeric: 14, deleted_at: null },
    { metric_id: 'weight', log_date: '2023-01-03', value_numeric: 78, deleted_at: null },
    { metric_id: 'body_fat', log_date: '2023-01-03', value_numeric: 13, deleted_at: null },
  ];
  
  const supabase = mockSupabase(dbData);
  
  // EAV row count is 6. If we request logical limit 2, we should get 2 combined days (4 EAV rows internally).
  const resultAsc = await MetricReadAdapter.getProgress({ supabase, userId: '123' }, { orderAsc: true, limit: 2 });
  assert.strictEqual(resultAsc.length, 2);
  assert.strictEqual(resultAsc[0].entry_date, '2023-01-01');
  assert.strictEqual(resultAsc[1].entry_date, '2023-01-02');
  
  const resultDesc = await MetricReadAdapter.getProgress({ supabase, userId: '123' }, { orderAsc: false, limit: 2 });
  assert.strictEqual(resultDesc.length, 2);
  assert.strictEqual(resultDesc[0].entry_date, '2023-01-03');
  assert.strictEqual(resultDesc[1].entry_date, '2023-01-02');
});

test('MetricReadAdapter - Nutrition mapping', async (t) => {
  const dbData = [
    { metric_id: 'calories', log_date: '2023-01-01', value_numeric: 2000, deleted_at: null },
    { metric_id: 'protein', log_date: '2023-01-01', value_numeric: 150, deleted_at: null }
  ];
  
  const supabase = mockSupabase(dbData);
  const result = await MetricReadAdapter.getNutrition({ supabase, userId: '123' });
  
  assert.strictEqual(result.length, 1);
  assert.deepStrictEqual(result[0], { log_date: '2023-01-01', calories_consumed: 2000, protein_consumed: 150 });
});

test('MetricReadAdapter - Lifestyle mapping and Workout logic', async (t) => {
  const dbData = [
    { metric_id: 'steps', log_date: '2023-01-01', value_numeric: 10000, deleted_at: null },
    { metric_id: 'sleep', log_date: '2023-01-01', value_numeric: 8, deleted_at: null },
    { metric_id: 'workout', log_date: '2023-01-01', value_numeric: 1.0, deleted_at: null },
    { metric_id: 'workout', log_date: '2023-01-02', value_numeric: 0.0, deleted_at: null },
    { metric_id: 'workout', log_date: '2023-01-03', value_numeric: 2.0, deleted_at: null }, // Invalid
  ];
  
  const supabase = mockSupabase(dbData);
  const result = await MetricReadAdapter.getLifestyle({ supabase, userId: '123' });
  
  // Default order is descending
  assert.strictEqual(result.length, 3);
  assert.deepStrictEqual(result[0], { log_date: '2023-01-03' });
  assert.deepStrictEqual(result[1], { log_date: '2023-01-02', workout_completed: false });
  assert.deepStrictEqual(result[2], { log_date: '2023-01-01', steps_count: 10000, sleep_hours: 8, workout_completed: true });
});

test('MetricReadAdapter - Tombstone filtering', async (t) => {
  const dbData = [
    { id: 'w1', created_at: 'ts', metric_id: 'weight', log_date: '2023-01-01', value_numeric: 80, deleted_at: null },
    // tombstoned body_fat should be filtered
    { id: 'b1', created_at: 'ts2', metric_id: 'body_fat', log_date: '2023-01-01', value_numeric: 15, deleted_at: '2023-01-01T12:00:00Z' }
  ];
  
  const supabase = mockSupabase(dbData);
  const result = await MetricReadAdapter.getProgress({ supabase, userId: '123' });
  
  assert.strictEqual(result.length, 1);
  assert.deepStrictEqual(result[0], { entry_date: '2023-01-01', weight: 80, id: 'w1', created_at: 'ts', notes: null });
});

test('MetricReadAdapter - Empty state handling', async (t) => {
  const supabase = mockSupabase([]);
  const result = await MetricReadAdapter.getProgress({ supabase, userId: '123' });
  
  assert.strictEqual(Array.isArray(result), true);
  assert.strictEqual(result.length, 0);
});

test('MetricReadAdapter - getLatestAnchors (Sparse vs Dense)', async (t) => {
  const dbData = [
    // sparse weight log (e.g. 100+ days ago)
    { metric_id: 'weight', log_date: '2022-01-01', value_numeric: 80, deleted_at: null },
    // dense steps log
    { metric_id: 'steps', log_date: '2023-01-01', value_numeric: 10000, deleted_at: null },
    { metric_id: 'steps', log_date: '2023-01-02', value_numeric: 11000, deleted_at: null },
    { metric_id: 'steps', log_date: '2023-01-03', value_numeric: 12000, deleted_at: null },
    // tombstoned sleep, older active sleep
    { metric_id: 'sleep', log_date: '2023-01-04', value_numeric: 8, deleted_at: '2023-01-04T12:00:00Z' },
    { metric_id: 'sleep', log_date: '2023-01-02', value_numeric: 7, deleted_at: null }
  ];
  
  const supabase = mockSupabase(dbData);
  const anchors = await MetricReadAdapter.getLatestAnchors({ supabase, userId: '123' });
  
  // Ensure the sparse weight isn't truncated by dense steps.
  assert.strictEqual(anchors.progressEntries.length, 1);
  assert.strictEqual(anchors.progressEntries[0].entry_date, '2022-01-01');
  assert.strictEqual(anchors.progressEntries[0].weight, 80);
  
  // Ensure latest step is grabbed.
  assert.strictEqual(anchors.lifestyleLogs.length, 2); // steps + sleep
  const stepsAnchor = anchors.lifestyleLogs.find(a => a.steps_count !== undefined);
  assert.strictEqual(stepsAnchor.log_date, '2023-01-03');
  assert.strictEqual(stepsAnchor.steps_count, 12000);
  
  // Ensure tombstone sleep is skipped, falling back to older active sleep.
  const sleepAnchor = anchors.lifestyleLogs.find(a => a.sleep_hours !== undefined);
  assert.strictEqual(sleepAnchor.log_date, '2023-01-02');
  assert.strictEqual(sleepAnchor.sleep_hours, 7);
});

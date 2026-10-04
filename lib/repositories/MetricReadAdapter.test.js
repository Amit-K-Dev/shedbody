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
        select: () => chain,
        eq: () => chain,
        in: (field, values) => {
          // filter the mockData to simulate the in query
          // In a real mock we'd intercept, but here we just return the full array to keep it simple,
          // or we can pre-filter mockData in the test.
          // Wait, _fetchAndPivot just passes everything down, let's just make the mock resolve.
          return chain;
        },
        is: (field, value) => {
          if (field === 'deleted_at' && value === null) {
            // Apply the tombstone filter in the mock
            chain.filterTombstones = true;
          }
          return chain;
        },
        gte: () => chain,
        lte: () => chain,
        order: () => chain,
        then: (resolve) => {
          const filteredData = chain.filterTombstones 
            ? mockData.filter(r => r.deleted_at === null) 
            : mockData;
          resolve({ data: filteredData, error: null });
        }
      };
      return chain;
    }
  };
}

test('MetricReadAdapter - Progress mapping', async (t) => {
  const dbData = [
    { metric_id: 'weight', log_date: '2023-01-01', value_numeric: 80, deleted_at: null },
    { metric_id: 'body_fat', log_date: '2023-01-01', value_numeric: 15, deleted_at: null },
    { metric_id: 'weight', log_date: '2023-01-02', value_numeric: 79, deleted_at: null } // weight only
  ];
  
  const supabase = mockSupabase(dbData);
  const result = await MetricReadAdapter.getProgress({ supabase, userId: '123' });
  
  assert.strictEqual(result.length, 2);
  assert.deepStrictEqual(result[0], { entry_date: '2023-01-01', weight: 80, body_fat: 15 });
  assert.deepStrictEqual(result[1], { entry_date: '2023-01-02', weight: 79 }); // missing body_fat remains missing
});

test('MetricReadAdapter - Nutrition mapping', async (t) => {
  const dbData = [
    { metric_id: 'calories', log_date: '2023-01-01', value_numeric: 2000, deleted_at: null },
    { metric_id: 'protein', log_date: '2023-01-01', value_numeric: 150, deleted_at: null }
    // missing water
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
    
    // Invalid workout value
    { metric_id: 'workout', log_date: '2023-01-03', value_numeric: 2.0, deleted_at: null },
  ];
  
  const supabase = mockSupabase(dbData);
  const result = await MetricReadAdapter.getLifestyle({ supabase, userId: '123' });
  
  assert.strictEqual(result.length, 3);
  // Day 1
  assert.deepStrictEqual(result[0], { log_date: '2023-01-01', steps_count: 10000, sleep_hours: 8, workout_completed: true });
  // Day 2
  assert.deepStrictEqual(result[1], { log_date: '2023-01-02', workout_completed: false });
  // Day 3 - invalid value ignored
  assert.deepStrictEqual(result[2], { log_date: '2023-01-03' });
});

test('MetricReadAdapter - Tombstone filtering', async (t) => {
  const dbData = [
    { metric_id: 'weight', log_date: '2023-01-01', value_numeric: 80, deleted_at: null },
    // tombstoned body_fat
    { metric_id: 'body_fat', log_date: '2023-01-01', value_numeric: 15, deleted_at: '2023-01-01T12:00:00Z' }
  ];
  
  const supabase = mockSupabase(dbData);
  const result = await MetricReadAdapter.getProgress({ supabase, userId: '123' });
  
  assert.strictEqual(result.length, 1);
  assert.deepStrictEqual(result[0], { entry_date: '2023-01-01', weight: 80 }); // body_fat filtered
});

test('MetricReadAdapter - Empty state handling', async (t) => {
  const dbData = [];
  const supabase = mockSupabase(dbData);
  const result = await MetricReadAdapter.getProgress({ supabase, userId: '123' });
  
  assert.strictEqual(Array.isArray(result), true);
  assert.strictEqual(result.length, 0);
});

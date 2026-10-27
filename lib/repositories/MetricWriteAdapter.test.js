import test from 'node:test';
import assert from 'node:assert';
import { MetricWriteAdapter } from './MetricWriteAdapter.js';

function createMockSupabase(planData = null, insertError = null) {
  let insertedRows = [];
  const supabase = {
    from: (table) => {
      const chain = {
        select: () => chain,
        eq: () => chain,
        is: () => chain,
        order: () => chain,
        limit: () => chain,
        maybeSingle: async () => {
          return { data: planData, error: null };
        },
        insert: (rows) => {
          if (insertError) {
            return {
              select: async () => ({ data: null, error: insertError })
            };
          }
          insertedRows.push(...rows);
          return {
            select: async () => ({ data: rows, error: null })
          };
        }
      };
      return chain;
    },
    getInsertedRows: () => insertedRows
  };
  return supabase;
}

test('MetricWriteAdapter - Sparse writes', async (t) => {
  const supabase = createMockSupabase();
  const ctx = { supabase, userId: '123', logDate: '2023-01-01' };
  
  await MetricWriteAdapter.commit(ctx, { weight: 80, body_fat: undefined, water: 2000 });
  const rows = supabase.getInsertedRows();
  
  assert.strictEqual(rows.length, 2);
  assert.strictEqual(rows.find(r => r.metric_id === 'weight').value_numeric, 80);
  assert.strictEqual(rows.find(r => r.metric_id === 'water').value_numeric, 2000);
  assert.strictEqual(rows.find(r => r.metric_id === 'body_fat'), undefined);
});

test('MetricWriteAdapter - Metric mapping', async (t) => {
  const supabase = createMockSupabase();
  const ctx = { supabase, userId: '123', logDate: '2023-01-01' };
  
  const payload = {
    weight: 80.5,
    body_fat: 15.2,
    calories: 2000,
    protein: 150,
    water: 2500,
    workout: true,
    steps: 10000,
    sleep: 8.5
  };
  
  await MetricWriteAdapter.commit(ctx, payload);
  const rows = supabase.getInsertedRows();
  
  assert.strictEqual(rows.length, 8);
  assert.strictEqual(rows.find(r => r.metric_id === 'weight').value_numeric, 80.5);
  assert.strictEqual(rows.find(r => r.metric_id === 'body_fat').value_numeric, 15.2);
  assert.strictEqual(rows.find(r => r.metric_id === 'calories').value_numeric, 2000);
  assert.strictEqual(rows.find(r => r.metric_id === 'protein').value_numeric, 150);
  assert.strictEqual(rows.find(r => r.metric_id === 'water').value_numeric, 2500);
  assert.strictEqual(rows.find(r => r.metric_id === 'steps').value_numeric, 10000);
  assert.strictEqual(rows.find(r => r.metric_id === 'sleep').value_numeric, 8.5);
  assert.strictEqual(rows.find(r => r.metric_id === 'workout').value_numeric, 1.0);

  // Test false boolean
  const supabase2 = createMockSupabase();
  await MetricWriteAdapter.commit({ supabase: supabase2, userId: '123', logDate: '2023-01-01' }, { workout: false });
  const rows2 = supabase2.getInsertedRows();
  assert.strictEqual(rows2.find(r => r.metric_id === 'workout').value_numeric, 0.0);
});

test('MetricWriteAdapter - Null / clear semantics', async (t) => {
  const supabase = createMockSupabase();
  const ctx = { supabase, userId: '123', logDate: '2023-01-01' };
  
  await MetricWriteAdapter.commit(ctx, { weight: null, body_fat: "" });
  const rows = supabase.getInsertedRows();
  
  assert.strictEqual(rows.length, 2);
  
  const weightRow = rows.find(r => r.metric_id === 'weight');
  assert.strictEqual(weightRow.value_numeric, null);
  assert.notStrictEqual(weightRow.deleted_at, null);
  
  const bfRow = rows.find(r => r.metric_id === 'body_fat');
  assert.strictEqual(bfRow.value_numeric, null);
  assert.notStrictEqual(bfRow.deleted_at, null);
});

test('MetricWriteAdapter - Nutrition target snapshots', async (t) => {
  const planData = { calories: 2500, protein: 180 };
  const supabase = createMockSupabase(planData);
  const ctx = { supabase, userId: '123', logDate: '2023-01-01' };
  
  await MetricWriteAdapter.commit(ctx, { calories: 2000, protein: 150, weight: 80 });
  const rows = supabase.getInsertedRows();
  
  const caloriesRow = rows.find(r => r.metric_id === 'calories');
  assert.deepStrictEqual(caloriesRow.metadata, { target_calories_snapshot: 2500, target_protein_snapshot: 180 });
  
  const proteinRow = rows.find(r => r.metric_id === 'protein');
  assert.deepStrictEqual(proteinRow.metadata, { target_calories_snapshot: 2500, target_protein_snapshot: 180 });
  
  const weightRow = rows.find(r => r.metric_id === 'weight');
  assert.strictEqual(weightRow.metadata, null, 'Weight should not receive nutrition snapshots');
});

test('MetricWriteAdapter - Validation / edge cases', async (t) => {
  const supabase = createMockSupabase();
  const ctx = { supabase, userId: '123', logDate: '2023-01-01' };
  
  // Ignore invalid numeric
  await MetricWriteAdapter.commit(ctx, { weight: "not a number", body_fat: NaN });
  assert.strictEqual(supabase.getInsertedRows().length, 0);

  // Missing required context
  await assert.rejects(
    async () => await MetricWriteAdapter.commit({ supabase: null }, { weight: 80 }),
    { message: /Missing required context/ }
  );
  
  // No-op payload
  const result = await MetricWriteAdapter.commit(ctx, {});
  assert.strictEqual(result.data.length, 0);
  assert.strictEqual(supabase.getInsertedRows().length, 0);
});

test('MetricWriteAdapter - Batch atomicity payload construction', async (t) => {
  const supabase = createMockSupabase();
  const ctx = { supabase, userId: '123', logDate: '2023-01-01' };
  
  const payload = { weight: 80, sleep: 8, steps: 5000 };
  const { data } = await MetricWriteAdapter.commit(ctx, payload);
  const rows = supabase.getInsertedRows();
  
  assert.strictEqual(rows.length, 3);
  assert.strictEqual(data.length, 3); // Emitted together
  
  const metricIds = rows.map(r => r.metric_id).sort();
  assert.deepStrictEqual(metricIds, ['sleep', 'steps', 'weight']);
});

test('MetricWriteAdapter - Progress operations', async (t) => {
  const supabase = createMockSupabase();
  const ctx = { supabase, userId: '123', logDate: '2023-01-01' };
  
  // Simulate progress sparse update
  await MetricWriteAdapter.commit(ctx, { weight: 80 });
  let rows = supabase.getInsertedRows();
  assert.strictEqual(rows.length, 1);
  assert.strictEqual(rows[0].metric_id, 'weight');
  
  // Simulate delete progress entry
  const supabase2 = createMockSupabase();
  await MetricWriteAdapter.commit({ supabase: supabase2, userId: '123', logDate: '2023-01-01' }, { weight: null, body_fat: null });
  rows = supabase2.getInsertedRows();
  assert.strictEqual(rows.length, 2);
  assert.strictEqual(rows[0].value_numeric, null);
  assert.notStrictEqual(rows[0].deleted_at, null);
  assert.strictEqual(rows[1].value_numeric, null);
  assert.notStrictEqual(rows[1].deleted_at, null);
});

test('MetricWriteAdapter - Error propagation', async (t) => {
  const insertError = new Error('Database insert failed');
  const supabase = createMockSupabase(null, insertError);
  const ctx = { supabase, userId: '123', logDate: '2023-01-01' };
  
  await assert.rejects(
    async () => await MetricWriteAdapter.commit(ctx, { weight: 80 }),
    { message: 'Database insert failed' }
  );
});

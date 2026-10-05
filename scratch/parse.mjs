import fs from 'fs';

function readJson(file) {
    try {
        const text = fs.readFileSync(file, 'utf8');
        // Find the boundary and JSON content
        const lines = text.split('\n');
        let jsonContent = '';
        let start = false;
        for (const line of lines) {
            if (line.trim() === '{') start = true;
            if (start) jsonContent += line + '\n';
            if (line.trim() === '}' && start) break;
        }
        return JSON.parse(jsonContent);
    } catch(e) {
        return null;
    }
}

const tables = readJson('scratch/tables.json');
const policies = readJson('scratch/policies.json');
const functions = readJson('scratch/functions.json');
const triggers = readJson('scratch/triggers.json');

console.log("=== TABLES & COLUMNS ===");
if (tables && tables.rows) {
    const tableMap = {};
    for (const row of tables.rows) {
        if (!tableMap[row.table_name]) tableMap[row.table_name] = [];
        tableMap[row.table_name].push(`${row.column_name} (${row.data_type})`);
    }
    for (const [t, cols] of Object.entries(tableMap)) {
        console.log(`Table: ${t}`);
        console.log(`  Cols: ${cols.join(', ')}`);
    }
}

console.log("\n=== POLICIES ===");
if (policies && policies.rows) {
    for (const row of policies.rows) {
        console.log(`Table: ${row.tablename} | Policy: ${row.policyname} | Cmd: ${row.cmd} | Roles: ${row.roles} | Qual: ${row.qual} | Check: ${row.with_check}`);
    }
}

console.log("\n=== FUNCTIONS ===");
if (functions && functions.rows) {
    for (const row of functions.rows) {
        console.log(`Function: ${row.routine_name}`);
    }
}

console.log("\n=== TRIGGERS ===");
if (triggers && triggers.rows) {
    for (const row of triggers.rows) {
        console.log(`Trigger: ${row.trigger_name} on ${row.event_object_table} -> ${row.action_statement}`);
    }
}

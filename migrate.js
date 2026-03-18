const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Constants
const SUPABASE_URL = 'https://nopfkuiufaxxrhlvijht.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vcGZrdWl1ZmF4eHJobHZpamh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzgxNjQ3NywiZXhwIjoyMDg5MzkyNDc3fQ.36oN6x-xc2K84-js0xxeu45-foWa_iXmrlzoHLvXi0g';
const RAW_DATA_PATH = './raw_data.txt';

async function migrate() {
  console.log('--- Starting Migration ---');

  // 1. Initialize Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // 2. Read and Parse raw_data.txt
  console.log('Reading raw_data.txt...');
  const data = fs.readFileSync(RAW_DATA_PATH, 'utf8');
  // Regex to find records: digits followed by a capital letter, then everything until the next digits/newline
  const recordsMatch = data.match(/(\d+)([A-Z][^0-9\n:]+)/g);

  if (!recordsMatch) {
    console.error('No records found in raw_data.txt');
    return;
  }

  console.log(`Found ${recordsMatch.length} records. Parsing...`);
  const parsedData = recordsMatch.map(r => {
    const content = r.replace(/^\d+/, '').replace(/\u00A0/g, ' ').trim();
    const parts = content.split(/(?=[A-Z])/).filter(p => p.trim().length > 0);
    if (parts.length >= 2) {
      return { 
        surname: parts[0].trim(), 
        gotra: parts.slice(1).join('').trim() 
      };
    }
    return null;
  }).filter(Boolean);

  // 3. Extract Unique Gotras
  const uniqueGotras = [...new Set(parsedData.map(d => d.gotra))];
  console.log(`Found ${uniqueGotras.length} unique gotras.`);

  // 4. Insert Gotras and get IDs
  console.log('Inserting Gotras...');
  const { data: insertedGotras, error: gotraError } = await supabase
    .from('gotras')
    .upsert(uniqueGotras.map(name => ({ name })), { onConflict: 'name' })
    .select();

  if (gotraError) {
    console.error('Error inserting gotras:', gotraError);
    return;
  }

  const gotraMap = new Map(insertedGotras.map(g => [g.name, g.id]));
  console.log('Gotras inserted successfully.');

  // 5. Prepare and Insert Surnames
  console.log('Preparing Surnames for insertion...');
  const surnamesToInsert = parsedData.map(d => ({
    name: d.surname,
    gotra_id: gotraMap.get(d.gotra)
  })).filter(s => s.gotra_id);

  // Remove duplicates for the surnames table unique constraint (name, gotra_id)
  const uniqueSurnames = [];
  const surnameSeen = new Set();
  for (const s of surnamesToInsert) {
    const key = `${s.name}-${s.gotra_id}`;
    if (!surnameSeen.has(key)) {
      uniqueSurnames.push(s);
      surnameSeen.add(key);
    }
  }

  console.log(`Inserting ${uniqueSurnames.length} unique surnames in batches...`);
  
  // Insert in batches of 1000 to avoid request size limits
  const batchSize = 1000;
  for (let i = 0; i < uniqueSurnames.length; i += batchSize) {
    const batch = uniqueSurnames.slice(i, i + batchSize);
    const { error: surnameError } = await supabase
      .from('surnames')
      .insert(batch);

    if (surnameError) {
      console.error(`Error inserting surnames batch starting at ${i}:`, surnameError);
    } else {
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(uniqueSurnames.length / batchSize)}`);
    }
  }

  console.log('--- Migration Complete! ---');
}

migrate();

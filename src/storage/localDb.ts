import * as SQLite from 'expo-sqlite';
import {
  ConsultationFormValues,
  ConsultationItem,
  EsteticaFormValues,
  EsteticaItem,
  InventoryFormValues,
  InventoryItem,
  SaleFormValues,
  SaleItem,
} from '../types';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function nowIso() {
  return new Date().toISOString();
}

function makeLocalId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function db() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('emi_vet_offline.db');
  }

  return dbPromise;
}

async function ensureColumn(conn: SQLite.SQLiteDatabase, table: string, column: string, definition: string) {
  const rows = await conn.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  const exists = rows.some((row) => row.name === column);

  if (!exists) {
    await conn.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
  }
}

export async function initLocalDb() {
  const conn = await db();

  await conn.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS inventory_items (
      local_id TEXT PRIMARY KEY,
      remote_id INTEGER,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      presentation TEXT NOT NULL,
      sale_unit TEXT NOT NULL,
      target_species TEXT NOT NULL,
      stock INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      min_stock INTEGER NOT NULL,
      is_active INTEGER NOT NULL,
      sync_status TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sales (
      local_id TEXT PRIMARY KEY,
      remote_id INTEGER,
      inventory_item_id INTEGER,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total REAL NOT NULL,
      customer_name TEXT NOT NULL,
      sold_at TEXT NOT NULL,
      species_filter TEXT NOT NULL,
      sync_status TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS consultations (
      local_id TEXT PRIMARY KEY,
      remote_id INTEGER,
      pet_id INTEGER,
      species_id INTEGER,
      pet_name TEXT NOT NULL,
      species TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      pet_breed TEXT NOT NULL,
      pet_size TEXT NOT NULL,
      diagnosis TEXT NOT NULL,
      treatment TEXT NOT NULL,
      cost REAL NOT NULL,
      consulted_at TEXT NOT NULL,
      vaccination_applied INTEGER NOT NULL DEFAULT 0,
      vaccination_note TEXT,
      next_vaccination_at TEXT,
      deworming_applied INTEGER NOT NULL DEFAULT 0,
      deworming_note TEXT,
      next_deworming_at TEXT,
      medications_json TEXT NOT NULL,
      images_json TEXT NOT NULL DEFAULT '[]',
      sync_status TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS estetica_services (
      local_id TEXT PRIMARY KEY,
      remote_id INTEGER,
      pet_id INTEGER,
      pet_name TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      owner_phone TEXT NOT NULL,
      owner_email TEXT NOT NULL,
      service_type TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT NOT NULL,
      requested_at TEXT NOT NULL,
      ready_at TEXT,
      notified_at TEXT,
      images_json TEXT NOT NULL DEFAULT '[]',
      sync_status TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await ensureColumn(conn, 'consultations', 'pet_id', 'INTEGER');
  await ensureColumn(conn, 'consultations', 'species_id', 'INTEGER');
  await ensureColumn(conn, 'consultations', 'vaccination_applied', 'INTEGER NOT NULL DEFAULT 0');
  await ensureColumn(conn, 'consultations', 'vaccination_note', 'TEXT');
  await ensureColumn(conn, 'consultations', 'next_vaccination_at', 'TEXT');
  await ensureColumn(conn, 'consultations', 'deworming_applied', 'INTEGER NOT NULL DEFAULT 0');
  await ensureColumn(conn, 'consultations', 'deworming_note', 'TEXT');
  await ensureColumn(conn, 'consultations', 'next_deworming_at', 'TEXT');
  await ensureColumn(conn, 'consultations', 'images_json', "TEXT NOT NULL DEFAULT '[]'");
}

function mapInventory(row: Record<string, unknown>): InventoryItem {
  return {
    local_id: String(row.local_id),
    remote_id: row.remote_id ? Number(row.remote_id) : null,
    name: String(row.name),
    category: String(row.category),
    presentation: String(row.presentation ?? ''),
    sale_unit: String(row.sale_unit ?? 'unidad'),
    target_species: String(row.target_species ?? ''),
    stock: Number(row.stock ?? 0),
    unit_price: Number(row.unit_price ?? 0),
    min_stock: Number(row.min_stock ?? 0),
    is_active: Number(row.is_active ?? 0) === 1,
    sync_status: String(row.sync_status) as InventoryItem['sync_status'],
    updated_at: String(row.updated_at),
  };
}

function mapSale(row: Record<string, unknown>): SaleItem {
  return {
    local_id: String(row.local_id),
    remote_id: row.remote_id ? Number(row.remote_id) : null,
    inventory_item_id: row.inventory_item_id ? Number(row.inventory_item_id) : null,
    product_name: String(row.product_name),
    quantity: Number(row.quantity),
    unit_price: Number(row.unit_price),
    total: Number(row.total),
    customer_name: String(row.customer_name ?? ''),
    sold_at: String(row.sold_at),
    species_filter: String(row.species_filter ?? ''),
    sync_status: String(row.sync_status) as SaleItem['sync_status'],
    updated_at: String(row.updated_at),
  };
}

function mapConsultation(row: Record<string, unknown>): ConsultationItem {
  return {
    local_id: String(row.local_id),
    remote_id: row.remote_id ? Number(row.remote_id) : null,
    pet_id: row.pet_id ? Number(row.pet_id) : null,
    species_id: row.species_id ? Number(row.species_id) : null,
    pet_name: String(row.pet_name),
    species: String(row.species),
    owner_name: String(row.owner_name),
    pet_breed: String(row.pet_breed ?? ''),
    pet_size: String(row.pet_size ?? ''),
    diagnosis: String(row.diagnosis),
    treatment: String(row.treatment ?? ''),
    cost: Number(row.cost),
    consulted_at: String(row.consulted_at),
    vaccination_applied: Number(row.vaccination_applied ?? 0) === 1,
    vaccination_note: String(row.vaccination_note ?? ''),
    next_vaccination_at: String(row.next_vaccination_at ?? ''),
    deworming_applied: Number(row.deworming_applied ?? 0) === 1,
    deworming_note: String(row.deworming_note ?? ''),
    next_deworming_at: String(row.next_deworming_at ?? ''),
    medications_json: String(row.medications_json ?? '[]'),
    images_json: String(row.images_json ?? '[]'),
    sync_status: String(row.sync_status) as ConsultationItem['sync_status'],
    updated_at: String(row.updated_at),
  };
}

function mapEstetica(row: Record<string, unknown>): EsteticaItem {
  return {
    local_id: String(row.local_id),
    remote_id: row.remote_id ? Number(row.remote_id) : null,
    pet_id: row.pet_id ? Number(row.pet_id) : null,
    pet_name: String(row.pet_name),
    owner_name: String(row.owner_name ?? ''),
    owner_phone: String(row.owner_phone ?? ''),
    owner_email: String(row.owner_email ?? ''),
    service_type: String(row.service_type),
    status: String(row.status ?? 'pendiente') as EsteticaItem['status'],
    notes: String(row.notes ?? ''),
    requested_at: String(row.requested_at),
    ready_at: String(row.ready_at ?? ''),
    notified_at: String(row.notified_at ?? ''),
    images_json: String(row.images_json ?? '[]'),
    sync_status: String(row.sync_status) as EsteticaItem['sync_status'],
    updated_at: String(row.updated_at),
  };
}

export async function savePendingInventory(form: InventoryFormValues) {
  const conn = await db();
  const localId = makeLocalId('inventory');
  const updatedAt = nowIso();

  await conn.runAsync(
    `INSERT INTO inventory_items
      (local_id, remote_id, name, category, presentation, sale_unit, target_species, stock, unit_price, min_stock, is_active, sync_status, updated_at)
     VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [
      localId,
      form.name,
      form.category,
      form.presentation,
      form.sale_unit,
      form.target_species,
      form.stock,
      form.unit_price,
      form.min_stock,
      form.is_active ? 1 : 0,
      updatedAt,
    ]
  );

  return localId;
}

export async function savePendingSale(form: SaleFormValues) {
  const conn = await db();
  const localId = makeLocalId('sale');
  const updatedAt = nowIso();
  const total = form.quantity * form.unit_price;

  await conn.runAsync(
    `INSERT INTO sales
      (local_id, remote_id, inventory_item_id, product_name, quantity, unit_price, total, customer_name, sold_at, species_filter, sync_status, updated_at)
     VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [
      localId,
      form.inventory_item_id,
      form.product_name,
      form.quantity,
      form.unit_price,
      total,
      form.customer_name,
      form.sold_at,
      form.species_filter,
      updatedAt,
    ]
  );

  return localId;
}

export async function savePendingConsultation(form: ConsultationFormValues) {
  const conn = await db();
  const localId = makeLocalId('consultation');
  const updatedAt = nowIso();

  await conn.runAsync(
    `INSERT INTO consultations
      (local_id, remote_id, pet_id, species_id, pet_name, species, owner_name, pet_breed, pet_size, diagnosis, treatment, cost, consulted_at, vaccination_applied, vaccination_note, next_vaccination_at, deworming_applied, deworming_note, next_deworming_at, medications_json, images_json, sync_status, updated_at)
     VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [
      localId,
      form.pet_id,
      form.species_id,
      form.pet_name,
      form.species,
      form.owner_name,
      form.pet_breed,
      form.pet_size,
      form.diagnosis,
      form.treatment,
      form.cost,
      form.consulted_at,
      form.vaccination_applied ? 1 : 0,
      form.vaccination_note,
      form.next_vaccination_at,
      form.deworming_applied ? 1 : 0,
      form.deworming_note,
      form.next_deworming_at,
      form.medications_json,
      form.images_json,
      updatedAt,
    ]
  );

  return localId;
}

export async function savePendingEstetica(form: EsteticaFormValues) {
  const conn = await db();
  const localId = makeLocalId('estetica');
  const updatedAt = nowIso();

  await conn.runAsync(
    `INSERT INTO estetica_services
      (local_id, remote_id, pet_id, pet_name, owner_name, owner_phone, owner_email, service_type, status, notes, requested_at, ready_at, notified_at, images_json, sync_status, updated_at)
     VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', '', ?, 'pending', ?)`,
    [
      localId,
      form.pet_id,
      form.pet_name,
      form.owner_name,
      form.owner_phone,
      form.owner_email,
      form.service_type,
      form.status,
      form.notes,
      form.requested_at,
      form.images_json,
      updatedAt,
    ]
  );

  return localId;
}

export async function upsertRemoteInventory(items: Array<Record<string, unknown>>) {
  const conn = await db();

  for (const item of items) {
    const remoteId = Number(item.id);
    const localId = `remote-inventory-${remoteId}`;

    await conn.runAsync(
      `INSERT INTO inventory_items
        (local_id, remote_id, name, category, presentation, sale_unit, target_species, stock, unit_price, min_stock, is_active, sync_status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?)
       ON CONFLICT(local_id) DO UPDATE SET
         name=excluded.name,
         category=excluded.category,
         presentation=excluded.presentation,
         sale_unit=excluded.sale_unit,
         target_species=excluded.target_species,
         stock=excluded.stock,
         unit_price=excluded.unit_price,
         min_stock=excluded.min_stock,
         is_active=excluded.is_active,
         sync_status='synced',
         updated_at=excluded.updated_at`,
      [
        localId,
        remoteId,
        String(item.name ?? ''),
        String(item.category ?? ''),
        String(item.presentation ?? ''),
        String(item.sale_unit ?? 'unidad'),
        String(item.target_species ?? ''),
        Number(item.stock ?? 0),
        Number(item.unit_price ?? 0),
        Number(item.min_stock ?? 0),
        Boolean(item.is_active ?? true) ? 1 : 0,
        String(item.updated_at ?? nowIso()),
      ]
    );
  }
}

export async function upsertRemoteSales(items: Array<Record<string, unknown>>) {
  const conn = await db();

  for (const item of items) {
    const remoteId = Number(item.id);
    const localId = `remote-sale-${remoteId}`;

    await conn.runAsync(
      `INSERT INTO sales
        (local_id, remote_id, inventory_item_id, product_name, quantity, unit_price, total, customer_name, sold_at, species_filter, sync_status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '', 'synced', ?)
       ON CONFLICT(local_id) DO UPDATE SET
         inventory_item_id=excluded.inventory_item_id,
         product_name=excluded.product_name,
         quantity=excluded.quantity,
         unit_price=excluded.unit_price,
         total=excluded.total,
         customer_name=excluded.customer_name,
         sold_at=excluded.sold_at,
         sync_status='synced',
         updated_at=excluded.updated_at`,
      [
        localId,
        remoteId,
        item.inventory_item_id ? Number(item.inventory_item_id) : null,
        String(item.product_name ?? ''),
        Number(item.quantity ?? 0),
        Number(item.unit_price ?? 0),
        Number(item.total ?? 0),
        String(item.customer_name ?? ''),
        String(item.sold_at ?? nowIso()),
        String(item.updated_at ?? nowIso()),
      ]
    );
  }
}

export async function upsertRemoteConsultations(items: Array<Record<string, unknown>>) {
  const conn = await db();

  for (const item of items) {
    const remoteId = Number(item.id);
    const localId = `remote-consultation-${remoteId}`;
    const petCatalog = (item.pet_catalog ?? item.petCatalog ?? null) as Record<string, unknown> | null;
    const images = Array.isArray(item.images) ? item.images : [];

    await conn.runAsync(
      `INSERT INTO consultations
        (local_id, remote_id, pet_id, species_id, pet_name, species, owner_name, pet_breed, pet_size, diagnosis, treatment, cost, consulted_at, vaccination_applied, vaccination_note, next_vaccination_at, deworming_applied, deworming_note, next_deworming_at, medications_json, images_json, sync_status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, 'synced', ?)
       ON CONFLICT(local_id) DO UPDATE SET
         pet_id=excluded.pet_id,
         species_id=excluded.species_id,
         pet_name=excluded.pet_name,
         species=excluded.species,
         owner_name=excluded.owner_name,
         pet_breed=excluded.pet_breed,
         pet_size=excluded.pet_size,
         diagnosis=excluded.diagnosis,
         treatment=excluded.treatment,
         cost=excluded.cost,
         consulted_at=excluded.consulted_at,
         vaccination_applied=excluded.vaccination_applied,
         vaccination_note=excluded.vaccination_note,
         next_vaccination_at=excluded.next_vaccination_at,
         deworming_applied=excluded.deworming_applied,
         deworming_note=excluded.deworming_note,
         next_deworming_at=excluded.next_deworming_at,
         images_json=excluded.images_json,
         sync_status='synced',
         updated_at=excluded.updated_at`,
      [
        localId,
        remoteId,
        item.pet_id ? Number(item.pet_id) : null,
        item.species_id ? Number(item.species_id) : null,
        String(item.pet_name ?? ''),
        String(item.species ?? ''),
        String(item.owner_name ?? ''),
        String(petCatalog?.breed ?? ''),
        String(petCatalog?.size_category ?? ''),
        String(item.diagnosis ?? ''),
        String(item.treatment ?? ''),
        Number(item.cost ?? 0),
        String(item.consulted_at ?? nowIso()),
        Boolean(item.vaccination_applied ?? false) ? 1 : 0,
        String(item.vaccination_note ?? ''),
        String(item.next_vaccination_at ?? ''),
        Boolean(item.deworming_applied ?? false) ? 1 : 0,
        String(item.deworming_note ?? ''),
        String(item.next_deworming_at ?? ''),
        JSON.stringify(images),
        String(item.updated_at ?? nowIso()),
      ]
    );
  }
}

export async function upsertRemoteEsteticaServices(items: Array<Record<string, unknown>>) {
  const conn = await db();

  for (const item of items) {
    const remoteId = Number(item.id);
    const localId = `remote-estetica-${remoteId}`;
    const images = Array.isArray(item.images) ? item.images : [];

    await conn.runAsync(
      `INSERT INTO estetica_services
        (local_id, remote_id, pet_id, pet_name, owner_name, owner_phone, owner_email, service_type, status, notes, requested_at, ready_at, notified_at, images_json, sync_status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?)
       ON CONFLICT(local_id) DO UPDATE SET
         pet_id=excluded.pet_id,
         pet_name=excluded.pet_name,
         owner_name=excluded.owner_name,
         owner_phone=excluded.owner_phone,
         owner_email=excluded.owner_email,
         service_type=excluded.service_type,
         status=excluded.status,
         notes=excluded.notes,
         requested_at=excluded.requested_at,
         ready_at=excluded.ready_at,
         notified_at=excluded.notified_at,
         images_json=excluded.images_json,
         sync_status='synced',
         updated_at=excluded.updated_at`,
      [
        localId,
        remoteId,
        item.pet_id ? Number(item.pet_id) : null,
        String(item.pet_name ?? ''),
        String(item.owner_name ?? ''),
        String(item.owner_phone ?? ''),
        String(item.owner_email ?? ''),
        String(item.service_type ?? ''),
        String(item.status ?? 'pendiente'),
        String(item.notes ?? ''),
        String(item.requested_at ?? nowIso()),
        String(item.ready_at ?? ''),
        String(item.notified_at ?? ''),
        JSON.stringify(images),
        String(item.updated_at ?? nowIso()),
      ]
    );
  }
}

export async function getInventoryItems() {
  const conn = await db();
  const rows = await conn.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM inventory_items ORDER BY datetime(updated_at) DESC`
  );

  return rows.map(mapInventory);
}

export async function getSales() {
  const conn = await db();
  const rows = await conn.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM sales ORDER BY datetime(sold_at) DESC`
  );

  return rows.map(mapSale);
}

export async function getConsultations() {
  const conn = await db();
  const rows = await conn.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM consultations ORDER BY datetime(consulted_at) DESC`
  );

  return rows.map(mapConsultation);
}

export async function getEsteticaServices() {
  const conn = await db();
  const rows = await conn.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM estetica_services ORDER BY datetime(requested_at) DESC`
  );

  return rows.map(mapEstetica);
}

export async function getPendingInventory() {
  const conn = await db();
  const rows = await conn.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM inventory_items WHERE sync_status = 'pending' ORDER BY datetime(updated_at) ASC`
  );

  return rows.map(mapInventory);
}

export async function getPendingSales() {
  const conn = await db();
  const rows = await conn.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM sales WHERE sync_status = 'pending' ORDER BY datetime(updated_at) ASC`
  );

  return rows.map(mapSale);
}

export async function getPendingConsultations() {
  const conn = await db();
  const rows = await conn.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM consultations WHERE sync_status = 'pending' ORDER BY datetime(updated_at) ASC`
  );

  return rows.map(mapConsultation);
}

export async function getPendingEsteticaServices() {
  const conn = await db();
  const rows = await conn.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM estetica_services WHERE sync_status = 'pending' ORDER BY datetime(updated_at) ASC`
  );

  return rows.map(mapEstetica);
}

export async function markInventorySynced(localId: string, remoteId: number) {
  const conn = await db();
  await conn.runAsync(
    `UPDATE inventory_items SET remote_id = ?, sync_status = 'synced', updated_at = ? WHERE local_id = ?`,
    [remoteId, nowIso(), localId]
  );
}

export async function markSaleSynced(localId: string, remoteId: number) {
  const conn = await db();
  await conn.runAsync(
    `UPDATE sales SET remote_id = ?, sync_status = 'synced', updated_at = ? WHERE local_id = ?`,
    [remoteId, nowIso(), localId]
  );
}

export async function markConsultationSynced(localId: string, remoteId: number) {
  const conn = await db();
  await conn.runAsync(
    `UPDATE consultations SET remote_id = ?, sync_status = 'synced', updated_at = ? WHERE local_id = ?`,
    [remoteId, nowIso(), localId]
  );
}

export async function markEsteticaSynced(localId: string, remoteId: number) {
  const conn = await db();
  await conn.runAsync(
    `UPDATE estetica_services SET remote_id = ?, sync_status = 'synced', updated_at = ? WHERE local_id = ?`,
    [remoteId, nowIso(), localId]
  );
}

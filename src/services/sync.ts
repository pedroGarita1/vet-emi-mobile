import {
  createConsultation,
  createInventory,
  createSale,
  fetchConsultations,
  fetchInventory,
  fetchSales,
} from './api';
import {
  getPendingConsultations,
  getPendingInventory,
  getPendingSales,
  markConsultationSynced,
  markInventorySynced,
  markSaleSynced,
  upsertRemoteConsultations,
  upsertRemoteInventory,
  upsertRemoteSales,
} from '../storage/localDb';

export async function refreshRemoteIntoLocal(token: string) {
  const [inventory, sales, consultations] = await Promise.all([
    fetchInventory(token),
    fetchSales(token),
    fetchConsultations(token),
  ]);

  await Promise.all([
    upsertRemoteInventory(inventory),
    upsertRemoteSales(sales),
    upsertRemoteConsultations(consultations),
  ]);
}

export async function syncPendingToServer(token: string) {
  const [pendingInventory, pendingSales, pendingConsultations] = await Promise.all([
    getPendingInventory(),
    getPendingSales(),
    getPendingConsultations(),
  ]);

  let synced = 0;

  for (const item of pendingInventory) {
    const remoteId = await createInventory(token, {
      name: item.name,
      category: item.category,
      stock: item.stock,
      unit_price: item.unit_price,
      min_stock: item.min_stock,
      is_active: item.is_active,
    });

    await markInventorySynced(item.local_id, remoteId);
    synced += 1;
  }

  for (const sale of pendingSales) {
    const remoteId = await createSale(token, {
      inventory_item_id: sale.inventory_item_id,
      product_name: sale.product_name,
      quantity: sale.quantity,
      unit_price: sale.unit_price,
      customer_name: sale.customer_name || null,
      sold_at: sale.sold_at,
    });

    await markSaleSynced(sale.local_id, remoteId);
    synced += 1;
  }

  for (const consultation of pendingConsultations) {
    const remoteId = await createConsultation(token, {
      pet_name: consultation.pet_name,
      species: consultation.species,
      owner_name: consultation.owner_name,
      diagnosis: consultation.diagnosis,
      treatment: consultation.treatment,
      cost: consultation.cost,
      consulted_at: consultation.consulted_at,
    });

    await markConsultationSynced(consultation.local_id, remoteId);
    synced += 1;
  }

  return synced;
}

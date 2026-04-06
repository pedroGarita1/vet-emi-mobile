import {
  createConsultation,
  createEsteticaService,
  createInventory,
  createSale,
  fetchConsultations,
  fetchEsteticaServices,
  fetchInventory,
  fetchSales,
} from './api';
import {
  getPendingConsultations,
  getPendingEsteticaServices,
  getPendingInventory,
  getPendingSales,
  markConsultationSynced,
  markEsteticaSynced,
  markInventorySynced,
  markSaleSynced,
  upsertRemoteConsultations,
  upsertRemoteEsteticaServices,
  upsertRemoteInventory,
  upsertRemoteSales,
} from '../storage/localDb';

export async function refreshRemoteIntoLocal(token: string) {
  const [inventory, sales, consultations, esteticaServices] = await Promise.all([
    fetchInventory(token),
    fetchSales(token),
    fetchConsultations(token),
    fetchEsteticaServices(token),
  ]);

  await Promise.all([
    upsertRemoteInventory(inventory),
    upsertRemoteSales(sales),
    upsertRemoteConsultations(consultations),
    upsertRemoteEsteticaServices(esteticaServices as unknown as Array<Record<string, unknown>>),
  ]);
}

export async function syncPendingToServer(token: string) {
  const [pendingInventory, pendingSales, pendingConsultations, pendingEsteticaServices] = await Promise.all([
    getPendingInventory(),
    getPendingSales(),
    getPendingConsultations(),
    getPendingEsteticaServices(),
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
      pet_id: consultation.pet_id,
      species_id: consultation.species_id,
      pet_name: consultation.pet_name,
      species: consultation.species,
      owner_name: consultation.owner_name,
      diagnosis: consultation.diagnosis,
      treatment: consultation.treatment,
      cost: consultation.cost,
      consulted_at: consultation.consulted_at,
      vaccination_applied: consultation.vaccination_applied,
      vaccination_note: consultation.vaccination_note || null,
      next_vaccination_at: consultation.next_vaccination_at || null,
      deworming_applied: consultation.deworming_applied,
      deworming_note: consultation.deworming_note || null,
      next_deworming_at: consultation.next_deworming_at || null,
    });

    await markConsultationSynced(consultation.local_id, remoteId);
    synced += 1;
  }

  for (const service of pendingEsteticaServices) {
    const remoteId = await createEsteticaService(token, {
      pet_id: service.pet_id,
      pet_name: service.pet_name,
      owner_name: service.owner_name,
      owner_phone: service.owner_phone,
      owner_email: service.owner_email,
      service_type: service.service_type,
      status: service.status,
      notes: service.notes,
      requested_at: service.requested_at,
    });

    await markEsteticaSynced(service.local_id, remoteId);
    synced += 1;
  }

  return synced;
}

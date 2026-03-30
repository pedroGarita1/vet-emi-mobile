import { Text, View } from 'react-native';
import { ConsultationItem, SaleItem } from '../../types';
import { SectionCard } from '../ui/SectionCard';

type Props = {
  consultations: ConsultationItem[];
  sales: SaleItem[];
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export function HomeSection({ consultations, sales }: Props) {
  const latestConsultations = consultations.slice(0, 5);
  const latestSales = sales.slice(0, 8);
  const totalSalesAmount = sales.reduce((acc, item) => acc + item.total, 0);
  const totalItems = sales.reduce((acc, item) => acc + item.quantity, 0);
  const avgTicket = sales.length > 0 ? totalSalesAmount / sales.length : 0;
  const lastSaleDate = latestSales[0]?.sold_at;

  return (
    <View className="gap-3">
      <SectionCard title="Resumen de ventas" subtitle="Vista general al iniciar sesion con la informacion vendida.">
        <View className="flex-row gap-2">
          <View className="flex-1 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5">
            <Text className="text-[11px] font-bold uppercase tracking-wide text-violet-800">Monto total</Text>
            <Text className="mt-1 text-[20px] font-black text-violet-900">${totalSalesAmount.toFixed(2)}</Text>
          </View>
          <View className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <Text className="text-[11px] font-bold uppercase tracking-wide text-slate-600">Total ventas</Text>
            <Text className="mt-1 text-[20px] font-black text-slate-900">{sales.length}</Text>
          </View>
        </View>

        <View className="flex-row gap-2">
          <View className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <Text className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Productos vendidos</Text>
            <Text className="mt-1 text-[16px] font-extrabold text-slate-900">{totalItems}</Text>
          </View>
          <View className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <Text className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Ticket promedio</Text>
            <Text className="mt-1 text-[16px] font-extrabold text-slate-900">${avgTicket.toFixed(2)}</Text>
          </View>
        </View>

        <View className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
          <Text className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Ultima venta</Text>
          <Text className="mt-1 text-[13px] font-bold text-slate-900">{lastSaleDate ? formatDate(lastSaleDate) : 'Sin registros'}</Text>
        </View>
      </SectionCard>

      <SectionCard title="Ultimas ventas" subtitle="Tabla rapida de los ultimos movimientos registrados.">
        <View className="overflow-hidden rounded-xl border border-slate-200">
          <View className="flex-row bg-slate-100 px-3 py-2">
            <Text className="flex-[1.4] text-[11px] font-black uppercase text-slate-600">Producto</Text>
            <Text className="flex-1 text-[11px] font-black uppercase text-slate-600">Fecha</Text>
            <Text className="w-24 text-right text-[11px] font-black uppercase text-slate-600">Total</Text>
          </View>
          {latestSales.length === 0 ? (
            <Text className="px-3 py-3 text-slate-500">No hay ventas registradas.</Text>
          ) : (
            latestSales.map((item) => {
              return (
                <View key={item.local_id} className="flex-row items-center border-t border-slate-200 bg-white px-3 py-2.5">
                  <Text className="flex-[1.4] text-[12px] font-bold text-slate-900" numberOfLines={1}>{item.product_name}</Text>
                  <Text className="flex-1 text-[11px] text-slate-600" numberOfLines={1}>{formatDate(item.sold_at)}</Text>
                  <Text className="w-24 text-right text-[12px] font-extrabold text-violet-700">${item.total.toFixed(2)}</Text>
                </View>
              );
            })
          )}
        </View>
      </SectionCard>

      <SectionCard title="Consultas recientes" subtitle="Ultimas consultas capturadas en campo.">
        {latestConsultations.length === 0 ? (
          <Text className="text-slate-500">No hay consultas registradas.</Text>
        ) : (
          latestConsultations.map((item) => (
            <View key={item.local_id} className="border-t border-slate-200 pt-2">
              <Text className="text-[14px] font-extrabold text-slate-900">
                {item.pet_name} ({item.species})
              </Text>
              <Text className="text-[13px] text-slate-600">{item.owner_name} | {item.diagnosis}</Text>
              <Text className="text-[12px] text-slate-500">{formatDate(item.consulted_at)}</Text>
            </View>
          ))
        )}
      </SectionCard>
    </View>
  );
}


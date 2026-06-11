import { useState } from "react";
import {
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Package,
  ExternalLink,
  Search,
  Filter,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useData } from "../../context/DataContext";

interface Sale {
  id: string;
  orderId: string;
  platform: "mercadolibre" | "directo";
  product: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  customer: string;
  date: string;
  status: "completed" | "pending" | "cancelled";
}

const mockSales: Sale[] = [
  {
    id: "1",
    orderId: "ML-12345",
    platform: "mercadolibre",
    product: "Bentonita Cosmética Premium",
    quantity: 50,
    unit: "kg",
    price: 45,
    total: 2250,
    customer: "María González",
    date: "2026-05-11",
    status: "completed",
  },
  {
    id: "2",
    orderId: "ML-12346",
    platform: "mercadolibre",
    product: "Polvo de Arándanos",
    quantity: 25,
    unit: "kg",
    price: 120,
    total: 3000,
    customer: "Juan Pérez",
    date: "2026-05-11",
    status: "completed",
  },
  {
    id: "3",
    orderId: "DIR-001",
    platform: "directo",
    product: "Arcilla Verde Cosmética",
    quantity: 30,
    unit: "kg",
    price: 38,
    total: 1140,
    customer: "Cosméticos Naturales SA",
    date: "2026-05-10",
    status: "completed",
  },
  {
    id: "4",
    orderId: "ML-12347",
    platform: "mercadolibre",
    product: "Bentonita Grado Alimenticio",
    quantity: 75,
    unit: "kg",
    price: 52,
    total: 3900,
    customer: "Roberto Sánchez",
    date: "2026-05-10",
    status: "pending",
  },
  {
    id: "5",
    orderId: "ML-12348",
    platform: "mercadolibre",
    product: "Polvo de Mango",
    quantity: 40,
    unit: "kg",
    price: 95,
    total: 3800,
    customer: "Ana Martínez",
    date: "2026-05-09",
    status: "completed",
  },
];

const salesByDay = [
  { day: "Lun", ventas: 12500, ordenes: 15 },
  { day: "Mar", ventas: 15800, ordenes: 18 },
  { day: "Mié", ventas: 11200, ordenes: 12 },
  { day: "Jue", ventas: 17500, ordenes: 21 },
  { day: "Vie", ventas: 14100, ordenes: 16 },
  { day: "Sáb", ventas: 9800, ordenes: 10 },
  { day: "Dom", ventas: 7200, ordenes: 8 },
];

const topProducts = [
  { product: "Bentonita Cosmética", sales: 15200, units: 340 },
  { product: "Polvo de Arándanos", sales: 12800, units: 107 },
  { product: "Bentonita Alimenticia", sales: 11500, units: 221 },
  { product: "Polvo de Mango", sales: 9400, units: 99 },
];

export function Sales() {
  const { sales } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === "all" || sale.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalOrders = salesByDay.length;
  const avgOrderValue = totalSales / totalOrders;
  const mlSales = sales.filter((s) => s.platform === "mercadolibre").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
        <p className="text-gray-600 mt-1">
          Seguimiento de ventas de Mercado Libre y ventas directas
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">
            ${totalSales.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">Ventas Totales (Mes)</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{totalOrders}</p>
          <p className="text-sm text-gray-600 mt-1">Órdenes Totales</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">
            ${avgOrderValue.toFixed(0)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Valor Promedio de Compra</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100">
              <Package className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{mlSales}</p>
          <p className="text-sm text-gray-600 mt-1">Ventas Mercado Libre</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ventas por Día (Promedio)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ventas" fill="#10b981" name="Ventas ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Productos Más Vendidos
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="product" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="sales" fill="#10b981" name="Ventas ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por orden, cliente o producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="all">Todas las plataformas</option>
              <option value="mercadolibre">Mercado Libre</option>
              <option value="directo">Venta Directa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Plataforma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{sale.orderId}</span>
                      {sale.platform === "mercadolibre" && (
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{sale.date}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{sale.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{sale.product}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {sale.quantity} {sale.unit}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    ${sale.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        sale.platform === "mercadolibre"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {sale.platform === "mercadolibre" ? "Mercado Libre" : "Directo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        sale.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : sale.status === "pending"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {sale.status === "completed"
                        ? "Completado"
                        : sale.status === "pending"
                        ? "Pendiente"
                        : "Cancelado"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

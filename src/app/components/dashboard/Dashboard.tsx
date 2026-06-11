import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Package,
  TrendingUp,
  AlertCircle,
  DollarSign,
  ArrowUp,
  ArrowDown,
  ChevronDown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useData } from "../../context/DataContext";

const salesData = [
  { month: "Ene", ventas: 35000000, prediccion: 38000000 },
  { month: "Feb", ventas: 42000000, prediccion: 41000000 },
  { month: "Mar", ventas: 38000000, prediccion: 40000000 },
  { month: "Abr", ventas: 45000000, prediccion: 44000000 },
  { month: "May", ventas: 48250000, prediccion: 47000000 },
];

const COLORS = ["#10b981", "#22c55e", "#34d399", "#6ee7b7", "#86efac"];

export function Dashboard() {
  const { products, sales, orders } = useData();
  const navigate = useNavigate();
  const [inventoryView, setInventoryView] = useState("total");
  const [salesView, setSalesView] = useState("prediction");
  const [distributionView, setDistributionView] = useState("category");

  const totalInventory = products.reduce((sum, p) => sum + p.stock, 0);
  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const productionAlerts = products.filter((p) => p.stock < p.minStock).length;

  const stats = [
    {
      name: "Inventario Total",
      value: `${totalInventory.toLocaleString()} kg`,
      change: "+12.5%",
      trend: "up",
      icon: Package,
      color: "green",
      route: "/inventario",
    },
    {
      name: "Ventas del Mes",
      value: `$${totalSales.toLocaleString()} COP`,
      change: "+8.2%",
      trend: "up",
      icon: DollarSign,
      color: "green",
      route: "/ventas",
    },
    {
      name: "Alertas Producción",
      value: "3",
      change: "",
      trend: "none",
      icon: AlertCircle,
      color: "red",
      route: "/cadena-suministro",
    },
  ];

  // Datos de inventario por producto
  const inventoryByProduct = products.map((p) => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + "..." : p.name,
    stock: p.stock,
  }));

  // Datos de distribución por categoría
  const distributionByCategory = [
    {
      name: "Cosmético",
      value: products.filter((p) => p.category === "cosmetico").reduce((sum, p) => sum + p.stock, 0),
    },
    {
      name: "Alimenticio",
      value: products.filter((p) => p.category === "alimenticio").reduce((sum, p) => sum + p.stock, 0),
    },
  ];

  // Datos de distribución por ubicación
  const distributionByLocation = products.reduce((acc: any[], product) => {
    const existing = acc.find((item) => item.name === product.location);
    if (existing) {
      existing.value += product.stock;
    } else {
      acc.push({ name: product.location, value: product.stock });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tablero de Control</h1>
        <p className="text-gray-600 mt-1">Resumen general del sistema Natudai - Bogotá, Colombia</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.name}
              onClick={() => navigate(stat.route)}
              className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 text-left w-full"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.color === "green" ? "bg-green-100" : "bg-red-100"}`}>
                  <Icon className={`h-6 w-6 ${stat.color === "green" ? "text-green-600" : "text-red-600"}`} />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-600" : "text-gray-600"
                  }`}
                >
                  {stat.trend === "up" && <ArrowUp className="h-4 w-4"/>}
                  {stat.trend === "down" && <ArrowDown className="h-4 w-4"/>}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.name}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales/Inventory Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {inventoryView === "total" ? "Ventas vs Predicción (COP)" : "Inventario por Producto"}
            </h2>
            <div className="relative">
              <select
                value={inventoryView}
                onChange={(e) => setInventoryView(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none cursor-pointer"
              >
                <option value="total">Ventas vs Predicción</option>
                <option value="byProduct">Inventario por Producto</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {inventoryView === "total" ? (
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="Ventas"
                />
                <Area
                  type="monotone"
                  dataKey="prediccion"
                  stackId="2"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.3}
                  name="Predicción"
                />
              </AreaChart>
            ) : (
              <BarChart data={inventoryByProduct}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="#10b981" name="Stock (kg)" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Product Distribution */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {distributionView === "category" ? "Distribución por Categoría" : "Distribución por Ubicación"}
            </h2>
            <div className="relative">
              <select
                value={distributionView}
                onChange={(e) => setDistributionView(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none cursor-pointer"
              >
                <option value="category">Por Categoría</option>
                <option value="location">Por Ubicación</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionView === "category" ? distributionByCategory : distributionByLocation}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(distributionView === "category" ? distributionByCategory : distributionByLocation).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Actividad Reciente
        </h2>
        <div className="space-y-4">
          {/* Mostrar últimos pedidos */}
          {orders.length > 0 && orders.slice(-4).reverse().map((order, index) => (
            <div
              key={`order-${index}`}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  Nuevo pedido {order.orderId} de {order.customer}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{order.orderDate}</p>
              </div>
            </div>
          ))}

          {/* Mostrar alertas de stock bajo */}
          {products
            .filter((p) => p.stock < p.minStock)
            .slice(0, 2)
            .map((product, index) => (
              <div
                key={`alert-${index}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    Alerta: Stock bajo de {product.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Stock: {product.stock} {product.unit} (mín: {product.minStock})
                  </p>
                </div>
              </div>
            ))}

          {/* Si no hay actividad reciente */}
          {orders.length === 0 && products.filter((p) => p.stock < p.minStock).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay actividad reciente
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

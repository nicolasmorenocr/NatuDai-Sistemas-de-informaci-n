import { useState } from "react";
import {
  Search,
  Plus,
  AlertTriangle,
  Package,
  Edit2,
  Trash2,
  Filter,
  Minus,
  X,
  CheckCircle,
} from "lucide-react";
import {
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

interface Product {
  id: string;
  name: string;
  sku: string;
  category: "cosmetico" | "alimenticio";
  stock: number;
  minStock: number;
  unit: string;
  location: string;
  lastUpdated: string;
  description?: string;
  productionCost?: number;
  salePrice?: number;
}

export function Inventory() {
  const { products, addProduct, updateProduct, deleteProduct } =
    useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "cosmetico" | "alimenticio"
  >("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);
  const [notification, setNotification] = useState<
    string | null
  >(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: 0,
    productionCost: 0,
    salePrice: 0,
    category: "cosmetico" as "cosmetico" | "alimenticio",
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    stock: 0,
    minStock: 0,
    productionCost: 0,
    salePrice: 0,
    category: "cosmetico" as "cosmetico" | "alimenticio",
    location: "",
  });

  // Crear stockData desde los productos del contexto
  const stockData = products.map((p) => ({
    name:
      p.name.length > 15
        ? p.name.substring(0, 15) + "..."
        : p.name,
    "Stock Actual": p.stock,
    "Stock Mínimo": p.minStock,
  }));

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      product.sku
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(
    (p) => p.stock < p.minStock,
  );

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditFormData({
      name: product.name,
      description: product.description || "",
      stock: product.stock,
      minStock: product.minStock,
      productionCost: product.productionCost || 0,
      salePrice: product.salePrice || 0,
      category: product.category,
      location: product.location,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct) {
      updateProduct(selectedProduct.id, {
        name: editFormData.name,
        description: editFormData.description,
        stock: editFormData.stock,
        minStock: editFormData.minStock,
        productionCost: editFormData.productionCost,
        salePrice: editFormData.salePrice,
        category: editFormData.category,
        location: editFormData.location,
      });
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      setNotification(
        `Producto "${editFormData.name}" actualizado exitosamente`,
      );
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedProduct) {
      deleteProduct(selectedProduct.id);
      setIsDeleteModalOpen(false);
      setNotification(
        `Producto "${selectedProduct.name}" eliminado exitosamente`,
      );
      setTimeout(() => setNotification(null), 3000);
      setSelectedProduct(null);
    }
  };

  const handleQuantityChange = (delta: number) => {
    setFormData((prev) => ({
      ...prev,
      quantity: Math.max(0, prev.quantity + delta),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProduct: Product = {
      id: String(products.length + 1),
      name: formData.name,
      description: formData.description,
      sku: `PRD-${String(products.length + 1).padStart(3, "0")}`,
      category: formData.category,
      stock: formData.quantity,
      minStock: Math.floor(formData.quantity * 0.3),
      unit: "kg",
      location: "Bodega Principal - Bogotá",
      lastUpdated: new Date().toISOString().split("T")[0],
      productionCost: formData.productionCost,
      salePrice: formData.salePrice,
    };

    addProduct(newProduct);
    setIsModalOpen(false);

    // Reset form
    setFormData({
      name: "",
      description: "",
      quantity: 0,
      productionCost: 0,
      salePrice: 0,
      category: "cosmetico",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Inventarios
          </h1>
          <p className="text-gray-600 mt-1">
            Control de stock y productos
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="h-5 w-5" />
          Nuevo Producto
        </button>
      </div>

      {/* Modal para nuevo producto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/10"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                Nuevo Producto
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6"
            >
              {/* Nombre del producto */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nombre del Producto *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="Ej: Bentonita Cosmética Premium"
                />
              </div>

              {/* Descripción */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Descripción
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Describe las características del producto..."
                />
              </div>

              {/* Categoría */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Categoría *
                </label>
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as
                        | "cosmetico"
                        | "alimenticio",
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                >
                  <option value="cosmetico">
                    Grado Cosmético
                  </option>
                  <option value="alimenticio">
                    Grado Alimenticio
                  </option>
                </select>
              </div>

              {/* Cantidad con botones + y - */}
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Cantidad (kg) *
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-10)}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  >
                    <Minus className="h-5 w-5 text-gray-700" />
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: Number(e.target.value),
                      })
                    }
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-center text-lg font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(10)}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  >
                    <Plus className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Costos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Costo de Producción */}
                <div>
                  <label
                    htmlFor="productionCost"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Costo de Producción *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      id="productionCost"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.productionCost}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          productionCost: Number(
                            e.target.value,
                          ),
                        })
                      }
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Precio de Venta */}
                <div>
                  <label
                    htmlFor="salePrice"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Precio de Venta *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      id="salePrice"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.salePrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          salePrice: Number(e.target.value),
                        })
                      }
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Margen de ganancia */}
              {formData.productionCost > 0 &&
                formData.salePrice > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-800">
                        Margen de Ganancia:
                      </span>
                      <span className="text-lg font-bold text-green-900">
                        $
                        {(
                          formData.salePrice -
                          formData.productionCost
                        ).toFixed(2)}{" "}
                        (
                        {(
                          ((formData.salePrice -
                            formData.productionCost) /
                            formData.productionCost) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </div>
                  </div>
                )}

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-900">
                {lowStockProducts.length} producto(s) con stock
                bajo
              </h3>
              <p className="text-sm text-orange-700 font-semibold mt-1">
                Los siguientes productos están por debajo del
                stock mínimo:{" "}
                {lowStockProducts.map((p) => p.name).join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stock Overview Chart */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen de Stock vs Stock Mínimo
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Stock Actual" fill="#10b981" />
            <Bar dataKey="Stock Mínimo" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as any)
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="all">Todas las categorías</option>
              <option value="cosmetico">Grado Cosmético</option>
              <option value="alimenticio">
                Grado Alimenticio
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const isLowStock =
                  product.stock < product.minStock;
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Actualizado: {product.lastUpdated}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          product.category === "cosmetico"
                            ? "bg-green-100 text-green-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {product.category === "cosmetico"
                          ? "Cosmético"
                          : "Alimenticio"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {isLowStock && (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                        <span
                          className={`font-medium ${
                            isLowStock
                              ? "text-orange-600"
                              : "text-gray-900"
                          }`}
                        >
                          {product.stock} {product.unit}
                        </span>
                        <span className="text-sm text-gray-500">
                          (mín: {product.minStock})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.location}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleEditClick(product)
                          }
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Editar producto"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteClick(product)
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar producto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de edición */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/10"
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Editar Producto
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-red-500" />
              </button>
            </div>

            <form
              onSubmit={handleEditSubmit}
              className="p-6 space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  required
                  value={editFormData.category}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      category: e.target.value as
                        | "cosmetico"
                        | "alimenticio",
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                >
                  <option value="cosmetico">
                    Grado Cosmético
                  </option>
                  <option value="alimenticio">
                    Grado Alimenticio
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Actual (kg) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editFormData.stock}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Mínimo (kg) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editFormData.minStock}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        minStock: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.location}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      location: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Costo de Producción *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={editFormData.productionCost}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          productionCost: Number(
                            e.target.value,
                          ),
                        })
                      }
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio de Venta *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={editFormData.salePrice}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          salePrice: Number(e.target.value),
                        })
                      }
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {isDeleteModalOpen && selectedProduct && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/10"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmar Eliminación
                </h3>
                <p className="text-sm text-gray-600">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                ¿Estás seguro de que deseas eliminar el producto{" "}
                <strong className="text-gray-900">
                  {selectedProduct.name}
                </strong>
                ?
              </p>
              <p className="text-sm text-gray-600 mt-2">
                SKU: {selectedProduct.sku}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
              >
                Eliminar Producto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificación */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5" />
            <p className="font-medium">{notification}</p>
          </div>
        </div>
      )}
    </div>
  );
}
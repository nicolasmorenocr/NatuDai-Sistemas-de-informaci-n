import { useState } from "react";
import {
  ClipboardList,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Package,
  MapPin,
  User,
  Calendar,
  Plus,
  X,
  Search,
  Minus,
  Mail,
  Phone,
  Trash2,
} from "lucide-react";
import { useData } from "../../context/DataContext";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

const statusConfig = {
  pending: {
    label: "Pendiente",
    icon: Clock,
    color: "gray",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
  },
  processing: {
    label: "Procesando",
    icon: Package,
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  ready: {
    label: "Listo para Envío",
    icon: CheckCircle,
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  shipped: {
    label: "Enviado",
    icon: Truck,
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  delivered: {
    label: "Entregado",
    icon: CheckCircle,
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
};

const priorityConfig = {
  low: { label: "Baja", color: "bg-gray-400" },
  medium: { label: "Media", color: "bg-green-500" },
  high: { label: "Alta", color: "bg-yellow-500" },
  urgent: { label: "Urgente", color: "bg-red-500" },
};

export function Orders() {
  const { orders, products, addOrder, deleteOrder } = useData();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    orderDate: new Date().toISOString().split("T")[0],
    estimatedDelivery: "",
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [showValidation, setShowValidation] = useState(false);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders =
    statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  const stats = [
    {
      label: "Pendientes",
      value: orders.filter((o) => o.status === "pending").length,
      color: "gray",
    },
    {
      label: "Procesando",
      value: orders.filter((o) => o.status === "processing").length,
      color: "blue",
    },
    {
      label: "Enviados",
      value: orders.filter((o) => o.status === "shipped").length,
      color: "orange",
    },
    {
      label: "Entregados (Mes)",
      value: orders.filter((o) => o.status === "delivered").length,
      color: "green",
    },
  ];

  const totalOrder = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleAddProduct = () => {
    if (!selectedProduct || productQuantity <= 0) {
      alert("Por favor selecciona un producto y cantidad válida");
      return;
    }

    if (productQuantity > selectedProduct.stock) {
      alert(`Stock insuficiente. Disponible: ${selectedProduct.stock} ${selectedProduct.unit}`);
      return;
    }

    const newItem: OrderItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: productQuantity,
      unitPrice: selectedProduct.salePrice || 0,
      subtotal: productQuantity * (selectedProduct.salePrice || 0),
    };

    setOrderItems([...orderItems, newItem]);
    setProductSearch("");
    setSelectedProduct(null);
    setProductQuantity(1);
  };

  const handleRemoveProduct = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos obligatorios
    if (
      !formData.customerName ||
      !formData.customerEmail ||
      !formData.customerPhone ||
      !formData.shippingAddress ||
      !formData.estimatedDelivery ||
      orderItems.length === 0
    ) {
      setShowValidation(true);
      alert("Por favor complete todos los campos obligatorios y agregue al menos un producto");
      return;
    }

    const newOrder = {
      id: String(orders.length + 1),
      orderId: `PED-${String(orders.length + 1).padStart(3, "0")}`,
      customer: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      products: orderItems,
      totalAmount: totalOrder,
      status: "pending" as const,
      priority: "medium" as const,
      orderDate: formData.orderDate,
      estimatedDelivery: formData.estimatedDelivery,
      shippingAddress: formData.shippingAddress,
    };

    addOrder(newOrder);
    setIsModalOpen(false);

    // Reset form
    setFormData({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: "",
      orderDate: new Date().toISOString().split("T")[0],
      estimatedDelivery: "",
    });
    setOrderItems([]);
    setShowValidation(false);
  };

  const handleDeleteOrder = () => {
    if (orderToDelete) {
      deleteOrder(orderToDelete.id);
      setShowDeleteConfirm(false);
      setOrderToDelete(null);
      setNotification(`Pedido ${orderToDelete.orderId} eliminado exitosamente`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos y Logística</h1>
          <p className="text-gray-600 mt-1">
            Gestión de pedidos, preparación y envíos
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="h-5 w-5" />
          Nuevo Pedido
        </button>
      </div>

      {/* Modal para nuevo pedido */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 backdrop-blur-sm bg-black/10" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold text-gray-900">Nuevo Pedido</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-red-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Información del cliente */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h3 className="font-semibold text-gray-900">Información del Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.customerName}
                        onChange={(e) =>
                          setFormData({ ...formData, customerName: e.target.value })
                        }
                        className={`w-full pl-11 pr-4 py-2.5 border ${
                          showValidation && !formData.customerName
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
                        placeholder="Juan Pérez"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo Electrónico *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={formData.customerEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, customerEmail: e.target.value })
                        }
                        className={`w-full pl-11 pr-4 py-2.5 border ${
                          showValidation && !formData.customerEmail
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
                        placeholder="juan.perez@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={formData.customerPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, customerPhone: e.target.value })
                        }
                        className={`w-full pl-11 pr-4 py-2.5 border ${
                          showValidation && !formData.customerPhone
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
                        placeholder="+57 1 234 5678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección de Envío *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.shippingAddress}
                        onChange={(e) =>
                          setFormData({ ...formData, shippingAddress: e.target.value })
                        }
                        className={`w-full pl-11 pr-4 py-2.5 border ${
                          showValidation && !formData.shippingAddress
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
                        placeholder="Calle 123 #45-67, Bogotá"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Pedido (Puede escribir la fecha) *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.orderDate}
                    onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                    className="w-full px-4 py-2.5 border [color-scheme:light] border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Estimada de Entrega (Puede escribir la fecha) *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.estimatedDelivery}
                    onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                    className={`w-full px-4 py-2.5 border border-gray-300 ${
                      showValidation && !formData.estimatedDelivery
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg [color-scheme:light] focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
                  />
                </div>
              </div>

              {/* Productos */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h3 className="font-semibold text-gray-900">
                  Productos * {showValidation && orderItems.length === 0 && (
                    <span className="text-red-500 text-sm ml-2">
                      Debe agregar al menos un producto
                    </span>
                  )}
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                        placeholder="Buscar producto..."
                      />
                      {productSearch && filteredProducts.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredProducts.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => {
                                setSelectedProduct(product);
                                setProductSearch(product.name);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-0"
                            >
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">
                                Stock: {product.stock} {product.unit} | Precio: $
                                {product.salePrice}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                        className="p-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={productQuantity}
                        onChange={(e) => setProductQuantity(Number(e.target.value))}
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-green-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setProductQuantity(productQuantity + 1)}
                        className="p-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddProduct}
                    className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                  >
                    Agregar Producto
                  </button>
                </div>

                {/* Lista de productos agregados */}
                {orderItems.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} kg × ${item.unitPrice} = ${item.subtotal}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-green-900">Valor Total:</span>
                  <span className="text-2xl font-bold text-green-900">
                    ${totalOrder.toLocaleString()}
                  </span>
                </div>
              </div>

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
                  Crear Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 backdrop-blur-sm bg-black/10" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">Detalles del Pedido</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Número de Pedido</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      statusConfig[selectedOrder.status].bgColor
                    } ${statusConfig[selectedOrder.status].textColor}`}
                  >
                    {statusConfig[selectedOrder.status].label}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="text-gray-900">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dirección</p>
                  <p className="text-gray-900">{selectedOrder.shippingAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de Pedido</p>
                  <p className="text-gray-900">{selectedOrder.orderDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Entrega Estimada</p>
                  <p className="text-gray-900">{selectedOrder.estimatedDelivery}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Productos</h3>
                <div className="space-y-2">
                  {selectedOrder.products.map((item: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} kg × ${item.unitPrice} = ${item.subtotal}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-green-900">Total:</span>
                  <span className="text-xl font-bold text-green-900">
                    ${selectedOrder.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className={`text-3xl font-bold text-${stat.color}-600 mt-2`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Todos
          </button>
          {Object.entries(statusConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                statusFilter === key
                  ? `bg-${config.color}-600 text-white`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const statusConf = statusConfig[order.status];
          const priorityConf = priorityConfig[order.priority];
          const StatusIcon = statusConf.icon;

          return (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {order.orderId}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusConf.bgColor} ${statusConf.textColor}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusConf.label}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${priorityConf.color}`} />
                        <span className="text-xs text-gray-500">
                          Prioridad {priorityConf.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600">{order.customer}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Productos:
                    </h4>
                    <ul className="space-y-1">
                      {order.products.map((product, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          • {product.productName} - {product.quantity} kg
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Fecha Pedido</p>
                        <p className="text-sm text-gray-900">{order.orderDate}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Entrega Estimada</p>
                        <p className="text-sm text-gray-900">
                          {order.estimatedDelivery}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Dirección</p>
                        <p className="text-sm text-gray-900">
                          {order.shippingAddress}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Package className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-sm font-bold text-gray-900">
                          ${order.totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {order.carrier && (
                    <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Transportista: <strong>{order.carrier}</strong>
                        </span>
                      </div>
                      {order.trackingNumber && (
                        <span className="text-sm text-gray-600">
                          Tracking: <strong>{order.trackingNumber}</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex lg:flex-col gap-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 lg:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                  >
                    Ver Detalles
                  </button>
                  <button
                    onClick={() => {
                      setOrderToDelete(order);
                      setShowDeleteConfirm(true);
                    }}
                    className="flex-1 lg:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No hay pedidos en esta categoría</p>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 backdrop-blur-sm bg-black/10" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
                <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                ¿Estás seguro de que deseas eliminar el pedido{" "}
                <strong className="text-gray-900">{orderToDelete.orderId}</strong> del cliente{" "}
                <strong className="text-gray-900">{orderToDelete.customer}</strong>?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteOrder}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
              >
                Eliminar Pedido
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

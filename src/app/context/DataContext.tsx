import { createContext, useContext, useState, ReactNode } from "react";

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

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderId: string;
  customer: string;
  customerEmail: string;
  customerPhone: string;
  products: OrderItem[];
  totalAmount: number;
  status: "pending" | "processing" | "ready" | "shipped" | "delivered";
  priority: "low" | "medium" | "high" | "urgent";
  orderDate: string;
  estimatedDelivery: string;
  shippingAddress: string;
  carrier?: string;
  trackingNumber?: string;
}

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

interface DataContextType {
  products: Product[];
  orders: Order[];
  sales: Sale[];
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updatedProduct: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  updateProductStock: (productId: string, newStock: number) => void;
  addOrder: (order: Order) => void;
  deleteOrder: (orderId: string) => void;
  addSale: (sale: Sale) => void;
  getProductById: (id: string) => Product | undefined;
  getProductByName: (name: string) => Product | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Bentonita Cosmética Premium",
    sku: "BENT-COS-001",
    category: "cosmetico",
    stock: 450,
    minStock: 200,
    unit: "kg",
    location: "Bodega Principal - Bogotá",
    lastUpdated: "2026-05-10",
    productionCost: 35000,
    salePrice: 45000,
  },
  {
    id: "2",
    name: "Bentonita Grado Alimenticio",
    sku: "BENT-ALI-001",
    category: "alimenticio",
    stock: 180,
    minStock: 250,
    unit: "kg",
    location: "Bodega Secundaria - Bogotá",
    lastUpdated: "2026-05-10",
    productionCost: 42000,
    salePrice: 52000,
  },
  {
    id: "3",
    name: "Polvo de Arándanos",
    sku: "POL-ARA-001",
    category: "alimenticio",
    stock: 85,
    minStock: 100,
    unit: "kg",
    location: "Bodega Secundaria - Bogotá",
    lastUpdated: "2026-05-09",
    productionCost: 95000,
    salePrice: 120000,
  },
  {
    id: "4",
    name: "Polvo de Mango",
    sku: "POL-MAN-001",
    category: "alimenticio",
    stock: 320,
    minStock: 150,
    unit: "kg",
    location: "Bodega Secundaria - Bogotá",
    lastUpdated: "2026-05-11",
    productionCost: 75000,
    salePrice: 95000,
  },
  {
    id: "5",
    name: "Arcilla Verde Cosmética",
    sku: "ARC-VER-001",
    category: "cosmetico",
    stock: 210,
    minStock: 150,
    unit: "kg",
    location: "Bodega Principal - Bogotá",
    lastUpdated: "2026-05-10",
    productionCost: 30000,
    salePrice: 38000,
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  const addProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const updateProduct = (productId: string, updatedProduct: Partial<Product>) => {
    setProducts(
      products.map((p) =>
        p.id === productId
          ? { ...p, ...updatedProduct, lastUpdated: new Date().toISOString().split("T")[0] }
          : p
      )
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts(products.filter((p) => p.id !== productId));
  };

  const updateProductStock = (productId: string, newStock: number) => {
    setProducts(
      products.map((p) =>
        p.id === productId
          ? { ...p, stock: newStock, lastUpdated: new Date().toISOString().split("T")[0] }
          : p
      )
    );
  };

  const addOrder = (order: Order) => {
    setOrders([...orders, order]);

    // Actualizar inventario
    order.products.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        updateProductStock(item.productId, product.stock - item.quantity);
      }
    });

    // Crear venta automáticamente
    order.products.forEach((item) => {
      const sale: Sale = {
        id: String(sales.length + 1),
        orderId: order.orderId,
        platform: "directo",
        product: item.productName,
        quantity: item.quantity,
        unit: "kg",
        price: item.unitPrice,
        total: item.subtotal,
        customer: order.customer,
        date: order.orderDate,
        status: "pending",
      };
      setSales((prev) => [...prev, sale]);
    });
  };

  const deleteOrder = (orderId: string) => {
    setOrders(orders.filter((o) => o.id !== orderId));
  };

  const addSale = (sale: Sale) => {
    setSales([...sales, sale]);
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  const getProductByName = (name: string) => {
    return products.find((p) => p.name.toLowerCase().includes(name.toLowerCase()));
  };

  return (
    <DataContext.Provider
      value={{
        products,
        orders,
        sales,
        addProduct,
        updateProduct,
        deleteProduct,
        updateProductStock,
        addOrder,
        deleteOrder,
        addSale,
        getProductById,
        getProductByName,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

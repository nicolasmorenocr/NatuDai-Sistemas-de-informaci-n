import { useState } from "react";
import {
  Users,
  UserPlus,
  Briefcase,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle,
  Mail,
  Phone,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Employee {
  id: string;
  name: string;
  position: string;
  department: "produccion" | "ventas" | "logistica" | "calidad" | "administracion";
  status: "active" | "vacation" | "sick" | "inactive";
  email: string;
  phone: string;
  hireDate: string;
  performance: number;
  certifications: string[];
  currentShift?: string;
}

const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "Carlos Méndez",
    position: "Supervisor de Producción",
    department: "produccion",
    status: "active",
    email: "carlos.mendez@natudai.com",
    phone: "+57 1 234 5678",
    hireDate: "2024-01-15",
    performance: 95,
    certifications: ["Manejo de Bentonita", "Control de Calidad"],
    currentShift: "Matutino",
  },
  {
    id: "2",
    name: "Ana García",
    position: "Operadora de Producción",
    department: "produccion",
    status: "active",
    email: "ana.garcia@natudai.com",
    phone: "+57 1 345 6789",
    hireDate: "2023-06-20",
    performance: 88,
    certifications: ["Procesamiento de Polvos"],
    currentShift: "Matutino",
  },
  {
    id: "3",
    name: "Roberto Sánchez",
    position: "Analista de Calidad",
    department: "calidad",
    status: "active",
    email: "roberto.sanchez@natudai.com",
    phone: "+57 1 456 7890",
    hireDate: "2024-03-10",
    performance: 92,
    certifications: ["Control de Calidad", "Certificación Cosmética"],
  },
  {
    id: "4",
    name: "María López",
    position: "Coordinadora de Ventas",
    department: "ventas",
    status: "vacation",
    email: "maria.lopez@natudai.com",
    phone: "+57 1 567 8901",
    hireDate: "2023-08-05",
    performance: 90,
    certifications: ["Gestión de Clientes"],
  },
  {
    id: "5",
    name: "José Hernández",
    position: "Encargado de Logística",
    department: "logistica",
    status: "active",
    email: "jose.hernandez@natudai.com",
    phone: "+57 1 678 9012",
    hireDate: "2023-11-12",
    performance: 85,
    certifications: ["Gestión de Almacenes"],
  },
  {
    id: "6",
    name: "Laura Martínez",
    position: "Operadora de Empaque",
    department: "produccion",
    status: "sick",
    email: "laura.martinez@natudai.com",
    phone: "+57 1 789 0123",
    hireDate: "2024-02-18",
    performance: 87,
    certifications: ["Empaque y Etiquetado"],
    currentShift: "Vespertino",
  },
];

const departmentData = [
  { name: "Producción", value: 12 },
  { name: "Ventas", value: 5 },
  { name: "Logística", value: 4 },
  { name: "Calidad", value: 3 },
  { name: "Administración", value: 4 },
];

const performanceData = [
  { range: "90-100", count: 8 },
  { range: "80-89", count: 12 },
  { range: "70-79", count: 5 },
  { range: "< 70", count: 3 },
];

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

const statusConfig = {
  active: {
    label: "Activo",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  vacation: {
    label: "Vacaciones",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  sick: {
    label: "Incapacidad",
    color: "yellow",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
  },
  inactive: {
    label: "Inactivo",
    color: "gray",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
  },
};

const departmentConfig = {
  produccion: { label: "Producción", color: "bg-green-500" },
  ventas: { label: "Ventas", color: "bg-green-600" },
  logistica: { label: "Logística", color: "bg-green-700" },
  calidad: { label: "Calidad", color: "bg-green-800" },
  administracion: { label: "Administración", color: "bg-gray-500" },
};

export function Personnel() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
  });

  const filteredEmployees =
    departmentFilter === "all"
      ? employees
      : employees.filter((e) => e.department === departmentFilter);

  const activeEmployees = employees.filter((e) => e.status === "active").length;
  const avgPerformance =
    employees.reduce((sum, e) => sum + e.performance, 0) / employees.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newEmployee: Employee = {
      id: String(employees.length + 1),
      name: formData.name,
      position: formData.position,
      email: formData.email,
      phone: formData.phone,
      department: "administracion",
      status: "active",
      hireDate: new Date().toISOString().split("T")[0],
      performance: 85,
      certifications: [],
    };

    setEmployees([...employees, newEmployee]);
    setIsModalOpen(false);

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      position: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Personal</h1>
          <p className="text-gray-600 mt-1">
            Administración de empleados, turnos y desempeño
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
        >
          <UserPlus className="h-5 w-5" />
          Nuevo Empleado
        </button>
      </div>

      {/* Modal para nuevo empleado */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">Nuevo Empleado</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Nombre */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="Ej: Juan Pérez García"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="juan.perez@natudai.com"
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="+52 55 1234 5678"
                  />
                </div>
              </div>

              {/* Rol */}
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                  Rol / Puesto *
                </label>
                <select
                  id="position"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                >
                  <option value="">Seleccionar rol...</option>
                  <option value="Supervisor de Producción">Supervisor de Producción</option>
                  <option value="Operador de Producción">Operador de Producción</option>
                  <option value="Analista de Calidad">Analista de Calidad</option>
                  <option value="Coordinador de Ventas">Coordinador de Ventas</option>
                  <option value="Ejecutivo de Ventas">Ejecutivo de Ventas</option>
                  <option value="Encargado de Logística">Encargado de Logística</option>
                  <option value="Operador de Empaque">Operador de Empaque</option>
                  <option value="Asistente Administrativo">Asistente Administrativo</option>
                  <option value="Gerente de Área">Gerente de Área</option>
                </select>
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
                  Agregar Empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{employees.length}</p>
          <p className="text-sm text-gray-600 mt-1">Total Empleados</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{activeEmployees}</p>
          <p className="text-sm text-gray-600 mt-1">Activos Hoy</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100">
              <Award className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {avgPerformance.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600 mt-1">Desempeño Promedio</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100">
              <Briefcase className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">5</p>
          <p className="text-sm text-gray-600 mt-1">Departamentos</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Empleados por Departamento
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución de Desempeño (%)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" name="Empleados" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setDepartmentFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              departmentFilter === "all"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Todos
          </button>
          {Object.entries(departmentConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setDepartmentFilter(key)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                departmentFilter === key
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Employees List */}
      <div className="space-y-4">
        {filteredEmployees.map((employee) => {
          const statusConf = statusConfig[employee.status];
          const deptConf = departmentConfig[employee.department];

          return (
            <div
              key={employee.id}
              className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-green-700">
                          {employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {employee.name}
                        </h3>
                        <p className="text-sm text-gray-600">{employee.position}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusConf.bgColor} ${statusConf.textColor}`}
                          >
                            {statusConf.label}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${deptConf.color}`} />
                          <span className="text-xs text-gray-600">
                            {deptConf.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{employee.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Teléfono</p>
                        <p className="text-sm text-gray-900">{employee.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Fecha Ingreso</p>
                        <p className="text-sm text-gray-900">{employee.hireDate}</p>
                      </div>
                    </div>

                    {employee.currentShift && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Turno</p>
                          <p className="text-sm text-gray-900">
                            {employee.currentShift}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-2">Desempeño</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            employee.performance >= 90
                              ? "bg-green-600"
                              : employee.performance >= 80
                              ? "bg-green-500"
                              : employee.performance >= 70
                              ? "bg-yellow-500"
                              : "bg-red-600"
                          }`}
                          style={{ width: `${employee.performance}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {employee.performance}%
                      </span>
                    </div>
                  </div>

                  {employee.certifications.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Certificaciones</p>
                      <div className="flex flex-wrap gap-2">
                        {employee.certifications.map((cert, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full"
                          >
                            <Award className="h-3 w-3" />
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex lg:flex-col gap-2">
                  <button className="flex-1 lg:flex-none px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition">
                    Editar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No hay empleados en este departamento</p>
        </div>
      )}
    </div>
  );
}

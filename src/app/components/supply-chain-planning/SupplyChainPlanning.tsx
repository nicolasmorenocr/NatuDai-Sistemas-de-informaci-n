import { useState } from "react";
import {
  AlertTriangle,
  Factory,
  Info,
} from "lucide-react";
import { useData } from "../../context/DataContext";

interface ProductionPlan {
  id: string;
  product: string;
  targetQuantity: number;
  currentProgress: number;
  rawMaterialsNeeded: {
    material: string;
    quantity: number;
    available: number;
  }[];
  startDate: string;
  endDate: string;
  status: "planificado" | "en-proceso" | "completado";
}

const productionPlans: ProductionPlan[] = [
  {
    id: "1",
    product: "Bentonita Cosmética Premium",
    targetQuantity: 500,
    currentProgress: 65,
    rawMaterialsNeeded: [
      { material: "Bentonita Natural", quantity: 600, available: 500 },
      { material: "Aditivos Cosméticos", quantity: 50, available: 50 },
    ],
    startDate: "2026-05-10",
    endDate: "2026-05-20",
    status: "en-proceso",
  },
  {
    id: "2",
    product: "Polvo de Arándanos",
    targetQuantity: 200,
    currentProgress: 30,
    rawMaterialsNeeded: [
      { material: "Arándanos Deshidratados", quantity: 250, available: 200 },
    ],
    startDate: "2026-05-12",
    endDate: "2026-05-18",
    status: "en-proceso",
  },
  {
    id: "3",
    product: "Arcilla Verde Cosmética",
    targetQuantity: 300,
    currentProgress: 0,
    rawMaterialsNeeded: [
      { material: "Arcilla Verde Natural", quantity: 350, available: 100 },
      { material: "Aditivos Cosméticos", quantity: 30, available: 30 },
    ],
    startDate: "2026-05-15",
    endDate: "2026-05-25",
    status: "planificado",
  },
];

export function SupplyChainPlanning() {
  const activeProduction = productionPlans.filter((p) => p.status === "en-proceso").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cadena de Suministro</h1>
        <p className="text-gray-600 mt-1">
          Transformación de insumos en producto terminado
        </p>
      </div>

      <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
              
              <div>
                <p className="text-3xl font-bold text-green-600">{activeProduction}</p>
                <p className="text-sm text-green-700 mt-1">
                  Productos en fabricación actualmente
                </p>
              </div>
            </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6">
          <div className="space-y-6">
            
            <div className="space-y-4">
              {productionPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {plan.product}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Meta: {plan.targetQuantity} kg
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        plan.status === "completado"
                          ? "bg-green-100 text-green-700"
                          : plan.status === "en-proceso"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {plan.status === "completado"
                        ? "✓ Completado"
                        : plan.status === "en-proceso"
                        ? "⚙️ En Proceso"
                        : "📋 Planificado"}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">
                      Materias Primas Necesarias:
                    </h5>
                    <div className="space-y-2">
                      {plan.rawMaterialsNeeded.map((rm, idx) => {
                        const isSufficient = rm.available >= rm.quantity;
                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-2 rounded ${
                              isSufficient ? "bg-green-50" : "bg-red-50"
                            }`}
                          >
                            <span className="text-sm text-gray-700">{rm.material}</span>
                            <div className="flex items-center gap-2">
                              {!isSufficient && (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              )}
                              <span
                                className={`text-sm font-medium ${
                                  isSufficient ? "text-green-700" : "text-red-700"
                                }`}
                              >
                                {rm.available} / {rm.quantity} kg
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progreso de fabricación</span>
                      <span className="font-semibold text-gray-900">
                        {plan.currentProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${plan.currentProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Inicio: {plan.startDate}</span>
                      <span>Fin: {plan.endDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

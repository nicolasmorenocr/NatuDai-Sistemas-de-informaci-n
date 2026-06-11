import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { Lock, Mail, X } from "lucide-react";
import logoImage from "../../../imports/image.png";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = await login(email, password);

    if (success) {
      navigate("/");
    } else {
      setError("Credenciales inválidas");
    }

    setLoading(false);
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError("");
    setLoading(true);

    // Simulación de envío de email de recuperación
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setRecoverySuccess(true);
    setLoading(false);
  };

  const closeRecoveryModal = () => {
    setShowRecoveryModal(false);
    setRecoveryEmail("");
    setRecoverySuccess(false);
    setRecoveryError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4">
              <img src={logoImage} alt="Natudai" className="h-20 w-auto" />
            </div>
            <p className="text-gray-600 mt-2">Sistema de Gestión Empresarial</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(true)}
                  className="text-sm text-green-600 hover:text-green-700 hover:underline transition"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Demo:</strong> Usa cualquier email y contraseña para ingresar
            </p>
          </div>
        </div>
      </div>

      {showRecoveryModal && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
            <button
              onClick={closeRecoveryModal}
              className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Recuperar Contraseña</h2>
            <p className="text-gray-600 mb-6">
              Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
            </p>

            {!recoverySuccess ? (
              <form onSubmit={handleRecoverySubmit} className="space-y-6">
                <div>
                  <label htmlFor="recoveryEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="recoveryEmail"
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                {recoveryError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {recoveryError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeRecoveryModal}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Enviando..." : "Enviar"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  <p className="font-medium mb-1">¡Correo enviado!</p>
                  <p className="text-sm">
                    Hemos enviado las instrucciones de recuperación a <strong>{recoveryEmail}</strong>.
                    Revisa tu bandeja de entrada y sigue los pasos indicados.
                  </p>
                </div>
                <button
                  onClick={closeRecoveryModal}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition"
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

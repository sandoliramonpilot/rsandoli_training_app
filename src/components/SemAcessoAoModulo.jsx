import { useNavigate } from "react-router-dom";

export default function SemAcessoAoModulo() {
  const navigate = useNavigate();
  return (
    <div className="max-w-lg mx-auto mt-16 text-center space-y-4">
      <h2 className="text-xl font-semibold text-slate-100">
        Nenhum módulo liberado
      </h2>
      <p className="text-sm text-slate-400">
        Sua conta ainda não tem acesso a um módulo de treinamento. Fale com o
        administrador para liberar o AW119 ou o H125.
      </p>
      <button
        onClick={() => navigate("/dashboard")}
        className="px-4 py-2 rounded-lg bg-amber-500 text-slate-900 text-sm font-medium"
      >
        Voltar ao dashboard
      </button>
    </div>
  );
}
import { useNavigate } from "react-router-dom";

export default function SemAcessoAoModulo() {
  const navigate = useNavigate();
  return (
    <div className="max-w-lg mx-auto mt-16 text-center space-y-4">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">{training.name}</h1>
      <p className="text-slate-400 mt-2 text-sm max-w-2xl">{data.subtitle}</p>
      <span className="text-[11px] text-slate-500 uppercase tracking-wider">{training.label}</span>
      <h2 className="text-2xl font-bold tracking-tight text-slate-100">{training.name}</h2>
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

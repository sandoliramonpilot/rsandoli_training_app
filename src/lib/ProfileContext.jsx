import { TRAINING_BY_AIRCRAFT } from "@/lib/trainingData";

// dentro do provider, depois de obter o user:

const [aircraft, setAircraft] = useState(null);

const modulosPermitidos = useMemo(() => {
  const lista = Array.isArray(user?.modulos_habilitados)
    ? user.modulos_habilitados
    : ["AW119"]; // campo ainda não existe na base: comportamento legado
  return lista.filter((m) => TRAINING_BY_AIRCRAFT[m]);
}, [user]);

useEffect(() => {
  if (!user) return;
  const salvo = localStorage.getItem("aircraft");
  const inicial = modulosPermitidos.includes(salvo)
    ? salvo
    : modulosPermitidos[0] ?? null;
  setAircraft(inicial);
  if (inicial) localStorage.setItem("aircraft", inicial);
}, [user, modulosPermitidos]);

const trocarAeronave = (novo) => {
  if (!modulosPermitidos.includes(novo)) return false;
  localStorage.setItem("aircraft", novo);
  setAircraft(novo);
  return true;
};

const profileValue = aircraft;
const profileFilter = aircraft ? { aircraftProfile: aircraft } : {};

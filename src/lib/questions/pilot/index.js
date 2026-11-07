import { M04_VEMD } from "./m04-vemd";

// Lote piloto: 20 questões em technical_review, active=false.
// As demais questões serão cadastradas progressivamente após revisão técnica.
export const PILOT_QUESTIONS = [
  ...M04_VEMD,
  // ...M01_DOCUMENTAL, M02_GENERALIDADES, M05_MOTOR,
  // M06_COMBUSTIVEL, M10_HIDRAULICO, M11_ELETRICO, M14_PESO_BALANCEAMENTO
];

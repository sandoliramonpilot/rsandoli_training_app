import { M01_DOCUMENTAL } from "./m01-documental";
import { M02_GENERALIDADES } from "./m02-generalidades";
import { M04_VEMD } from "./m04-vemd";
import { M05_MOTOR } from "./m05-motor";
import { M06_COMBUSTIVEL } from "./m06-combustivel";
import { M10_HIDRAULICO } from "./m10-hidraulico";
import { M11_ELETRICO } from "./m11-eletrico";
import { M14_PESO_BALANCEAMENTO } from "./m14-peso-balanceamento";

// Lote piloto: 20 questões em technical_review, active=false.
export const PILOT_QUESTIONS = [
  ...M01_DOCUMENTAL,
  ...M02_GENERALIDADES,
  ...M04_VEMD,
  ...M05_MOTOR,
  ...M06_COMBUSTIVEL,
  ...M10_HIDRAULICO,
  ...M11_ELETRICO,
  ...M14_PESO_BALANCEAMENTO,
];

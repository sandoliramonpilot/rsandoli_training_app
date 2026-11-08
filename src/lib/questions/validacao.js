import {
  QUESTION_TYPES, COGNITIVE_LEVELS, DIFFICULTIES, CONTENT_STATUS,
  APPLICABILITY, MODULES, SAFETY_CRITICAL_MODULES, COURSE_ID,
} from "./schema";

const MODULE_IDS = new Set(MODULES.map((m) => m.id));

export function validarQuestao(q) {
  const erros = [];

  if (!q.questionCode) erros.push("questionCode ausente");
  if (!/^H125-B2V-M\d{2}-Q\d{3}$/.test(q.questionCode || "")) {
    erros.push("questionCode fora do padrão H125-B2V-MNN-QNNN");
  }
  if (q.courseId !== COURSE_ID) erros.push(`courseId deve ser "${COURSE_ID}"`);
  if (!MODULE_IDS.has(q.moduleId)) erros.push(`moduleId inválido: ${q.moduleId}`);
  if (!QUESTION_TYPES.includes(q.type)) erros.push(`type inválido: ${q.type}`);
  if (!COGNITIVE_LEVELS.includes(q.cognitiveLevel)) erros.push("cognitiveLevel inválido");
  if (!DIFFICULTIES.includes(q.difficulty)) erros.push("difficulty inválida");
  if (!CONTENT_STATUS.includes(q.status)) erros.push("status inválido");
  if (!APPLICABILITY.includes(q.applicability?.classification)) {
    erros.push("applicability.classification inválida");
  }
  if (!q.questionText?.trim()) erros.push("questionText vazio");
  if (!q.answerExplanation?.trim()) erros.push("answerExplanation vazia");
  if (!q.source?.documentTitle) erros.push("source.documentTitle ausente");
  if (!q.source?.section) erros.push("source.section ausente");

  if (q.type === "single_choice") {
    if (!Array.isArray(q.options) || q.options.length < 2) {
      erros.push("single_choice exige ao menos 2 alternativas");
    }
    if (!Array.isArray(q.correctAnswer) || q.correctAnswer.length !== 1) {
      erros.push("single_choice exige exatamente 1 resposta correta");
    }
  }

  if (q.type === "multiple_choice") {
    if (!Array.isArray(q.correctAnswer) || q.correctAnswer.length < 2) {
      erros.push("multiple_choice exige ao menos 2 respostas corretas");
    }
  }

  if (q.type === "true_false") {
    if (!Array.isArray(q.options) || q.options.length !== 2) {
      erros.push("true_false exige exatamente 2 opções");
    }
  }

  if (Array.isArray(q.options) && Array.isArray(q.correctAnswer)) {
    const ids = new Set(q.options.map((o) => o.id));
    q.correctAnswer.forEach((a) => {
      if (!ids.has(a)) erros.push(`resposta "${a}" não existe nas alternativas`);
    });
    const textos = q.options.map((o) => o.text?.trim().toLowerCase());
    if (new Set(textos).size !== textos.length) {
      erros.push("alternativas duplicadas");
    }
  }

  if (SAFETY_CRITICAL_MODULES.includes(q.moduleId) && !q.safetyCritical) {
    erros.push(`módulo ${q.moduleId} exige safetyCritical = true`);
  }

  if (q.safetyCritical) {
    if (!q.source?.printedPage && !q.source?.pdfPage) {
      erros.push("questão crítica exige página da fonte");
    }
    if (!q.source?.revision) erros.push("questão crítica exige revisão da fonte");
  }

  return { valida: erros.length === 0, erros };
}

export function validarLote(questoes) {
  const codigos = new Set();
  const problemas = [];

  questoes.forEach((q, i) => {
    const { valida, erros } = validarQuestao(q);
    if (!valida) {
      problemas.push({ indice: i, codigo: q.questionCode, erros });
    }
    if (codigos.has(q.questionCode)) {
      problemas.push({ indice: i, codigo: q.questionCode, erros: ["código duplicado"] });
    }
    codigos.add(q.questionCode);
  });

  return {
    total: questoes.length,
    validas: questoes.length - problemas.length,
    problemas,
  };
}

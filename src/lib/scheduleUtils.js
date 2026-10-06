// Schedule utilities — overlap detection, time helpers, labels

export const PERIOD_LABELS = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
  integral: "Integral",
  outro: "Outro",
};

export const STATUS_LABELS = {
  planejada: "Planejada",
  confirmada: "Confirmada",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export const STATUS_STYLES = {
  planejada: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  confirmada: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  em_andamento: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  concluida: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  cancelada: "bg-rose-500/10 text-rose-300 border-rose-500/30",
};

// Converte "HH:MM" para minutos desde meia-noite
export function toMinutes(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

// Verifica se dois intervalos de tempo se sobrepõem
export function timesOverlap(startA, endA, startB, endB) {
  const sa = toMinutes(startA), ea = toMinutes(endA);
  const sb = toMinutes(startB), eb = toMinutes(endB);
  if (sa === null || ea === null || sb === null || eb === null) return false;
  return sa < eb && sb < ea;
}

// Coleta todos os tripulantes de uma escala (piloto + copiloto)
function crewMembers(shift) {
  const members = [];
  if (shift.crew_pilot_id) members.push({ id: shift.crew_pilot_id, name: shift.crew_pilot_name, role: "Piloto" });
  if (shift.crew_copilot_id) members.push({ id: shift.crew_copilot_id, name: shift.crew_copilot_name, role: "Copiloto" });
  return members;
}

// Detecta sobreposições entre escalas — mesmo piloto em turnos sobrepostos no mesmo dia
export function detectOverlaps(schedules) {
  const overlaps = [];
  const byDate = {};
  schedules.forEach((s) => {
    if (!s.date || s.status === "cancelada") return;
    if (!byDate[s.date]) byDate[s.date] = [];
    byDate[s.date].push(s);
  });

  Object.entries(byDate).forEach(([date, shifts]) => {
    for (let i = 0; i < shifts.length; i++) {
      for (let j = i + 1; j < shifts.length; j++) {
        const a = shifts[i], b = shifts[j];
        if (!timesOverlap(a.start_time, a.end_time, b.start_time, b.end_time)) continue;

        const crewA = crewMembers(a);
        const crewB = crewMembers(b);
        const conflicts = [];
        crewA.forEach((ca) => {
          crewB.forEach((cb) => {
            if (ca.id === cb.id) {
              conflicts.push({
                person: ca.name || ca.id,
                roleA: ca.role,
                roleB: cb.role,
              });
            }
          });
        });

        if (conflicts.length > 0) {
          overlaps.push({ date, shiftA: a, shiftB: b, conflicts });
        }
      }
    }
  });

  return overlaps.sort((x, y) => x.date.localeCompare(y.date));
}

// Verifica se uma nova/editada escala gera sobreposição com as existentes
export function checkShiftOverlap(shift, allSchedules) {
  const conflicts = [];
  allSchedules.forEach((s) => {
    if (s.id === shift.id) return;
    if (s.date !== shift.date) return;
    if (s.status === "cancelada") return;
    if (!timesOverlap(shift.start_time, shift.end_time, s.start_time, s.end_time)) return;

    const crewNew = crewMembers(shift);
    const crewExisting = crewMembers(s);
    crewNew.forEach((cn) => {
      crewExisting.forEach((ce) => {
        if (cn.id === ce.id) {
          conflicts.push({
            person: cn.name || cn.id,
            existingShift: s,
            roleNew: cn.role,
            roleExisting: ce.role,
          });
        }
      });
    });
  });
  return conflicts;
}

// Gera grade do mês para o calendário
export function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay(); // 0 = domingo
  const daysInMonth = lastDay.getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells = [];
  // Dias do mês anterior para preencher a primeira semana
  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, inMonth: false, date: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push({
      day: d,
      inMonth: true,
      date: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      isToday: isSameDay(date, new Date()),
    });
  }
  // Preencher até completar 6 semanas (42 células)
  let nextDay = 1;
  while (cells.length < 42) {
    cells.push({ day: nextDay++, inMonth: false, date: null });
  }
  return cells;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
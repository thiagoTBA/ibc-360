const cursos = Array.isArray(window.CONECTA_CURSOS) ? window.CONECTA_CURSOS : [];
const meta = window.CONECTA_META || {};
const cfg = window.CONECTA_CONFIG || {};
const labels = window.IBC360_LABEL_HELPERS || { get: course => ({ official: course.nome_curso, public_title: course.nome_curso, subtitle: course.resumo_aluno, status: "", badge: "" }), badge: () => "" };
const favoritos = window.IBC360_FAVORITOS || { all:()=>[], has:()=>false, count:()=>0, toggle:()=>false };
const analytics = window.IBC360_ANALYTICS || { track:()=>{} };
const $ = selector => document.querySelector(selector);
const norm = value => String(value || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
let somenteSalvos = new URLSearchParams(location.search).get("salvos") === "1";

function uniq(key) {
  return [...new Set(cursos.map(course => course[key]).filter(Boolean))].sort((a,b) => String(a).localeCompare(String(b), "pt-BR"));
}
function fill(element, values) {
  values.forEach(value => { const option = document.createElement("option"); option.value = value; option.textContent = value; element.appendChild(option); });
}
function requirements(course) {
  const list = Array.isArray(course.requisitos_resumidos) ? course.requisitos_resumidos : [];
  return list.length ? `<div class="card-requirements"><strong>Pré-requisitos:</strong>${list.map(item => `<span>${esc(item)}</span>`).join("")}</div>` : "";
}
function favoriteButton(course) {
  const saved = favoritos.has(course.turma_id);
  return `<button class="favorite-button${saved ? " is-favorite" : ""}" type="button" data-favorite-id="${esc(course.turma_id)}" aria-pressed="${saved}" aria-label="${saved ? "Remover curso dos salvos" : "Salvar curso"}"><span aria-hidden="true">${saved ? "♥" : "♡"}</span><span class="favorite-label">${saved ? "Salvo" : "Salvar"}</span></button>`;
}
function card(course) {
  const info = labels.get(course);
  const article = document.createElement("article");
  article.className = "course-card";
  article.dataset.courseId = course.turma_id;
  article.dataset.versionStatus = info.status;
  article.innerHTML = `<div class="course-card-top"><div class="tags"><span class="tag turno">${esc(course.turno)}</span><span class="tag">${esc(course.carga_publica)}</span><span class="tag ok">${esc(course.vagas_publicas)} vagas</span></div>${favoriteButton(course)}</div>${labels.badge(info)}<h3>${esc(info.public_title)}</h3><p class="course-public-subtitle">${esc(info.subtitle)}</p><p class="card-summary">${esc(course.resumo_aluno)}</p>${requirements(course)}<div class="mini-meta"><span><strong>Horário:</strong> ${esc(course.horario || "Consulte o edital")}</span><span><strong>Período:</strong> ${esc(course.inicio_publico)} a ${esc(course.termino_publico)}</span><span><strong>Ambiente:</strong> ${esc(course.ambiente)}</span></div><div class="tags"><span class="tag">${esc(course.area)}</span></div><div class="card-footer"><a class="btn btn-accent" href="${esc(course.pagina)}">Ver curso</a><a class="btn btn-soft" data-portal-link href="${esc(cfg.portalInscricaoUrl || "https://inscricao.cetam.am.gov.br/")}" target="_blank" rel="noopener">Portal Oficial</a></div>`;
  return article;
}
function match(course) {
  const info = labels.get(course);
  const query = norm($("#busca").value);
  const haystack = norm([course.nome_curso, info.public_title, info.subtitle, info.badge, course.area, course.turno, course.horario, course.ambiente, course.resumo_aluno, course.pre_requisitos_publicos].join(" "));
  return (!query || haystack.includes(query))
    && (!$("#turno").value || course.turno === $("#turno").value)
    && (!$("#area").value || course.area === $("#area").value)
    && (!$("#versao").value || info.status === $("#versao").value)
    && (!somenteSalvos || favoritos.has(course.turma_id));
}
function updateFavoritesButton() {
  const button = $("#favoritesFilter"); if (!button) return;
  const count = favoritos.count();
  button.classList.toggle("is-active", somenteSalvos);
  button.setAttribute("aria-pressed", String(somenteSalvos));
  button.innerHTML = `<span aria-hidden="true">${somenteSalvos ? "♥" : "♡"}</span> Meus cursos salvos <strong>${count}</strong>`;
  const note = $("#favoritesNote");
  if (note) note.textContent = count ? `${count} curso(s) salvo(s) neste aparelho. Use o botão para exibir somente eles.` : "Use o coração dos cards para guardar cursos neste aparelho.";
}
function render() {
  const items = cursos.filter(match); $("#grid").innerHTML = ""; items.forEach(course => $("#grid").appendChild(card(course))); $("#contador").textContent = items.length;
  if (!items.length) $("#grid").innerHTML = somenteSalvos ? '<div class="empty-state"><strong>Nenhum curso salvo.</strong><p>Use o coração nos cards para guardar suas opções e comparar depois.</p></div>' : '<p class="muted">Nenhuma turma encontrada com esses filtros.</p>';
  updateFavoritesButton();
}
fill($("#turno"), uniq("turno")); fill($("#area"), uniq("area"));
const metrics = meta.metricas || {}; $("#mTurmas").textContent = metrics.turmas || 0; $("#mCursos").textContent = metrics.cursos_unicos || 0; $("#mVagas").textContent = metrics.vagas || 0;
["#busca", "#turno", "#area", "#versao"].forEach(selector => { $(selector)?.addEventListener("input", render); $(selector)?.addEventListener("change", render); });
$("#limpar").addEventListener("click", () => { ["#busca", "#turno", "#area", "#versao"].forEach(selector => { if ($(selector)) $(selector).value = ""; }); somenteSalvos = false; render(); });
$("#favoritesFilter")?.addEventListener("click", () => { somenteSalvos = !somenteSalvos; render(); });
$("#grid").addEventListener("click", event => { const button = event.target.closest("[data-favorite-id]"); if (!button) return; const c=cursos.find(x=>x.turma_id===button.dataset.favoriteId); const state=favoritos.toggle(button.dataset.favoriteId); analytics.track("favorite_toggle",{course_id:c?.turma_id,course_name:c?.nome_curso,turno:c?.turno,meta:{saved:state}}); render(); });
window.addEventListener("ibc360:favoritos", render); render();

let searchTimer;
$("#busca")?.addEventListener("input", () => { clearTimeout(searchTimer); searchTimer=setTimeout(()=>analytics.track("catalog_search",{meta:{used:Boolean($("#busca").value),results:cursos.filter(match).length}}),700); });
[["turno","#turno"],["area","#area"],["versao","#versao"]].forEach(([key,sel])=>$(sel)?.addEventListener("change",()=>analytics.track("catalog_filter",{meta:{filter:key,value:$(sel).value||"todos"}})));

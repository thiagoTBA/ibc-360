const courses = Array.isArray(window.CONECTA_CURSOS) ? window.CONECTA_CURSOS : [];
const experiences = window.IBC360_COURSE_EXPERIENCE || {};
const paths = window.IBC360_COURSE_PATHS || {};
const cfg = window.CONECTA_CONFIG || {};
const labels = window.IBC360_LABEL_HELPERS || { get: course => ({ official: course.nome_curso, public_title: course.nome_curso, subtitle: course.resumo_aluno, status: "", badge: "", edition_note: "" }), badge: () => "" };
const favoritos = window.IBC360_FAVORITOS || { has:()=>false, toggle:()=>false };
const analytics = window.IBC360_ANALYTICS || { track:()=>{} };
const id = document.body.dataset.courseId;
const course = courses.find(item => item.turma_id === id);
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const trimText = (value, n=150) => { const s=String(value||''); return s.length>n ? `${s.slice(0,n-1).trim()}…` : s; };

function list(items, cls="") {
  return Array.isArray(items) && items.length
    ? `<ul class="${cls}">${items.map(item => `<li>${esc(item)}</li>`).join("")}</ul>`
    : '<p class="muted">Consulte as informações do curso.</p>';
}
function pickCourse(name) {
  const matches = courses.filter(c => c.nome_curso === name);
  if (!matches.length) return null;
  return matches.find(c => c.turno === course.turno) || matches[0];
}

function environmentSection(course) {
  if (cfg.mostrarAmbientesEstudo === false) return '';
  const ambiente = String(course.ambiente || 'Consulte a ficha da turma');
  const isInfoLab = /laborat[oó]rio de inform[aá]tica/i.test(ambiente);
  const isESD = /\besd\b/i.test(ambiente);
  let media = '';
  if (isInfoLab) {
    media = `<div class="course-environment-media"><img src="../assets/img/galeria/lab-informatica-01.jpg" alt="Exemplo de laboratório de informática do IBC"><img src="../assets/img/galeria/lab-informatica-04.jpg" alt="Outro exemplo de laboratório de informática do IBC"></div><p class="environment-caption">Fotos de referência dos laboratórios de informática da unidade; a turma está indicada para <strong>${esc(ambiente)}</strong>.</p>`;
  } else if (isESD) {
    media = `<div class="course-environment-reference"><span aria-hidden="true">⌁</span><div><strong>Ambiente indicado: ${esc(ambiente)}</strong><p>Esta página não possui foto específica deste laboratório. Consulte a página de ambientes para conhecer outros espaços técnicos da unidade.</p></div></div>`;
  } else {
    media = `<div class="course-environment-reference"><span aria-hidden="true">⌖</span><div><strong>Ambiente indicado: ${esc(ambiente)}</strong><p>Consulte este campo como referência para a turma e confirme a orientação ao chegar à unidade.</p></div></div>`;
  }
  return `<section class="experience-section course-environment"><span class="eyebrow">Onde você vai estudar</span><h2>Conheça o ambiente indicado para esta turma.</h2><p class="muted">Na oferta, esta turma está associada a <strong>${esc(ambiente)}</strong>. A organização do espaço pode variar conforme a programação acadêmica.</p>${media}<div class="actions"><a class="btn btn-soft" href="../infraestrutura.html">Ver ambientes de estudo</a><a class="btn btn-soft" href="../unidade.html">Atendimento e localização</a></div></section>`;
}

function miniCourse(name, className='') {
  const target = pickCourse(name); if (!target) return '';
  const info = labels.get(target);
  return `<a class="path-course ${className}" href="../${esc(target.pagina)}"><strong>${esc(info.public_title)}</strong><span>${esc(target.turno)} · ${esc(target.carga_publica)}</span></a>`;
}
function updateSaveButton(button) {
  const saved = favoritos.has(course.turma_id);
  button.classList.toggle("is-favorite", saved);
  button.setAttribute("aria-pressed", String(saved));
  button.innerHTML = `<span aria-hidden="true">${saved ? "♥" : "♡"}</span> ${saved ? "Curso salvo" : "Salvar curso"}`;
}

if (!course) {
  document.body.innerHTML = '<main class="section"><h1>Curso não encontrado</h1><a href="../index.html">Voltar aos cursos do IBC</a></main>';
} else {
  const xp = experiences[course.nome_curso] || {};
  const path = paths[course.nome_curso] || {};
  const label = labels.get(course);
  const theme = xp.theme || "default";
  document.body.classList.add("course-experience", `theme-${theme}`);
  document.documentElement.style.setProperty('--course-symbol', `"${xp.icon || '•'}"`);
  document.title = `${label.public_title} — IBC 360`;
  $("#courseTitle").textContent = label.public_title;
  $("#courseSummary").textContent = label.subtitle;
  $("#courseTags").innerHTML = `${labels.badge(label)}<span class="tag turno">${esc(course.turno)}</span><span class="tag">${esc(course.area)}</span>`;
  const heroTitle = $("#courseTitle");
  if (heroTitle) {
    const official = document.createElement("p");
    official.className = "official-course-name";
    official.textContent = `Nome oficial da oferta: ${course.nome_curso}`;
    heroTitle.insertAdjacentElement("afterend", official);
  }
  const hero = document.querySelector('.page-hero');
  if (hero) {
    hero.classList.add('course-themed-hero');
    const visual = document.createElement('div');
    visual.className = 'course-visual-mark';
    visual.setAttribute('aria-hidden','true');
    visual.innerHTML = `<span>${esc(xp.icon || '•')}</span><small>${esc(xp.kicker || course.area)}</small>`;
    hero.appendChild(visual);
  }

  const video = xp.video ? `<article class="experience-section video-section"><div><span class="eyebrow">Vídeo complementar</span><h2>Entenda melhor esta área</h2><p>${esc(xp.video_title || 'Conheça a área e suas possibilidades')} — ${esc(xp.video_channel || 'YouTube')}.</p><p class="video-note">Vídeo reproduzido pelo player incorporado do YouTube. Conteúdo externo disponibilizado pelo respectivo canal/criador; os direitos autorais permanecem com seus respectivos titulares. Material de apoio; não integra o edital nem constitui conteúdo oficial do CETAM.</p><a class="video-youtube-link" href="https://www.youtube.com/watch?v=${encodeURIComponent(xp.video)}" target="_blank" rel="noopener">Abrir no YouTube ↗</a></div><div class="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(xp.video)}?rel=0" title="${esc(xp.video_title || course.nome_curso)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div></article>` : '';
  const editionBlock = label.edition_note ? `<article class="course-edition-card ${esc(label.status)}"><div>${labels.badge(label)}<h3>Sobre esta edição</h3><p>${esc(label.edition_note)}</p>${label.status==='updated' ? `<details class="previous-version"><summary>Já fiz uma versão anterior deste curso</summary><p>Esta edição está identificada como conteúdo atualizado em 2026. Confira os conteúdos, os pré-requisitos e a trilha abaixo para decidir entre revisar a formação ou avançar para outro curso.</p></details>` : ''}</div></article>` : "";
  const quick = `<section class="quick-course" aria-label="Resumo do curso em 30 segundos"><div class="quick-head"><span class="eyebrow">Em 30 segundos</span><h2>Entenda rapidamente se este curso combina com você.</h2></div><div class="quick-grid"><div><span>Você vai desenvolver</span><strong>${esc(trimText((course.aprendizados_chave||[]).slice(0,2).join(' · ') || course.resumo_aluno, 135))}</strong></div><div><span>Onde pode aplicar</span><strong>${esc(trimText((xp.applications||course.projetos_possiveis||[]).slice(0,2).join(' · '), 135))}</strong></div><div><span>Perfil</span><strong>${esc(trimText(course.publico_indicado, 135))}</strong></div><div><span>Duração e turno</span><strong>${esc(course.carga_publica)} · ${esc(course.turno)}</strong></div></div></section>`;
  const entryProcess = `<section class="entry-process" aria-label="Como entrar nesta turma"><span class="eyebrow">Como entrar nesta turma</span><h2>Da escolha do curso à confirmação da matrícula.</h2><p class="muted">O IBC 360 ajuda na consulta. A inscrição oficial acontece no Portal do Candidato e a matrícula é confirmada presencialmente após a divulgação dos pré-inscritos.</p><div class="process-grid"><div class="process-step"><span class="step-number">1</span><strong>Confira os requisitos</strong><p>${esc(course.pre_requisitos_publicos)}</p></div><div class="process-step"><span class="step-number">2</span><strong>Inscrição oficial</strong><p>17/08 às 07h até 20/08 às 23h59, horário de Manaus, no Portal do Candidato.</p></div><div class="process-step"><span class="step-number">3</span><strong>Consulte a relação</strong><p>Relação de pré-inscritos em 21/08/2026 nos canais oficiais do CETAM.</p></div><div class="process-step"><span class="step-number">4</span><strong>Confirme a matrícula</strong><p>Vaga regular: 24 e 25/08. Lista de espera: 26/08, quando convocado. Atendimento das 08h às 19h59 para validação presencial da documentação.</p></div><div class="process-step"><span class="step-number">5</span><strong>Início da turma</strong><p>${esc(course.inicio_publico)} · ${esc(course.turno)} · ${esc(course.horario)}</p></div></div></section>`
  const previous = (path.previous||[]).map(n => miniCourse(n,'previous')).join('');
  const next = (path.next||[]).map(n => miniCourse(n,'next')).join('');
  const trail = `<section class="experience-section learning-path"><span class="eyebrow">Trilha de aprendizagem</span><h2>Veja onde este curso pode entrar no seu caminho.</h2><p class="muted">${esc(path.note || 'Use esta trilha como orientação para comparar cursos e níveis.')}</p><div class="path-flow"><div class="path-stage"><span>Antes</span>${previous || '<div class="path-empty">Você pode começar por este curso.</div>'}</div><div class="path-arrow" aria-hidden="true">→</div><div class="path-stage current"><span>Você está aqui</span><div class="path-current"><strong>${esc(label.public_title)}</strong><small>${esc(course.turno)} · ${esc(course.carga_publica)}</small></div></div><div class="path-arrow" aria-hidden="true">→</div><div class="path-stage"><span>Próximos passos</span>${next || '<div class="path-empty">Explore os cursos relacionados abaixo.</div>'}</div></div></section>`;
  const relatedCards = (path.related||[]).map(name => { const target=pickCourse(name); if(!target)return ''; const inf=labels.get(target); return `<article class="related-course"><h3>${esc(inf.public_title)}</h3><p>${esc(inf.subtitle)}</p><div class="related-actions"><a class="btn btn-soft" href="../${esc(target.pagina)}">Ver curso</a><a class="btn btn-soft" href="../comparar.html?a=${encodeURIComponent(course.turma_id)}&b=${encodeURIComponent(target.turma_id)}">Comparar</a></div></article>`; }).join('');
  const related = relatedCards ? `<section class="experience-section related-section"><span class="eyebrow">Compare antes de escolher</span><h2>Talvez você também esteja considerando estes cursos.</h2><div class="related-grid">${relatedCards}</div></section>` : '';

  $("#content").innerHTML = `${quick}${entryProcess}${environmentSection(course)}<section class="section course-story"><span class="eyebrow">Sobre o curso</span><h2>${esc(xp.kicker || 'Conheça esta formação')}</h2><p class="course-lead">${esc(course.resumo_aluno)}</p>${editionBlock}<div class="experience-grid"><article class="experience-card professional-card"><span class="experience-icon" aria-hidden="true">${esc(xp.icon || '•')}</span><h3>O que faz quem atua nesta área?</h3><p>${esc(xp.professional || course.publico_indicado)}</p></article><article class="experience-card"><h3>Onde aplicar o que você aprender</h3>${list(xp.applications || course.projetos_possiveis, 'check-list')}</article></div><div class="experience-grid"><article class="experience-card"><h3>Ferramentas e conhecimentos</h3>${list(xp.tools || course.aprendizados_chave, 'chip-list')}</article><article class="experience-card"><h3>Como pode ser a rotina do curso</h3>${list(xp.routine || course.projetos_possiveis, 'check-list')}</article></div><article class="experience-section learning-section"><span class="eyebrow">Aprendizagem</span><h2>O que você vai desenvolver</h2>${list(course.aprendizados_chave, 'learning-list')}</article>${trail}${related}${video}<div class="detail-grid single-detail"><article class="box"><h3>Para quem é indicado</h3><p>${esc(course.publico_indicado)}</p></article></div><article class="box warning decision-box"><h3>Antes de escolher, entenda isto</h3><p>${esc(course.o_que_nao_e)}</p></article></section>`;

  $("#facts").innerHTML = `<div><span>Turno</span><strong>${esc(course.turno)}</strong></div><div><span>Horário</span><strong>${esc(course.horario)}</strong></div><div><span>Carga horária</span><strong>${esc(course.carga_publica)}</strong></div><div><span>Vagas</span><strong>${esc(course.vagas_publicas)}</strong></div><div><span>Início</span><strong>${esc(course.inicio_publico)}</strong></div><div><span>Término</span><strong>${esc(course.termino_publico)}</strong></div><div><span>Ambiente</span><strong>${esc(course.ambiente)}</strong></div><div><span>Unidade</span><strong>${esc(course.unidade || "Instituto Benjamin Constant")}</strong></div>`;
  $("#requirements").textContent = course.pre_requisitos_publicos;
  const reqBox = $("#requirements")?.closest(".box");

  const cta = document.querySelector(".cta-card");
  const firstAction = cta?.querySelector("a,button");
  if (cta) {
    const officialNotice = document.createElement('div');
    officialNotice.className = 'official-registration-notice';
    officialNotice.innerHTML = '<strong>3ª Oferta 2026 — Serviço de consulta.</strong><span>Esta página auxilia na consulta do curso. A inscrição é realizada exclusivamente pelo Portal do Candidato do CETAM. Em caso de divergência, prevalece o edital.</span>';
    cta.insertBefore(officialNotice, firstAction || null);
    const save = document.createElement("button");
    save.className = "btn btn-save-course";
    save.type = "button";
    updateSaveButton(save);
    save.addEventListener("click", () => { const state=favoritos.toggle(course.turma_id); updateSaveButton(save); analytics.track('favorite_toggle',{course_id:course.turma_id,course_name:course.nome_curso,turno:course.turno,meta:{saved:state}}); });
    window.addEventListener("ibc360:favoritos", () => updateSaveButton(save));
    cta.insertBefore(save, firstAction || null);
  }

  const inscription = $("#inscription");
  if (inscription) { inscription.href = cfg.portalInscricaoUrl || "https://inscricao.cetam.am.gov.br/"; inscription.hidden = false; inscription.textContent = window.IBC360_CURRENT_PHASE === "inscricoes_abertas" ? "Ir para o Portal Oficial — inscrições abertas" : "Ir para o Portal Oficial de Inscrição"; }
  const edital = $("#edital");
  if (edital) { edital.href = cfg.editaisUrl || "https://www.cetam.am.gov.br/tudo-sobre-inscricoes/"; edital.hidden = false; edital.textContent = "Consultar editais e listas"; }
  const compare = $("#compareCourse");
  if (compare) compare.href = `../comparar.html?a=${encodeURIComponent(course.turma_id)}`;
  $("#share").addEventListener("click", async () => {
    const url = cfg.baseUrlPublica ? `${cfg.baseUrlPublica.replace(/\/$/, "")}/cursos/${course.slug}.html` : location.href;
    try { if (navigator.share) await navigator.share({ title: label.public_title, text: label.subtitle, url }); else { await navigator.clipboard.writeText(url); $("#shareStatus").textContent = "Link copiado."; } analytics.track('share_course',{course_id:course.turma_id,course_name:course.nome_curso,turno:course.turno}); }
    catch (_) { $("#shareStatus").textContent = "Não foi possível compartilhar."; }
  });
  analytics.track('course_view',{course_id:course.turma_id,course_name:course.nome_curso,turno:course.turno});
}

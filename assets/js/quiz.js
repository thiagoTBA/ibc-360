const quizCourses = Array.isArray(window.CONECTA_CURSOS) ? window.CONECTA_CURSOS : [];
const labels = window.IBC360_LABEL_HELPERS || { get: c => ({ public_title:c.nome_curso, subtitle:c.resumo_aluno, badge:'' }), badge:()=>'' };
const analytics = window.IBC360_ANALYTICS || { track:()=>{} };
const normalizeText = text => String(text || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const areaLabels={tecnologia:'tecnologia e informática',idiomas:'idiomas e comunicação',inclusao:'educação e inclusão',saude:'saúde e cuidado',eletrica:'elétrica, eletrônica e automação',qualidade:'qualidade e processos',servicos:'serviços e atendimento'};
function profile(course){
  const n=normalizeText(course.nome_curso); const p={areas:[],levels:['basica'],styles:[],goals:['trabalho','explorar']};
  if(/ingles|espanhol/.test(n)){p.areas=['idiomas'];p.styles=['idioma'];}
  else if(/auxiliar em terapia|cuidador de idosos/.test(n)){p.areas=['saude'];p.styles=['pessoas'];}
  else if(/apoio escolar|transtorno do espectro autista/.test(n)){p.areas=['inclusao'];p.styles=['pessoas','computador'];}
  else if(/agente de portaria/.test(n)){p.areas=['servicos'];p.styles=['pessoas'];}
  else if(/inspetor da qualidade|lean manufacturing/.test(n)){p.areas=['qualidade'];p.styles=['dados','pessoas'];}
  else if(/descarga eletrostatica|componentes eletronicos|comandos eletricos|eletricidade basica/.test(n)){p.areas=['eletrica'];p.styles=['bancada'];}
  else{p.areas=['tecnologia'];p.styles=['computador'];}
  if(/informatica basica|ingles basico|espanhol basico|eletricidade basica|agente de portaria/.test(n)){p.levels=['iniciante','basica'];p.goals.push('iniciar');}
  if(/informatica avancada|excel avancado|power bi|banco de dados|inteligencia artificial|internet das coisas|web designer|ingles intermediario|descarga eletrostatica|python|inspetor da qualidade|lean manufacturing|comandos eletricos|componentes eletronicos/.test(n)){p.levels=['basica','avancada'];p.goals.push('avancar');}
  if(/android/.test(n)){p.levels=['avancada'];p.goals.push('avancar');}
  if(/power bi|excel avancado|banco de dados|inteligencia artificial|python|inspetor da qualidade|lean manufacturing/.test(n))p.styles.push('dados');
  if(/web designer|android/.test(n))p.styles.push('criacao');
  if(/internet das coisas|descarga eletrostatica|componentes eletronicos|comandos eletricos|eletricidade basica/.test(n))p.styles.push('bancada');
  return p;
}
function score(course,answers){const p=profile(course);let total=0;if(p.areas.includes(answers.area))total+=6;if(p.levels.includes(answers.nivel)||answers.nivel==='qualquer')total+=3;else if(answers.nivel==='iniciante'&&p.levels.includes('avancada'))total-=8;if(p.styles.includes(answers.estilo))total+=4;if(p.goals.includes(answers.objetivo))total+=2;if(answers.turno==='qualquer'||course.turno===answers.turno)total+=5;else total-=2;return total;}
function reason(course,answers){const p=profile(course),reasons=[];if(p.areas.includes(answers.area))reasons.push(`seu interesse em ${areaLabels[answers.area]||'essa área'}`);if(answers.turno==='qualquer'||course.turno===answers.turno)reasons.push(`o turno ${course.turno.toLowerCase()}`);if(p.styles.includes(answers.estilo))reasons.push('o tipo de atividade que você prefere');return reasons.length?`A recomendação considera ${reasons.join(', ')}.`:'A recomendação considera a combinação geral das suas respostas.';}
const form=document.getElementById('quizForm');const results=document.getElementById('quizResults');
form.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(form);const answers=Object.fromEntries(data.entries());const ranked=quizCourses.map(course=>({course,score:score(course,answers)})).sort((a,b)=>b.score-a.score||a.course.nome_curso.localeCompare(b.course.nome_curso,'pt-BR')).slice(0,3);results.innerHTML='<span class="eyebrow">Suas recomendações</span>'+ranked.map((item,index)=>`<article class="result-card"><span class="result-score">Sugestão ${index+1}</span>${labels.badge(labels.get(item.course))}<h3>${labels.get(item.course).public_title}</h3><p class="course-public-subtitle">${labels.get(item.course).subtitle}</p><p>${item.course.resumo_aluno}</p><p class="helper"><strong>Por que apareceu:</strong> ${reason(item.course,answers)}</p><p class="helper"><strong>${item.course.turno}</strong> · ${item.course.horario} · ${item.course.carga_publica}</p><a class="btn btn-accent" href="${item.course.pagina}">Ver informações</a></article>`).join('')+'<div class="callout"><strong>Antes da inscrição:</strong> confira idade, escolaridade, certificados e demais pré-requisitos na ficha do curso e no edital.</div>';analytics.track('quiz_completed',{meta:{recommendations:ranked.map(x=>x.course.turma_id)}});results.scrollIntoView({behavior:'smooth',block:'start'});});
form.addEventListener('reset',()=>{setTimeout(()=>{results.innerHTML='<div class="notice"><strong>Resultado</strong><p>Responda às perguntas para receber até três sugestões.</p></div>';},0)});

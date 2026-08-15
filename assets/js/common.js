(() => {
  const cfg = window.CONECTA_CONFIG || {};
  const edital = cfg.edital || {};
  const root = document.documentElement;
  const body = document.body;
  const storage = window.localStorage;
  let scale = Number(storage.getItem('ibcFontScale') || 1);
  let contrast = storage.getItem('ibcContrast') === 'true';

  body.classList.toggle('modo-defeso', Boolean(cfg.modoDefesoEleitoral));
  body.classList.toggle('modo-normal', !cfg.modoDefesoEleitoral);
  body.classList.toggle('fonte-oficial', edital.status === 'oficial');

  const apply = () => {
    root.style.setProperty('--font-scale', String(scale));
    body.classList.toggle('high-contrast', contrast);
    document.querySelectorAll('[data-contrast-status]').forEach(el => el.textContent = contrast ? 'Desativar contraste' : 'Alto contraste');
  };

  document.addEventListener('click', event => {
    const btn = event.target.closest('[data-access]');
    if (!btn) return;
    const action = btn.dataset.access;
    if (action === 'increase') scale = Math.min(1.25, +(scale + .1).toFixed(2));
    if (action === 'decrease') scale = Math.max(.9, +(scale - .1).toFixed(2));
    if (action === 'contrast') contrast = !contrast;
    if (action === 'reset') { scale = 1; contrast = false; }
    storage.setItem('ibcFontScale', String(scale));
    storage.setItem('ibcContrast', String(contrast));
    apply();
  });
  apply();

  // V20.1: menu mobile compacto. No desktop, a navegação continua aberta.
  const mainNav = document.querySelector('.nav');
  const mainNavLinks = mainNav?.querySelector('.nav-links');
  if (mainNav && mainNavLinks && !mainNav.querySelector('.nav-toggle')) {
    if (!mainNavLinks.id) mainNavLinks.id = 'menu-principal-links';
    const toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', mainNavLinks.id);
    toggle.setAttribute('aria-label', 'Abrir menu principal');
    toggle.innerHTML = '<span class="nav-toggle-icon" aria-hidden="true"><span></span></span><span class="nav-toggle-label">Menu</span>';
    mainNav.insertBefore(toggle, mainNavLinks);
    mainNav.classList.add('js-nav-ready');

    const setMenuOpen = open => {
      mainNav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu principal' : 'Abrir menu principal');
      const label = toggle.querySelector('.nav-toggle-label');
      if (label) label.textContent = open ? 'Fechar' : 'Menu';
    };

    toggle.addEventListener('click', () => setMenuOpen(!mainNav.classList.contains('is-open')));
    mainNavLinks.addEventListener('click', event => {
      if (event.target.closest('a') && window.matchMedia('(max-width: 620px)').matches) setMenuOpen(false);
    });
    document.addEventListener('click', event => {
      if (mainNav.classList.contains('is-open') && !mainNav.contains(event.target)) setMenuOpen(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && mainNav.classList.contains('is-open')) {
        setMenuOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', () => {
      if (!window.matchMedia('(max-width: 620px)').matches) setMenuOpen(false);
    });
  }

  const setHref = (selector, href) => document.querySelectorAll(selector).forEach(el => { if (href) el.href = href; });
  setHref('[data-portal-link]', cfg.portalInscricaoUrl);
  setHref('[data-editais-link]', cfg.editaisUrl);
  setHref('[data-cetam-link]', cfg.cetamUrl);
  setHref('[data-whatsapp-group]', cfg.whatsappGrupoUrl);
  setHref('[data-map-link]', cfg.mapsUrl);

  document.querySelectorAll('[data-whatsapp-group]').forEach(el => {
    el.hidden = cfg.mostrarGrupoWhatsapp === false;
    if (cfg.mostrarGrupoWhatsapp === false) el.setAttribute('aria-hidden', 'true');
  });

  if (cfg.modoDefesoEleitoral) {
    const nav = document.querySelector('.nav');
    if (nav && !document.querySelector('.service-consult-banner')) {
      const banner = document.createElement('aside');
      banner.className = 'service-consult-banner';
      banner.setAttribute('role', 'note');
      banner.innerHTML = `
        <div class="service-consult-copy">
          <strong>3ª Oferta 2026 — Serviço de consulta</strong>
          <span>Esta página reúne informações para auxiliar candidatos na consulta e escolha dos cursos ofertados no IBC. As inscrições são realizadas exclusivamente pelo Portal do Candidato do CETAM. Em caso de divergência, prevalecem as informações constantes no edital.</span>
        </div>
        <div class="service-consult-actions">
          <a class="service-link" href="${cfg.editaisUrl || '#'}" target="_blank" rel="noopener">Consultar edital</a>
          <a class="service-link primary" href="${cfg.portalInscricaoUrl || '#'}" target="_blank" rel="noopener">Portal Oficial de Inscrição</a>
        </div>`;
      nav.insertAdjacentElement('afterend', banner);
    }
  }


  const manaustime = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Manaus', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date());
    const p = type => parts.find(x => x.type === type)?.value || '00';
    return `${p('year')}${p('month')}${p('day')}${p('hour')}${p('minute')}`;
  };

  const autoPhase = () => {
    const now = manaustime();
    if (now < '202608140000') return 'catalogo';
    if (now < '202608170700') return 'edital_publicado';
    if (now <= '202608202359') return 'inscricoes_abertas';
    if (now < '202608220000') return 'resultado';
    if (now < '202608240000') return 'preparar_matricula';
    if (now <= '202608252359') return 'matricula_regular';
    if (now <= '202608262359') return 'matricula_reserva';
    if (now < '202608310000') return 'aguardando_aulas';
    return 'aulas';
  };

  const phase = cfg.fase === 'auto' ? autoPhase() : cfg.fase;
  const sourcePrefix = '';
  const statusMap = {
    catalogo: {
      label: 'Consulta da 3ª Oferta 2026',
      title: 'Consulte os cursos e prepare seu cadastro.',
      text: 'O Edital CETAM/DAC n.º 009/2026 foi publicado em 14/08/2026. O cadastro no Portal do Candidato pode ser preparado antes das inscrições.',
      action: 'Acessar Portal do Candidato', target: 'portal'
    },
    edital_publicado: {
      label: 'Edital da 3ª Oferta',
      title: 'Confira o edital e escolha seu curso.',
      text: 'As inscrições serão realizadas de 17/08 às 07h até 20/08 às 23h59, no horário de Manaus. Antes de acessar o portal, confirme os pré-requisitos.',
      action: 'Consultar edital e listas', target: 'editais'
    },
    inscricoes_abertas: {
      label: 'Inscrições abertas',
      title: 'Confira sua turma e acesse a inscrição oficial.',
      text: 'Inscrições online até 20/08 às 23h59, horário de Manaus. Confira os pré-requisitos e os dados da turma antes de concluir a inscrição.',
      action: 'Ir para o Portal Oficial — inscrições abertas', target: 'portal'
    },
    resultado: {
      label: 'Relação de pré-inscritos',
      title: 'Consulte a relação de pré-inscritos.',
      text: 'A relação de pré-inscritos será divulgada em 21/08/2026. Candidatos em vaga regular devem observar o período de confirmação presencial da matrícula.',
      action: 'Consultar editais e listas', target: 'editais'
    },
    preparar_matricula: {
      label: 'Prepare a matrícula',
      title: 'Separe seus documentos para a confirmação presencial.',
      text: 'A confirmação de matrícula das vagas regulares será em 24 e 25/08, com atendimento das 08h às 19h59. A documentação e os pré-requisitos serão validados presencialmente.',
      action: 'Consultar orientações oficiais', target: 'editais'
    },
    matricula_regular: {
      label: 'Matrícula — vaga regular',
      title: 'Período de confirmação presencial da matrícula.',
      text: 'Candidatos pré-inscritos em vaga regular devem comparecer à unidade entre 08h e 19h59 e apresentar a documentação exigida no edital.',
      action: 'Consultar edital e listas', target: 'editais'
    },
    matricula_reserva: {
      label: 'Matrícula — lista de espera',
      title: 'Acompanhe a convocação da lista de espera.',
      text: 'A confirmação presencial para candidatos convocados da lista de espera será em 26/08/2026, com atendimento das 08h às 19h59.',
      action: 'Consultar edital e listas', target: 'editais'
    },
    aguardando_aulas: {
      label: 'Próxima etapa',
      title: 'Confira sua turma antes do início das aulas.',
      text: 'As aulas desta oferta iniciam a partir de 31/08/2026. Consulte a ficha da turma para verificar horário e ambiente.',
      action: 'Ver cursos disponíveis', target: 'cursos'
    },
    aulas: {
      label: '3ª Oferta 2026',
      title: 'Consulte informações da sua turma.',
      text: 'As aulas iniciam a partir de 31/08/2026. Use o IBC 360 para conferir horário, ambiente, carga horária e demais informações.',
      action: 'Ver cursos', target: 'cursos'
    }
  };

  const status = statusMap[phase] || statusMap.catalogo;
  document.querySelectorAll('[data-status-label]').forEach(el => el.textContent = status.label);
  document.querySelectorAll('[data-status-title]').forEach(el => el.textContent = status.title);
  document.querySelectorAll('[data-status-text]').forEach(el => el.textContent = status.text);
  document.querySelectorAll('[data-status-action]').forEach(el => {
    el.textContent = status.action;
    if (status.target === 'editais') el.href = cfg.editaisUrl;
    else if (status.target === 'cursos') el.href = `${location.pathname.includes('/cursos/') ? '../' : ''}index.html#cursos`;
    else el.href = cfg.portalInscricaoUrl;
  });

  window.IBC360_CURRENT_PHASE = phase;
})();

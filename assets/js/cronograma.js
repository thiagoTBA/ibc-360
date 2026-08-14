(() => {
  const cards = [...document.querySelectorAll('[data-schedule-grid] .schedule-card')];
  const status = document.getElementById('scheduleStatus');
  if (!cards.length) return;

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Manaus', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date());
  const p = type => parts.find(part => part.type === type)?.value || '00';
  const now = `${p('year')}-${p('month')}-${p('day')}T${p('hour')}:${p('minute')}`;

  const key = (date, time, isEnd=false) => `${date}T${time || (isEnd ? '23:59' : '00:00')}`;
  const formatDate = value => {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  };

  let activeCards = [];
  let nextCard = null;

  cards.forEach(card => {
    const startDate = card.dataset.start;
    const endDate = card.dataset.end || startDate;
    const start = key(startDate, card.dataset.startTime, false);
    const end = key(endDate, card.dataset.endTime, true);
    card.classList.remove('schedule-current', 'schedule-completed', 'schedule-next');
    card.querySelector('.schedule-state')?.remove();

    if (now > end) {
      card.classList.add('schedule-completed');
      const badge = document.createElement('span');
      badge.className = 'schedule-state';
      badge.textContent = 'Concluído';
      card.prepend(badge);
      return;
    }

    if (now >= start && now <= end) {
      card.classList.add('schedule-current');
      const badge = document.createElement('span');
      badge.className = 'schedule-state';
      badge.textContent = 'Etapa atual';
      card.prepend(badge);
      activeCards.push(card);
      return;
    }

    if (!nextCard || start < key(nextCard.dataset.start, nextCard.dataset.startTime, false)) nextCard = card;
  });

  if (nextCard) {
    nextCard.classList.add('schedule-next');
    const badge = document.createElement('span');
    badge.className = 'schedule-state';
    badge.textContent = 'Próxima etapa';
    nextCard.prepend(badge);
  }

  if (!status) return;
  if (activeCards.length) {
    const names = activeCards.map(card => card.querySelector('h3')?.textContent.trim()).filter(Boolean);
    const last = activeCards.sort((a,b) => key(a.dataset.end || a.dataset.start,a.dataset.endTime,true).localeCompare(key(b.dataset.end || b.dataset.start,b.dataset.endTime,true))).at(-1);
    const time = last?.dataset.endTime ? ` às ${last.dataset.endTime.replace(':','h')}` : '';
    status.innerHTML = `<strong>Etapa atual:</strong> ${names.join(' e ')} — em andamento até ${formatDate(last.dataset.end || last.dataset.start)}${time}.`;
    return;
  }
  if (nextCard) {
    const title = nextCard.querySelector('h3')?.textContent.trim() || 'Próxima etapa';
    const time = nextCard.dataset.startTime ? ` às ${nextCard.dataset.startTime.replace(':','h')}` : '';
    status.innerHTML = `<strong>Próxima etapa:</strong> ${title}, em ${formatDate(nextCard.dataset.start)}${time}.`;
    return;
  }
  status.innerHTML = '<strong>Cronograma concluído:</strong> todas as etapas desta oferta já foram realizadas.';
})();

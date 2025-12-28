// Аккордеон
function toggleAccordion(id) {
  const content = document.getElementById(id);
  const icon = document.getElementById('icon-' + id);

  content.classList.toggle('active');

  if (content.classList.contains('active')) {
    icon.textContent = '−';
  } else {
    icon.textContent = '+';
  }
}

// Загрузка и применение данных из data.json
let siteData = null;

async function loadAndApplyData() {
  try {
    // Сначала проверяем localStorage (приоритет - свежие данные из админки)
    const localData = localStorage.getItem('siteData');
    if (localData) {
      try {
        siteData = JSON.parse(localData);
        applyDataToPage();
        return;
      } catch (e) {
        console.error('Ошибка парсинга localStorage:', e);
      }
    }
    
    // Если нет в localStorage, загружаем из data.json
    const response = await fetch('data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    siteData = await response.json();
    
    // Сохраняем в localStorage для будущего использования
    localStorage.setItem('siteData', JSON.stringify(siteData));
    
    applyDataToPage();
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    // Если не удалось загрузить, оставляем данные из HTML как есть
  }
}

function applyDataToPage() {
  if (!siteData) return;

  // Обновляем профиль
  if (siteData.profile) {
    const profile = siteData.profile;
    
    const avatar = document.querySelector('.hero-avatar');
    if (avatar && profile.avatar) avatar.src = profile.avatar;
    
    const tag = document.querySelector('.hero-tag');
    if (tag && profile.tag) tag.textContent = profile.tag;
    
    const name = document.querySelector('.hero h1');
    if (name && profile.name) name.textContent = profile.name;
    
    const description = document.querySelector('.hero-description');
    if (description && profile.description) {
      description.textContent = profile.description.replace(/\n/g, ' ');
    }
    
    // Обо мне
    const aboutSection = document.querySelectorAll('.section')[0];
    if (aboutSection && profile.about) {
      const aboutContent = aboutSection.querySelector('.section-content');
      if (aboutContent) {
        aboutContent.textContent = profile.about.replace(/\n/g, ' ');
      }
    }
    
    // Навыки - это последняя секция (индекс 3: Обо мне=0, Кейсы=1, Достижения=2, Навыки=3)
    const skillsSection = document.querySelector('.section:last-of-type');
    if (skillsSection && profile.skills) {
      const skillsContent = skillsSection.querySelector('.section-content');
      if (skillsContent) skillsContent.textContent = profile.skills;
    }
    
    // Telegram ссылки
    if (profile.telegram) {
      const telegramLinks = document.querySelectorAll('a[href*="t.me"]');
      telegramLinks.forEach(link => {
        if (link.href.includes('t.me')) link.href = profile.telegram;
      });
    }
  }

  // Обновляем кейсы
  if (siteData.cases && siteData.cases.length > 0) {
    const casesContainer = document.querySelector('.case-cards');
    if (casesContainer) {
      const sortedCases = [...siteData.cases].sort((a, b) => (a.order || 0) - (b.order || 0));
      const addProjectCard = casesContainer.querySelector('.add-project-card');
      casesContainer.innerHTML = '';
      
      sortedCases.forEach(caseItem => {
        const caseCard = document.createElement('a');
        caseCard.href = caseItem.link;
        caseCard.className = 'case-card-link';
        caseCard.innerHTML = `
          <div class="case-card">
            <img src="${escapeHtml(caseItem.image)}" alt="${escapeHtml(caseItem.title)}" class="case-card-image">
            <div class="case-card-content">
              <div class="case-card-label">${escapeHtml(caseItem.label)}</div>
              <h3>${escapeHtml(caseItem.title)}</h3>
              <p>${escapeHtml(caseItem.description)}</p>
            </div>
          </div>
        `;
        casesContainer.appendChild(caseCard);
      });
      
      // Добавляем карточку "Добавить проект"
      if (addProjectCard) {
        casesContainer.appendChild(addProjectCard);
      } else {
        const telegramLink = siteData.profile?.telegram || 'https://t.me/Danielium';
        const addCard = document.createElement('a');
        addCard.href = telegramLink;
        addCard.target = '_blank';
        addCard.className = 'add-project-card';
        addCard.innerHTML = `
          <div class="add-project-icon">+</div>
          <h3>Есть идея проекта?</h3>
          <p>Напишите мне в Telegram</p>
        `;
        casesContainer.appendChild(addCard);
      }
    }
  }

  // Обновляем достижения - ВАЖНО: обновляем только содержимое списков, не трогаем структуру
  if (siteData.achievements) {
    // Конкурсы - находим элемент внутри секции "Достижения"
    const achievementsSection = document.querySelectorAll('.section')[2]; // Достижения - это третий section
    if (achievementsSection) {
      const competitionsList = achievementsSection.querySelector('#accordion1 .list');
      if (competitionsList && siteData.achievements.competitions && Array.isArray(siteData.achievements.competitions)) {
        competitionsList.innerHTML = siteData.achievements.competitions
          .map(item => `<div class="list-item">${escapeHtml(item)}</div>`)
          .join('');
      }
      
      // Опыт
      const experienceList = achievementsSection.querySelector('#accordion2 .list');
      if (experienceList && siteData.achievements.experience && Array.isArray(siteData.achievements.experience)) {
        experienceList.innerHTML = siteData.achievements.experience
          .map(item => `<div class="list-item">${escapeHtml(item)}</div>`)
          .join('');
      }
    }
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Слушаем изменения в localStorage (для обновления при изменении в админ-панели)
window.addEventListener('storage', function(e) {
  if (e.key === 'siteData' && e.newValue) {
    siteData = JSON.parse(e.newValue);
    applyDataToPage();
  }
});

// Также слушаем события в той же вкладке
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  originalSetItem.apply(this, arguments);
  if (key === 'siteData') {
    window.dispatchEvent(new Event('localStorageChange'));
  }
};

window.addEventListener('localStorageChange', function() {
  const localData = localStorage.getItem('siteData');
  if (localData) {
    siteData = JSON.parse(localData);
    applyDataToPage();
  }
});

// Загружаем данные при загрузке страницы
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAndApplyData);
} else {
  loadAndApplyData();
}
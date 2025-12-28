// Загрузка данных кейса
let siteData = null;
let currentCase = null;

async function loadCaseData() {
  try {
    // Получаем ID кейса из URL
    const urlParams = new URLSearchParams(window.location.search);
    const caseId = urlParams.get('id');

    if (!caseId) {
      window.location.href = 'index.html';
      return;
    }

    // Загружаем данные: сначала из localStorage (админка), потом из файла
    const localData = localStorage.getItem('siteData');
    if (localData) {
      siteData = JSON.parse(localData);
    } else {
      const response = await fetch('data.json');
      siteData = await response.json();
    }

    // Находим нужный кейс
    currentCase = siteData.cases.find(c => c.id === caseId);

    if (!currentCase) {
      window.location.href = 'index.html';
      return;
    }

    // Применяем данные к странице
    applyCaseData();
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    window.location.href = 'index.html';
  }
}

function applyCaseData() {
  if (!currentCase || !siteData) return;

  // Обновляем title страницы
  document.title = `${currentCase.title} — ${siteData.profile.name}`;

  // Имя в навигации
  const navName = document.getElementById('nav-name');
  if (navName) navName.textContent = siteData.profile.name;

  // Telegram ссылки
  const telegramLink = siteData.profile.telegram || 'https://t.me/Danielium';
  const footerLink = document.getElementById('footer-link');
  if (footerLink) footerLink.href = telegramLink;

  // Hero секция
  const heroLabel = document.getElementById('case-hero-label');
  if (heroLabel && currentCase.heroLabel) {
    heroLabel.textContent = currentCase.heroLabel;
  }

  const heroTitle = document.getElementById('case-hero-title');
  if (heroTitle) heroTitle.textContent = currentCase.title;

  const heroSubtitle = document.getElementById('case-hero-subtitle');
  if (heroSubtitle && currentCase.heroSubtitle) {
    heroSubtitle.textContent = currentCase.heroSubtitle;
  }

  // Кнопка презентации
  if (currentCase.presentation && currentCase.presentation.url) {
    const presentationSection = document.getElementById('case-presentation-section');
    const btnPresentation = document.getElementById('btn-presentation');

    if (presentationSection && btnPresentation) {
      presentationSection.style.display = 'block';
      btnPresentation.href = currentCase.presentation.url;
      btnPresentation.textContent = currentCase.presentation.buttonText || 'Скачать презентацию';
    }
  }

  // Главное изображение
  const mainImg = document.getElementById('case-main-image');
  if (mainImg && currentCase.mainImage) {
    mainImg.src = currentCase.mainImage;
    mainImg.alt = currentCase.title;
  }

  // Контент - ТОЛЬКО 3 блока
  const contentContainer = document.getElementById('case-content');
  if (contentContainer && currentCase.content) {
    let html = '';

    // Проблема
    if (currentCase.content.problem) {
      html += `
        <div class="case-block">
          <h2 class="case-block-title">Проблема</h2>
          <p class="case-block-text">${formatText(currentCase.content.problem)}</p>
        </div>
      `;
    }

    // Решение
    if (currentCase.content.solution || currentCase.content.goal) {
      html += `
        <div class="case-block">
          <h2 class="case-block-title">Решение</h2>
          <p class="case-block-text">${formatText(currentCase.content.solution || currentCase.content.goal)}</p>
        </div>
      `;
    }

    // Роль
    if (currentCase.content.role) {
      html += `
        <div class="case-block">
          <h2 class="case-block-title">Моя роль</h2>
          <p class="case-block-text">${formatText(currentCase.content.role)}</p>
        </div>
      `;
    }

    contentContainer.innerHTML = html;
  }

  // Следующий проект
  if (currentCase.content && currentCase.content.nextProject) {
    const nextSection = document.getElementById('case-next-section');
    const nextLabel = document.getElementById('next-label');
    const nextLink = document.getElementById('next-link');
    const nextTitle = document.getElementById('next-title');

    if (nextSection && nextLabel && nextLink && nextTitle) {
      nextSection.style.display = 'block';
      nextLabel.textContent = currentCase.content.nextProject.label || 'Следующий проект';
      nextLink.href = currentCase.content.nextProject.link || '#';
      nextTitle.textContent = currentCase.content.nextProject.title || '';
    }
  }
}

// Форматирование текста (замена \n на <br>)
function formatText(text) {
  if (!text) return '';
  return escapeHtml(text).replace(/\n/g, '<br>');
}

// Экранирование HTML
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', loadCaseData);

// Обновление при изменении localStorage (если админка открыта в другой вкладке)
window.addEventListener('storage', (e) => {
  if (e.key === 'siteData') {
    loadCaseData();
  }
});
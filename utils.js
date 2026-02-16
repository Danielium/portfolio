// Общие утилиты для портфолио

/**
 * Экранирование HTML для предотвращения XSS
 * @param {string} text - Текст для экранирования
 * @returns {string} - Экранированный текст
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Обработчик ошибок загрузки изображений
 * @param {HTMLImageElement} img - Элемент изображения
 * @param {string} fallbackSrc - URL запасного изображения
 */
function handleImageError(img, fallbackSrc = '') {
  img.onerror = null; // Предотвращаем бесконечный цикл
  if (fallbackSrc) {
    img.src = fallbackSrc;
  } else {
    // Показываем placeholder с инициалами или иконкой
    img.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)';
    img.style.objectFit = 'contain';
    img.alt = 'Изображение недоступно';
  }
}

/**
 * Применить обработчик ошибок ко всем изображениям
 */
function setupImageErrorHandlers() {
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => handleImageError(img));
  });
}

/**
 * Показать skeleton loader
 * @param {string} selector - CSS селектор элемента
 */
function showSkeleton(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => el.classList.add('skeleton'));
}

/**
 * Скрыть skeleton loader
 * @param {string} selector - CSS селектор элемента
 */
function hideSkeleton(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => el.classList.remove('skeleton'));
}

/**
 * Форматирование текста (замена \n на <br>)
 * @param {string} text - Текст для форматирования
 * @returns {string} - Форматированный HTML
 */
function formatText(text) {
  if (!text) return '';
  return escapeHtml(text).replace(/\n/g, '<br>');
}

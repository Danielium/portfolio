// Проверка авторизации
if (window.location.pathname.includes('admin-panel.html')) {
    if (localStorage.getItem('adminAuth') !== 'true') {
        window.location.href = 'admin.html';
    }
}

// Глобальная переменная для данных
let siteData = null;

// ============ РАБОТА С ДАННЫМИ ============

// Загрузка данных с приоритетом localStorage
async function loadData() {
    try {
        // Сначала проверяем localStorage
        const cachedData = localStorage.getItem('siteData');
        if (cachedData) {
            siteData = JSON.parse(cachedData);
            console.log('Данные загружены из localStorage');
            initializeDefaults();
            return siteData;
        }

        // Если нет в localStorage, загружаем из data.json
        const response = await fetch('data.json');
        siteData = await response.json();
        console.log('Данные загружены из data.json');

        // Сохраняем в localStorage для следующих загрузок
        localStorage.setItem('siteData', JSON.stringify(siteData));
        initializeDefaults();

        return siteData;
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        alert('Ошибка загрузки данных. Проверьте наличие файла data.json');
        return null;
    }
}

// Инициализация значений по умолчанию
function initializeDefaults() {
    if (!siteData) return;

    // Инициализируем achievements если их нет
    if (!siteData.achievements) {
        siteData.achievements = {
            competitions: [],
            experience: []
        };
    }

    // Проверяем наличие массивов
    if (!Array.isArray(siteData.achievements.competitions)) {
        siteData.achievements.competitions = [];
    }
    if (!Array.isArray(siteData.achievements.experience)) {
        siteData.achievements.experience = [];
    }

    // Инициализируем profile если его нет
    if (!siteData.profile) {
        siteData.profile = {
            name: '',
            tag: '',
            avatar: '',
            description: '',
            about: '',
            telegram: '',
            skills: ''
        };
    }

    // Инициализируем cases если их нет
    if (!Array.isArray(siteData.cases)) {
        siteData.cases = [];
    }
}

// Сохранение данных
async function saveData() {
    try {
        localStorage.setItem('siteData', JSON.stringify(siteData));
        console.log('Данные сохранены в localStorage');

        showMessage('Данные сохранены! Изменения применятся на сайте автоматически.', 'success');

        // Обновляем другие открытые вкладки
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'siteData',
            newValue: JSON.stringify(siteData)
        }));

        // Обновляем родительскую страницу если открыта из другой вкладки
        if (window.opener && !window.opener.closed) {
            try {
                window.opener.location.reload();
            } catch (e) {
                console.log('Не удалось обновить родительскую страницу');
            }
        }
    } catch (error) {
        console.error('Ошибка сохранения данных:', error);
        showMessage('Ошибка сохранения данных', 'error');
    }
}

// ============ UI ФУНКЦИИ ============

// Показать сообщение
function showMessage(text, type = 'success') {
    // Удаляем предыдущие сообщения
    const existingMessages = document.querySelectorAll('.success-message');
    existingMessages.forEach(msg => msg.remove());

    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = text;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        padding: 16px 20px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;

    if (type === 'error') {
        messageDiv.style.background = 'rgba(255,68,68,0.1)';
        messageDiv.style.border = '1px solid rgba(255,68,68,0.3)';
        messageDiv.style.color = '#ff4444';
    } else {
        messageDiv.style.background = 'rgba(68,255,68,0.1)';
        messageDiv.style.border = '1px solid rgba(68,255,68,0.3)';
        messageDiv.style.color = '#44ff44';
    }

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 4000);
}

// Выход
function logout() {
    if (confirm('Выйти из админ-панели?')) {
        localStorage.removeItem('adminAuth');
        window.location.href = 'admin.html';
    }
}

// ============ ПРОФИЛЬ ============

// Загрузка профиля в форму
function loadProfile() {
    if (!siteData || !siteData.profile) return;

    const fields = ['name', 'tag', 'avatar', 'description', 'about', 'telegram', 'skills'];
    fields.forEach(field => {
        const element = document.getElementById(`profile-${field}`);
        if (element) {
            element.value = siteData.profile[field] || '';
        }
    });

    console.log('Профиль загружен');
}

// Сохранение профиля
function saveProfile() {
    if (!siteData) return;

    const fields = ['name', 'tag', 'avatar', 'description', 'about', 'telegram', 'skills'];
    fields.forEach(field => {
        const element = document.getElementById(`profile-${field}`);
        if (element) {
            siteData.profile[field] = element.value;
        }
    });

    saveData();
    showMessage('Профиль сохранён!', 'success');
}

// ============ КЕЙСЫ ============

// Загрузка кейсов
function loadCases() {
    if (!siteData) return;

    const casesList = document.getElementById('cases-list');
    if (!casesList) return;

    // Полная очистка контейнера
    casesList.innerHTML = '';

    // Сортируем кейсы по порядку
    const sortedCases = [...siteData.cases].sort((a, b) => (a.order || 0) - (b.order || 0));

    // Создаём элементы кейсов
    sortedCases.forEach((caseItem) => {
        const caseDiv = document.createElement('div');
        caseDiv.className = 'case-item';
        caseDiv.id = `case-${caseItem.id}`;
        caseDiv.setAttribute('data-case-id', caseItem.id);

        caseDiv.innerHTML = `
            <div class="case-item-header">
                <h3 class="case-item-title">${caseItem.title || 'Без названия'}</h3>
                <div class="case-item-actions">
                    <button onclick="editCase('${caseItem.id}')" class="btn-edit">Редактировать</button>
                    <button onclick="deleteCase('${caseItem.id}')" class="btn-delete">Удалить</button>
                </div>
            </div>
            <div style="font-size: 12px; opacity: 0.5; margin-top: 8px;">
                <span>${caseItem.label || ''}</span> · <span>${caseItem.description || ''}</span>
            </div>
        `;

        casesList.appendChild(caseDiv);
    });

    // Добавляем кнопку добавления нового кейса ОДИН РАЗ
    const addButton = document.createElement('button');
    addButton.className = 'btn-add';
    addButton.textContent = '+ Добавить кейс';
    addButton.style.marginTop = '16px';
    addButton.onclick = addNewCase;
    casesList.appendChild(addButton);

    console.log(`Загружено кейсов: ${sortedCases.length}`);
}

// Добавить новый кейс
function addNewCase() {
    const newId = `case-${Date.now()}`;
    const newOrder = siteData.cases.length > 0
        ? Math.max(...siteData.cases.map(c => c.order || 0)) + 1
        : 1;

    const newCase = {
        id: newId,
        title: 'Новый кейс',
        label: 'Проект',
        description: 'Описание проекта',
        image: '',
        link: `case.html?id=${newId}`,
        order: newOrder,
        heroLabel: 'Проект',
        heroSubtitle: 'Подзаголовок',
        mainImage: '',
        presentation: {
            url: '',
            buttonText: 'Скачать презентацию'
        },
        content: {
            problem: '',
            solution: '',
            role: '',
            nextProject: {
                label: 'Вернуться',
                title: 'Все проекты',
                link: 'index.html#cases'
            }
        }
    };

    siteData.cases.push(newCase);
    saveData();
    loadCases();

    // Автоматически открываем редактирование нового кейса
    setTimeout(() => editCase(newId), 100);

    showMessage('Новый кейс создан!', 'success');
}

// Редактировать кейс
function editCase(caseId) {
    const caseItem = siteData.cases.find(c => c.id === caseId);
    if (!caseItem) {
        showMessage('Кейс не найден', 'error');
        return;
    }

    const caseDiv = document.getElementById(`case-${caseId}`);
    if (!caseDiv) {
        showMessage('Элемент не найден в DOM', 'error');
        return;
    }

    // Инициализируем вложенные объекты если их нет
    if (!caseItem.presentation) {
        caseItem.presentation = { url: '', buttonText: 'Скачать презентацию' };
    }
    if (!caseItem.content) {
        caseItem.content = { problem: '', solution: '', role: '', nextProject: {} };
    }
    if (!caseItem.content.nextProject) {
        caseItem.content.nextProject = { label: 'Вернуться', title: 'Все проекты', link: 'index.html#cases' };
    }

    // Заменяем содержимое на форму редактирования
    caseDiv.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 24px; padding: 20px; background: rgba(255,255,255,0.02); border-radius: 12px;">
            <h3 style="font-size: 20px; font-weight: 500;">Редактирование: ${caseItem.title}</h3>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                <div class="form-group">
                    <label>ID кейса</label>
                    <input type="text" class="form-input" id="edit-id-${caseId}" value="${caseItem.id}">
                </div>

                <div class="form-group">
                    <label>Название</label>
                    <input type="text" class="form-input" id="edit-title-${caseId}" value="${caseItem.title}">
                </div>

                <div class="form-group">
                    <label>Тип проекта</label>
                    <input type="text" class="form-input" id="edit-label-${caseId}" value="${caseItem.label}">
                </div>

                <div class="form-group">
                    <label>Порядок</label>
                    <input type="number" class="form-input" id="edit-order-${caseId}" value="${caseItem.order}">
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label>Краткое описание</label>
                    <textarea class="form-textarea" id="edit-description-${caseId}">${caseItem.description}</textarea>
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label>Изображение карточки (URL)</label>
                    <input type="text" class="form-input" id="edit-image-${caseId}" value="${caseItem.image}">
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label>Главное изображение (URL)</label>
                    <input type="text" class="form-input" id="edit-mainImage-${caseId}" value="${caseItem.mainImage || ''}">
                </div>

                <div class="form-group">
                    <label>Hero лейбл</label>
                    <input type="text" class="form-input" id="edit-heroLabel-${caseId}" value="${caseItem.heroLabel || ''}">
                </div>

                <div class="form-group">
                    <label>Hero подзаголовок</label>
                    <input type="text" class="form-input" id="edit-heroSubtitle-${caseId}" value="${caseItem.heroSubtitle || ''}">
                </div>

                <div class="form-group" style="grid-column: 1 / -1; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; margin-top: 8px;">
                    <h4 style="font-size: 16px; margin-bottom: 16px; opacity: 0.8;">Презентация</h4>
                </div>

                <div class="form-group">
                    <label>Ссылка на презентацию</label>
                    <input type="text" class="form-input" id="edit-presentationUrl-${caseId}" value="${caseItem.presentation.url || ''}" placeholder="https://drive.google.com/...">
                    <small style="opacity: 0.5; font-size: 12px; display: block; margin-top: 4px;">
                        Оставьте пустым, если презентации нет
                    </small>
                </div>

                <div class="form-group">
                    <label>Текст кнопки</label>
                    <input type="text" class="form-input" id="edit-presentationButtonText-${caseId}" value="${caseItem.presentation.buttonText || 'Скачать презентацию'}">
                </div>

                <div class="form-group" style="grid-column: 1 / -1; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; margin-top: 8px;">
                    <h4 style="font-size: 16px; margin-bottom: 16px; opacity: 0.8;">Контент</h4>
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label>Проблема</label>
                    <textarea class="form-textarea" id="edit-contentProblem-${caseId}">${caseItem.content.problem || ''}</textarea>
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label>Решение</label>
                    <textarea class="form-textarea" id="edit-contentSolution-${caseId}">${caseItem.content.solution || caseItem.content.goal || ''}</textarea>
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label>Моя роль</label>
                    <textarea class="form-textarea" id="edit-contentRole-${caseId}">${caseItem.content.role || ''}</textarea>
                </div>

                <div class="form-group" style="grid-column: 1 / -1; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; margin-top: 8px;">
                    <h4 style="font-size: 16px; margin-bottom: 16px; opacity: 0.8;">Следующий проект</h4>
                </div>

                <div class="form-group">
                    <label>Лейбл</label>
                    <input type="text" class="form-input" id="edit-nextLabel-${caseId}" value="${caseItem.content.nextProject?.label || 'Следующий проект'}">
                </div>

                <div class="form-group">
                    <label>Название</label>
                    <input type="text" class="form-input" id="edit-nextTitle-${caseId}" value="${caseItem.content.nextProject?.title || ''}">
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label>Ссылка</label>
                    <input type="text" class="form-input" id="edit-nextLink-${caseId}" value="${caseItem.content.nextProject?.link || ''}">
                </div>
            </div>

            <div style="display: flex; gap: 12px; margin-top: 16px;">
                <button onclick="saveCaseEdit('${caseId}')" class="btn-save">Сохранить</button>
                <button onclick="cancelCaseEdit()" class="btn-add">Отмена</button>
            </div>
        </div>
    `;

    console.log(`Редактирование кейса: ${caseId}`);
}

// Сохранить редактирование кейса
function saveCaseEdit(caseId) {
    const caseItem = siteData.cases.find(c => c.id === caseId);
    if (!caseItem) {
        showMessage('Кейс не найден', 'error');
        return;
    }

    // Получаем значения из полей
    const getValue = (fieldId) => {
        const element = document.getElementById(fieldId);
        return element ? element.value : '';
    };

    // Основные поля
    const newId = getValue(`edit-id-${caseId}`);
    caseItem.title = getValue(`edit-title-${caseId}`);
    caseItem.label = getValue(`edit-label-${caseId}`);
    caseItem.order = parseInt(getValue(`edit-order-${caseId}`)) || 0;
    caseItem.description = getValue(`edit-description-${caseId}`);
    caseItem.image = getValue(`edit-image-${caseId}`);
    caseItem.mainImage = getValue(`edit-mainImage-${caseId}`);
    caseItem.heroLabel = getValue(`edit-heroLabel-${caseId}`);
    caseItem.heroSubtitle = getValue(`edit-heroSubtitle-${caseId}`);

    // Презентация
    caseItem.presentation.url = getValue(`edit-presentationUrl-${caseId}`);
    caseItem.presentation.buttonText = getValue(`edit-presentationButtonText-${caseId}`);

    // Контент
    caseItem.content.problem = getValue(`edit-contentProblem-${caseId}`);
    caseItem.content.solution = getValue(`edit-contentSolution-${caseId}`);
    caseItem.content.role = getValue(`edit-contentRole-${caseId}`);

    // Следующий проект
    caseItem.content.nextProject.label = getValue(`edit-nextLabel-${caseId}`);
    caseItem.content.nextProject.title = getValue(`edit-nextTitle-${caseId}`);
    caseItem.content.nextProject.link = getValue(`edit-nextLink-${caseId}`);

    // Если ID изменился, обновляем link
    if (newId !== caseId) {
        caseItem.id = newId;
        caseItem.link = `case.html?id=${newId}`;
    }

    saveData();
    loadCases();
    showMessage('Кейс сохранён!', 'success');
}

// Отменить редактирование
function cancelCaseEdit() {
    loadCases();
}

// Удалить кейс
function deleteCase(caseId) {
    const caseItem = siteData.cases.find(c => c.id === caseId);
    if (!caseItem) {
        showMessage('Кейс не найден', 'error');
        return;
    }

    if (!confirm(`Удалить кейс "${caseItem.title}"?`)) return;

    siteData.cases = siteData.cases.filter(c => c.id !== caseId);
    saveData();
    loadCases();
    showMessage('Кейс удалён', 'success');
}

// ============ ДОСТИЖЕНИЯ ============

// Загрузка достижений
function loadAchievements() {
    if (!siteData || !siteData.achievements) {
        console.warn('Достижения не найдены в данных');
        return;
    }

    console.log('Загрузка достижений:', siteData.achievements);

    // Загрузка конкурсов
    loadAchievementsList('competitions', 'competitions-list');

    // Загрузка опыта
    loadAchievementsList('experience', 'experience-list');
}

// Загрузка списка достижений определённого типа
function loadAchievementsList(type, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Контейнер ${containerId} не найден`);
        return;
    }

    // Очищаем контейнер
    container.innerHTML = '';

    const items = siteData.achievements[type] || [];

    // Создаём элементы для каждого достижения
    items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.style.cssText = 'display: flex; gap: 8px; margin-bottom: 12px;';
        itemDiv.innerHTML = `
            <input type="text"
                   class="form-input"
                   style="flex: 1;"
                   value="${item}"
                   data-type="${type}"
                   data-index="${index}"
                   onchange="updateAchievementValue(this)">
            <button onclick="deleteAchievement('${type}', ${index})"
                    class="btn-delete"
                    style="padding: 8px 16px; min-width: 40px;">×</button>
        `;
        container.appendChild(itemDiv);
    });

    // Добавляем кнопку добавления
    const addBtn = document.createElement('button');
    addBtn.textContent = '+ Добавить';
    addBtn.className = 'btn-add';
    addBtn.style.marginTop = '8px';
    addBtn.onclick = () => addAchievement(type);
    container.appendChild(addBtn);

    console.log(`Загружено достижений (${type}): ${items.length}`);
}

// Обновить значение достижения
function updateAchievementValue(input) {
    const type = input.getAttribute('data-type');
    const index = parseInt(input.getAttribute('data-index'));
    const value = input.value;

    if (siteData && siteData.achievements && siteData.achievements[type]) {
        siteData.achievements[type][index] = value;
        console.log(`Обновлено достижение ${type}[${index}]: ${value}`);
    }
}

// Добавить достижение
function addAchievement(type) {
    if (!siteData || !siteData.achievements || !siteData.achievements[type]) {
        showMessage('Ошибка: раздел достижений не найден', 'error');
        return;
    }

    siteData.achievements[type].push('Новое достижение');
    saveData();
    loadAchievements();
    showMessage('Достижение добавлено', 'success');
}

// Удалить достижение
function deleteAchievement(type, index) {
    if (!siteData || !siteData.achievements || !siteData.achievements[type]) {
        showMessage('Ошибка: раздел достижений не найден', 'error');
        return;
    }

    if (!confirm('Удалить это достижение?')) return;

    siteData.achievements[type].splice(index, 1);
    saveData();
    loadAchievements();
    showMessage('Достижение удалено', 'success');
}

// Сохранить достижения
function saveAchievements() {
    saveData();
    showMessage('Достижения сохранены!', 'success');
}

// ============ УТИЛИТЫ ============

// Скачать резервную копию
function downloadBackup() {
    if (!siteData) {
        showMessage('Нет данных для сохранения', 'error');
        return;
    }

    const dataStr = JSON.stringify(siteData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `backup-${date}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showMessage('Резервная копия скачана', 'success');
}

// Загрузить резервную копию
function uploadBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                siteData = data;
                saveData();
                loadProfile();
                loadCases();
                loadAchievements();
                showMessage('Резервная копия загружена и применена', 'success');
            } catch (error) {
                console.error('Ошибка парсинга JSON:', error);
                showMessage('Ошибка: неверный формат файла', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ============ ИНИЦИАЛИЗАЦИЯ ============

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Инициализация админ-панели...');

    await loadData();

    if (siteData) {
        loadProfile();
        loadCases();
        loadAchievements();
        console.log('Админ-панель готова');
    } else {
        showMessage('Не удалось загрузить данные', 'error');
    }
});

// Слушаем изменения из других вкладок
window.addEventListener('storage', (e) => {
    if (e.key === 'siteData' && e.newValue) {
        try {
            siteData = JSON.parse(e.newValue);
            loadProfile();
            loadCases();
            loadAchievements();
            console.log('Данные обновлены из другой вкладки');
        } catch (error) {
            console.error('Ошибка при обновлении из storage:', error);
        }
    }
});

// Предупреждение о несохранённых изменениях
let hasUnsavedChanges = false;

window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});
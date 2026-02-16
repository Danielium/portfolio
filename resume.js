document.addEventListener('DOMContentLoaded', () => {
    // Проверка наличия данных
    if (typeof siteData === 'undefined') {
        console.error('Data not loaded');
        return;
    }

    renderHeader();
    renderSummary();
    renderExperience();
    renderEducation();
    renderProjects();
    renderSkills();
    renderAchievements();
});

function renderHeader() {
    document.getElementById('name').textContent = siteData.profile.name;
    document.getElementById('role').textContent = siteData.profile.tag;

    const avatar = document.getElementById('avatar');
    if (siteData.profile.avatar) {
        avatar.src = siteData.profile.avatar;
    } else {
        avatar.style.display = 'none';
    }

    // Контакты
    const contactsContainer = document.getElementById('contacts');
    if (siteData.profile.telegram) {
        const div = document.createElement('div');
        div.className = 'contact-item';
        div.innerHTML = `Telegram: <a href="${siteData.profile.telegram}">${siteData.profile.telegram.replace('https://t.me/', '@')}</a>`;
        contactsContainer.appendChild(div);
    }
}

function renderSummary() {
    document.getElementById('profile-summary').textContent = siteData.profile.about;
}

function renderExperience() {
    // Пытаемся извлечь опыт из списка достижений или создаем вручную на основе кейсов
    const container = document.getElementById('experience-list');

    // В данном случае, извлекаем информацию о стажировке в MOEX из кейса FinClub и achievements
    const moexExperience = siteData.achievements.experience.find(e => e.includes('MOEX'));

    if (moexExperience) {
        // Найдем детали в кейсе FinClub
        const finClubCase = siteData.cases.find(c => c.id === 'finclub');
        const role = finClubCase ? finClubCase.content.role : 'Стажер';

        const div = document.createElement('div');
        div.className = 'experience-item';
        div.innerHTML = `
            <div class="item-header">
                <span class="item-title">Московская Биржа (MOEX)</span>
                <span class="item-date">Июль - Сентябрь 2025</span>
            </div>
            <div class="item-subtitle">${role}</div>
            <div class="item-desc">
                Разработка концепции сервиса совместного инвестирования "ФинКлуб". 
                ${finClubCase ? `<br>Ключевые обязанности: ${finClubCase.content.whatWeDid.slice(0, 3).join(', ')}.` : ''}
            </div>
        `;
        container.appendChild(div);
    }
}

function renderEducation() {
    const container = document.getElementById('education-list');

    siteData.achievements.experience.forEach(item => {
        // Фильтруем только то, что похоже на образование
        if (item.includes('Учеба') || item.includes('курс') || item.includes('Выпускник')) {
            let title = '';
            let date = '';

            if (item.includes('Центральном университете')) {
                title = 'Центральный университет (Бизнес + IT)';
                date = '2025 – 2029';
            } else if (item.includes('Иннополис')) {
                title = 'Университет Иннополис';
                date = 'Курс по ИИ';
            } else if (item.includes('т-образования')) {
                title = 'Т-Образование';
                date = 'Анализ данных';
            } else {
                title = item;
            }

            if (title) {
                const div = document.createElement('div');
                div.className = 'education-item';
                div.innerHTML = `
                    <div class="item-header">
                        <span class="item-title">${title}</span>
                        ${date ? `<span class="item-date">${date}</span>` : ''}
                    </div>
                    ${item !== title ? `<div class="item-desc">${item}</div>` : ''}
                `;
                container.appendChild(div);
            }
        }
    });
}

function renderProjects() {
    const container = document.getElementById('projects-list');

    siteData.cases.forEach(project => {
        const div = document.createElement('div');
        div.className = 'project-item';
        div.innerHTML = `
            <div class="item-header">
                <span class="item-title">${project.title}</span>
                <span class="item-date">${project.label}</span>
            </div>
            <div class="item-desc">
                <strong>Задача:</strong> ${project.description}<br>
                ${project.content && project.content.results ? `<strong>Результат:</strong> ${project.content.results.map(r => r.desc).join(', ')}.` : ''}
            </div>
        `;
        container.appendChild(div);
    });
}

function renderSkills() {
    const container = document.getElementById('skills-list');
    if (siteData.profile.skills) {
        siteData.profile.skills.split(',').forEach(skill => {
            const span = document.createElement('span');
            span.className = 'skill-tag';
            span.textContent = skill.trim();
            container.appendChild(span);
        });
    }
}

function renderAchievements() {
    const container = document.getElementById('achievements-list');
    const ul = document.createElement('ul');
    ul.className = 'bullet-list';

    siteData.achievements.competitions.forEach(comp => {
        const li = document.createElement('li');
        li.textContent = comp;
        ul.appendChild(li);
    });
    container.appendChild(ul);
}

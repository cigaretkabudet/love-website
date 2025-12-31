// ========== КОНФИГУРАЦИЯ ==========
const RELATIONSHIP_START_DATE = new Date('2025-01-01T00:00:00');
const VALID_CODEWORDS = ["Баскетбол", "WB", "Глупый", "delta", "echo"];
let attempts = 5;
let usedCodewords = [];
let isMenuOpen = false;
let currentProfileEditing = null;
let currentMemoryEditing = null;
let memoryPhotos = [];

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализация...');
    initApp();
    initMenu();
    updateDaysHint();
});

function initApp() {
    const passed = localStorage.getItem('passedIntro');
    const lastVisit = localStorage.getItem('lastVisit');
    const now = Date.now();
    const expiration = 3600000; // 1 час

    if (!lastVisit || now - lastVisit > expiration) {
        localStorage.removeItem('passedIntro');
    }

    localStorage.setItem('lastVisit', now);

    if (localStorage.getItem('passedIntro') === 'true') {
        showMainPage();
    } else {
        showTestPage();
    }
}

function updateDaysHint() {
    const days = getDaysTogether();
    console.log('Дней вместе:', days);
    const daysElement = document.getElementById('currentDays');
    if (daysElement) {
        daysElement.textContent = days;
    }
}

function getDaysTogether() {
    const now = new Date();
    const diff = now - RELATIONSHIP_START_DATE;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getRelationshipTime() {
    const now = new Date();
    const diff = now - RELATIONSHIP_START_DATE;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    
    return { days, hours, minutes, seconds };
}

// ========== ТЕСТ ==========
function showTestPage() {
    console.log('Показываем тестовую страницу');
    
    document.getElementById('quiz').style.display = 'block';
    document.getElementById('retry').style.display = 'none';
    document.getElementById('heart-block').style.display = 'none';
    document.getElementById('main-block').style.display = 'none';
    
    document.body.className = 'test-bg';
    
    document.getElementById('answer1').value = '';
    document.getElementById('answer2').value = '';
    document.getElementById('answer3').value = '';
    
    updateDaysHint();
}

function checkAnswers() {
    console.log('checkAnswers вызвана!');
    
    const a1 = document.getElementById("answer1").value.trim();
    const a2 = document.getElementById("answer2").value.trim();
    const a3 = document.getElementById("answer3").value.trim();
    const currentDays = getDaysTogether().toString();
    
    console.log('Ответы:', a1, a2, a3);

    let correctCount = 0;
    
    // Проверяем первый вопрос (дата начала отношений)
    if (a1 === '01.01.2025' || 
        a1 === '01/01/2025' ||
        a1 === '1.1.2025' ||
        a1 === '1/1/2025' ||
        a1 === '01012025') {
        correctCount++;
        console.log('✅ Вопрос 1 верный');
    } else {
        console.log('❌ Вопрос 1 неверный:', a1);
    }
    
    // Проверяем второй вопрос (дата похода в лофт)
    if (a2 === '16.02.2025' || 
        a2 === '16/02/2025' ||
        a2 === '16.2.2025' ||
        a2 === '16/2/2025' ||
        a2 === '16022025') {
        correctCount++;
        console.log('✅ Вопрос 2 верный');
    } else {
        console.log('❌ Вопрос 2 неверный:', a2);
    }
    
    // Проверяем третий вопрос (дни вместе)
    if (a3 === currentDays) {
        correctCount++;
        console.log('✅ Вопрос 3 верный');
    } else {
        console.log('❌ Вопрос 3 неверный:', a3, 'ожидалось:', currentDays);
    }

    if (correctCount === 3) {
        console.log('🎉 Все ответы верные!');
        handleSuccess();
    } else if (correctCount >= 1) {
        console.log('🤔 Частично верно:', correctCount, 'из 3');
        handlePartialSuccess(correctCount);
    } else {
        console.log('😢 Все ответы неверные');
        handleFailure();
    }
}

function handleSuccess() {
    localStorage.setItem('passedIntro', 'true');
    showSuccessAnimation();
    
    setTimeout(() => {
        document.getElementById("quiz").style.display = "none";
        document.getElementById("heart-block").style.display = "block";
        document.body.className = 'heart-bg';
        createHearts(20);
    }, 1500);
}

function handlePartialSuccess(correctCount) {
    const messages = [
        "Неплохо! Но можно лучше 😊",
        "Уже близко! Еще чуть-чуть 💪",
        "Почти получилось! Попробуй еще раз 💖"
    ];
    
    const message = correctCount - 1 < messages.length ? messages[correctCount - 1] : "Попробуй еще раз! 💖";
    alert(message);
    
    attempts--;
    document.getElementById("attemptsLeft").textContent = attempts;
    
    if (attempts <= 0) {
        showGameOver();
    } else {
        document.getElementById("quiz").style.display = "none";
        document.getElementById("retry").style.display = "block";
    }
}

function handleFailure() {
    attempts--;
    document.getElementById("attemptsLeft").textContent = attempts;
    
    if (attempts > 0) {
        document.getElementById("quiz").style.display = "none";
        document.getElementById("retry").style.display = "block";
        showFailureAnimation();
    } else {
        showGameOver();
    }
}

function showSuccessAnimation() {
    const quiz = document.getElementById('quiz');
    quiz.style.animation = 'pulse 0.5s 3';
    
    const buttons = document.querySelectorAll('.btn-primary');
    buttons.forEach(btn => {
        btn.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
        btn.innerHTML = '<i class="fas fa-check-circle"></i> Верно!';
    });
    
    createHearts(10);
}

function showFailureAnimation() {
    const retry = document.getElementById('retry');
    retry.style.animation = 'shake 0.5s';
    
    setTimeout(() => {
        retry.style.animation = '';
    }, 500);
}

function showGameOver() {
    alert("Использованы все попытки. Обнови страницу, чтобы начать заново.");
    document.body.innerHTML = `
        <div class="card" style="text-align: center; padding: 50px; max-width: 500px; margin: 100px auto;">
            <h2 style="color: var(--danger);"><i class="fas fa-heart-broken"></i> Игра окончена</h2>
            <p>Попытки закончились. Обнови страницу (F5) для новой попытки.</p>
            <button onclick="location.reload()" class="btn-primary" style="margin-top: 20px;">
                <i class="fas fa-redo"></i> Начать заново
            </button>
        </div>
    `;
}

function tryAgain() {
    const codeInput = document.getElementById("codeword");
    const code = codeInput.value.trim().toLowerCase();
    
    if (VALID_CODEWORDS.includes(code) && !usedCodewords.includes(code)) {
        usedCodewords.push(code);
        codeInput.value = "";
        document.getElementById("retry").style.display = "none";
        document.getElementById("quiz").style.display = "block";
        
        document.getElementById("answer1").value = "";
        document.getElementById("answer2").value = "";
        document.getElementById("answer3").value = "";
        
        createHearts(5);
    } else if (usedCodewords.includes(code)) {
        alert("Это кодовое слово уже использовано. Введите другое.");
        codeInput.style.borderColor = 'var(--warning)';
        codeInput.style.animation = 'shake 0.5s';
        setTimeout(() => codeInput.style.animation = '', 500);
    } else {
        alert("Неверное кодовое слово.");
        codeInput.style.borderColor = 'var(--danger)';
    }
}

// ========== ГЛАВНАЯ СТРАНИЦА ==========
function showMainPage() {
    console.log('Показываем главную страницу');
    
    document.getElementById('quiz').style.display = 'none';
    document.getElementById('retry').style.display = 'none';
    document.getElementById('heart-block').style.display = 'none';
    document.getElementById('main-block').style.display = 'block';
    document.body.className = 'main-bg';
    
    startCounter();
    createHearts(15);
    loadUserData();
}

function goToMain() {
    document.getElementById('heart-block').style.display = 'none';
    showMainPage();
    
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s';
        document.body.style.opacity = '1';
    }, 10);
}

// ========== СЧЕТЧИК ОТНОШЕНИЙ ==========
function startCounter() {
    updateCounter();
    setInterval(updateCounter, 1000);
}

function updateCounter() {
    const time = getRelationshipTime();
    const counter = document.getElementById('counter-time');
    
    if (counter) {
        counter.textContent = 
            `${time.days} дн. ${time.hours} ч. ${time.minutes} мин. ${time.seconds} сек.`;
    }
}

function toggleCounter() {
    const counter = document.getElementById('relationship-counter');
    const isVisible = counter.style.display !== 'none';
    
    counter.style.display = isVisible ? 'none' : 'flex';
    counter.style.animation = isVisible ? 'fadeOut 0.3s' : 'fadeIn 0.3s';
    
    localStorage.setItem('counterVisible', !isVisible);
}

// ========== МЕНЮ ==========
function initMenu() {
    const mainMenuBtn = document.getElementById('mainMenuBtn');
    
    if (mainMenuBtn) {
        mainMenuBtn.onclick = null;
        
        mainMenuBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            toggleMenu();
        });
        
        console.log('✅ Меню инициализировано');
    } else {
        console.error('❌ Кнопка меню не найдена!');
        setTimeout(initMenu, 100);
    }
}

function toggleMenu() {
    const webLinks = document.getElementById('webLinks');
    const mainBtn = document.getElementById('mainMenuBtn');
    
    if (!webLinks || !mainBtn) {
        console.error('❌ Элементы меню не найдены!');
        return;
    }
    
    isMenuOpen = !isMenuOpen;
    webLinks.classList.toggle('open');
    
    if (isMenuOpen) {
        mainBtn.innerHTML = '<i class="fas fa-times"></i><span class="btn-label">Закрыть</span>';
        mainBtn.style.transform = 'translate(-50%, -50%) rotate(45deg)';
    } else {
        mainBtn.innerHTML = '<i class="fas fa-heart"></i><span class="btn-label">Мы</span>';
        mainBtn.style.transform = 'translate(-50%, -50%)';
    }
    
    console.log('🔘 Меню ' + (isMenuOpen ? 'открыто' : 'закрыто'));
}

document.addEventListener('click', function(event) {
    const webNav = document.querySelector('.web-nav');
    const webLinks = document.getElementById('webLinks');
    const mainBtn = document.getElementById('mainMenuBtn');
    
    if (!webNav || !webLinks || !mainBtn) return;
    
    const isClickInsideMenu = webNav.contains(event.target);
    const isClickOnMainBtn = mainBtn.contains(event.target);
    
    if (isMenuOpen && !isClickInsideMenu && !isClickOnMainBtn) {
        toggleMenu();
    }
});

// ========== КНОПКИ МЕНЮ ==========
window.showAboutMenu = function() {
    toggleMenu();
    document.getElementById('aboutModal').style.display = 'flex';
    loadAboutData();
};

window.closeAboutModal = function() {
    document.getElementById('aboutModal').style.display = 'none';
};

window.showMemories = function() {
    toggleMenu();
    document.getElementById('memoriesModal').style.display = 'flex';
    loadMemories();
};

window.closeMemoriesModal = function() {
    document.getElementById('memoriesModal').style.display = 'none';
};

// В функции openGame замените код на:
window.openGame = function() {
    console.log('🎮 Открытие игры...');
    toggleMenu();
    
    // Простая проверка, загружен ли game.js
    if (typeof window.showGameModal === 'function') {
        console.log('✅ showGameModal найдена, запускаем игру');
        window.showGameModal();
    } else {
        console.error('❌ showGameModal не найдена!');
        alert('Игра загружается... Пожалуйста, подождите несколько секунд.');
        
        // Пробуем перезагрузить игру
        setTimeout(() => {
            if (typeof window.showGameModal === 'function') {
                window.showGameModal();
            } else {
                // Показываем простую версию игры
                createSimpleGameModal();
            }
        }, 500);
    }
};

window.openGallery = function() {
    toggleMenu();
    alert('Галерея объединена с воспоминаниями! 📸');
    showMemories();
};

window.openQuotes = function() {
    toggleMenu();
    alert('Наши цитаты скоро появятся здесь! 💭');
};

window.showSecrets = function() {
    toggleMenu();
    alert('Этот раздел пока секретный! 🤫');
};

window.openSettings = function() {
    toggleMenu();
    alert('Настройки будут доступны в следующих версиях! ⚙️');
};

window.showSurprise = function() {
    createHearts(50);
    
    const messages = [
        "Я тебя люблю! 💖",
        "Ты самая лучшая! 🌟",
        "Спасибо, что ты есть! 😊",
        "Ты делаешь меня счастливым! 🥰",
        "Мы идеальная пара! 💑"
    ];
    
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    const surprise = document.createElement('div');
    surprise.className = 'card';
    surprise.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10000;
        text-align: center;
        animation: popIn 0.5s;
    `;
    surprise.innerHTML = `
        <h2 style="color: var(--primary);">Сюрприз! 🎁</h2>
        <p style="font-size: 20px; margin: 20px 0;">${message}</p>
        <button onclick="this.parentElement.remove()" class="btn-primary">
            <i class="fas fa-heart"></i> Спасибо!
        </button>
    `;
    
    document.body.appendChild(surprise);
};

// ========== БЛОК "О НАС" ==========
function loadAboutData() {
    const profiles = JSON.parse(localStorage.getItem('profiles') || '{}');
    
    // Обновляем элементы только если они существуют
    const egorDesc = document.getElementById('egorDesc');
    const ulyanaDesc = document.getElementById('ulyanaDesc');
    
    if (egorDesc && profiles.egor) {
        egorDesc.textContent = profiles.egor.bio || 'Нажми, чтобы изменить профиль';
    }
    
    if (ulyanaDesc && profiles.ulyana) {
        ulyanaDesc.textContent = profiles.ulyana.bio || 'Нажми, чтобы изменить профиль';
    }
    
    const ourStory = localStorage.getItem('ourStory');
    if (ourStory && document.getElementById('ourStory')) {
        document.getElementById('ourStory').value = ourStory;
    }
    
    updateStats();
}

window.editProfile = function(profile) {
    currentProfileEditing = profile;
    const profiles = JSON.parse(localStorage.getItem('profiles') || '{}');
    const profileData = profiles[profile] || {};
    
    // Используем существующую модалку
    document.getElementById('profileModal').style.display = 'flex';
    
    const modalTitle = document.querySelector('#profileModal .modal-header h3');
    if (modalTitle) {
        modalTitle.textContent = `Редактировать профиль ${profile === 'egor' ? 'Егора' : 'Ульяны'}`;
    }
    
    // Заполняем поля
    const nameInput = document.getElementById('profileName');
    const ageInput = document.getElementById('profileAge');
    const bioInput = document.getElementById('profileBio');
    const hobbiesInput = document.getElementById('profileHobbies');
    
    if (nameInput) nameInput.value = profileData.name || (profile === 'egor' ? 'Егор' : 'Ульяна');
    if (ageInput) ageInput.value = profileData.age || '';
    if (bioInput) bioInput.value = profileData.bio || '';
    if (hobbiesInput) hobbiesInput.value = profileData.hobbies || '';
    
    closeAboutModal();
};

window.closeProfileModal = function() {
    document.getElementById('profileModal').style.display = 'none';
    currentProfileEditing = null;
};

window.saveProfile = function() {
    if (!currentProfileEditing) return;
    
    const nameInput = document.getElementById('profileName');
    const ageInput = document.getElementById('profileAge');
    const bioInput = document.getElementById('profileBio');
    const hobbiesInput = document.getElementById('profileHobbies');
    
    if (!nameInput || !ageInput || !bioInput || !hobbiesInput) {
        alert('Ошибка: не все поля найдены');
        return;
    }
    
    const profileData = {
        name: nameInput.value,
        age: ageInput.value,
        bio: bioInput.value,
        hobbies: hobbiesInput.value
    };
    
    const profiles = JSON.parse(localStorage.getItem('profiles') || '{}');
    profiles[currentProfileEditing] = profileData;
    localStorage.setItem('profiles', JSON.stringify(profiles));
    
    closeProfileModal();
    
    setTimeout(() => {
        showAboutMenu();
    }, 300);
    
    showNotification('Профиль сохранен! 💾');
};

function updateStats() {
    const days = getDaysTogether();
    const memories = JSON.parse(localStorage.getItem('memories') || '[]');
    
    let totalPhotos = 0;
    memories.forEach(memory => {
        totalPhotos += (memory.photos || []).length;
    });
    
    const totalDaysEl = document.getElementById('totalDays');
    const totalMemoriesEl = document.getElementById('totalMemories');
    const totalPhotosEl = document.getElementById('totalPhotos');
    const totalGamesEl = document.getElementById('totalGames');
    
    if (totalDaysEl) totalDaysEl.textContent = days;
    if (totalMemoriesEl) totalMemoriesEl.textContent = memories.length;
    if (totalPhotosEl) totalPhotosEl.textContent = totalPhotos;
    if (totalGamesEl) totalGamesEl.textContent = localStorage.getItem('gamesPlayed') || 0;
}

window.saveOurStory = function() {
    const storyInput = document.getElementById('ourStory');
    if (storyInput) {
        localStorage.setItem('ourStory', storyInput.value);
        showNotification('История сохранена! 📖');
    }
};

// ========== ВОСПОМИНАНИЯ ==========
function loadMemories() {
    const memories = JSON.parse(localStorage.getItem('memories') || '[]');
    const memoriesList = document.getElementById('memoriesList');
    
    if (!memoriesList) return;
    
    if (memories.length === 0) {
        memoriesList.innerHTML = `
            <div style="text-align: center; padding: 50px; color: var(--gray);">
                <i class="fas fa-calendar-times" style="font-size: 48px; margin-bottom: 20px;"></i>
                <h3>Пока нет воспоминаний</h3>
                <p>Добавьте первое воспоминание!</p>
            </div>
        `;
        return;
    }
    
    memoriesList.innerHTML = '';
    
    memories.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    memories.forEach((memory, index) => {
        const memoryDate = new Date(memory.date).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        
        const memoryCard = document.createElement('div');
        memoryCard.className = 'memory-card';
        memoryCard.style.cssText = `
            background: white;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 5px solid ${memory.color || '#ff4081'};
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        `;
        
        let photosHTML = '';
        if (memory.photos && memory.photos.length > 0) {
            const previewPhotos = memory.photos.slice(0, 3);
            photosHTML = `
                <div style="
                    display: grid;
                    grid-template-columns: repeat(${Math.min(previewPhotos.length, 3)}, 1fr);
                    gap: 5px;
                    margin: 15px 0;
                    border-radius: 10px;
                    overflow: hidden;
                ">
                    ${previewPhotos.map((photo, i) => `
                        <img src="${photo}" alt="Фото" style="
                            width: 100%;
                            height: 80px;
                            object-fit: cover;
                            cursor: pointer;
                        " onclick="viewMemoryPhoto('${photo}')">
                    `).join('')}
                    ${memory.photos.length > 3 ? `
                        <div style="
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: rgba(0,0,0,0.5);
                            color: white;
                            font-weight: bold;
                        ">
                            +${memory.photos.length - 3}
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        memoryCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="font-weight: bold; font-size: 18px; color: var(--dark);">${memory.title}</div>
                <div style="font-size: 12px; color: var(--gray); background: var(--gray-light); padding: 4px 10px; border-radius: 15px;">${memoryDate}</div>
            </div>
            ${photosHTML}
            <div style="color: var(--black); line-height: 1.6; margin: 15px 0;">${memory.description}</div>
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button class="btn-secondary" onclick="editMemory(${index})" style="padding: 8px 15px;">
                    <i class="fas fa-edit"></i> Редактировать
                </button>
                <button onclick="deleteMemory(${index})" style="
                    padding: 8px 15px;
                    background: var(--danger);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                ">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            </div>
        `;
        
        memoriesList.appendChild(memoryCard);
    });
}

window.addMemory = function() {
    currentMemoryEditing = null;
    memoryPhotos = [];
    
    document.getElementById('addMemoryModal').style.display = 'flex';
    
    document.getElementById('memoryTitle').value = '';
    document.getElementById('memoryDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('memoryDescription').value = '';
    updatePhotosPreview();
};

window.closeAddMemoryModal = function() {
    document.getElementById('addMemoryModal').style.display = 'none';
};

window.handleMemoryPhotoUpload = function(event) {
    const files = Array.from(event.target.files);
    const maxPhotos = 6;
    
    if (memoryPhotos.length + files.length > maxPhotos) {
        alert(`Можно добавить максимум ${maxPhotos} фотографий!`);
        return;
    }
    
    files.forEach(file => {
        if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите только изображения!');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            memoryPhotos.push(e.target.result);
            updatePhotosPreview();
        };
        reader.readAsDataURL(file);
    });
    
    event.target.value = '';
};

function updatePhotosPreview() {
    const preview = document.getElementById('photosPreview');
    const uploadArea = document.getElementById('photoUploadArea');
    
    if (!preview || !uploadArea) return;
    
    preview.innerHTML = '';
    uploadArea.innerHTML = '';
    
    memoryPhotos.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.style.cssText = `
            position: relative;
            aspect-ratio: 1;
            border-radius: 8px;
            overflow: hidden;
        `;
        photoItem.innerHTML = `
            <img src="${photo}" alt="Фото" style="width: 100%; height: 100%; object-fit: cover;">
            <button onclick="removeMemoryPhoto(${index})" style="
                position: absolute;
                top: 5px;
                right: 5px;
                background: rgba(255,0,0,0.8);
                color: white;
                border: none;
                width: 25px;
                height: 25px;
                border-radius: 50%;
                cursor: pointer;
            ">
                <i class="fas fa-times"></i>
            </button>
        `;
        preview.appendChild(photoItem);
    });
    
    if (memoryPhotos.length < 6) {
        const uploadSlot = document.createElement('div');
        uploadSlot.style.cssText = `
            aspect-ratio: 1;
            border: 2px dashed var(--primary);
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: var(--primary);
            cursor: pointer;
            background: rgba(233, 30, 99, 0.05);
        `;
        uploadSlot.onclick = () => {
            const input = document.getElementById('memoryPhotoInput');
            if (input) input.click();
        };
        uploadSlot.innerHTML = `
            <i class="fas fa-plus" style="font-size: 30px; margin-bottom: 10px;"></i>
            <span>Добавить фото (${memoryPhotos.length}/6)</span>
        `;
        uploadArea.appendChild(uploadSlot);
    }
}

window.removeMemoryPhoto = function(index) {
    memoryPhotos.splice(index, 1);
    updatePhotosPreview();
};

window.selectMemoryColor = function(color) {
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.toggle('selected', option.dataset.color === color);
    });
};

window.saveMemory = function() {
    const title = document.getElementById('memoryTitle').value.trim();
    const date = document.getElementById('memoryDate').value;
    const description = document.getElementById('memoryDescription').value.trim();
    const selectedColorElement = document.querySelector('.color-option.selected');
    
    if (!title || !date || !description) {
        alert('Пожалуйста, заполните все обязательные поля!');
        return;
    }
    
    const selectedColor = selectedColorElement ? selectedColorElement.dataset.color : '#ff9a9e';
    
    const memories = JSON.parse(localStorage.getItem('memories') || '[]');
    const memoryData = {
        title,
        date,
        description,
        photos: [...memoryPhotos],
        color: selectedColor,
        created: new Date().toISOString()
    };
    
    if (currentMemoryEditing !== null) {
        memories[currentMemoryEditing] = memoryData;
    } else {
        memories.push(memoryData);
    }
    
    localStorage.setItem('memories', JSON.stringify(memories));
    closeAddMemoryModal();
    loadMemories();
    showNotification('Воспоминание сохранено! 📸');
};

window.editMemory = function(index) {
    currentMemoryEditing = index;
    const memories = JSON.parse(localStorage.getItem('memories') || '[]');
    const memory = memories[index];
    
    if (!memory) return;
    
    document.getElementById('memoryTitle').value = memory.title;
    document.getElementById('memoryDate').value = memory.date.split('T')[0];
    document.getElementById('memoryDescription').value = memory.description;
    memoryPhotos = [...(memory.photos || [])];
    
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.toggle('selected', option.dataset.color === memory.color);
    });
    
    updatePhotosPreview();
    document.getElementById('addMemoryModal').style.display = 'flex';
};

window.deleteMemory = function(index) {
    if (!confirm('Вы уверены, что хотите удалить это воспоминание?')) return;
    
    const memories = JSON.parse(localStorage.getItem('memories') || '[]');
    memories.splice(index, 1);
    localStorage.setItem('memories', JSON.stringify(memories));
    
    loadMemories();
    showNotification('Воспоминание удалено! 🗑️');
};

window.viewMemoryPhoto = function(photoUrl) {
    const viewer = document.createElement('div');
    viewer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
    `;
    
    viewer.innerHTML = `
        <div style="position: relative;">
            <img src="${photoUrl}" style="max-width: 90vw; max-height: 90vh; border-radius: 10px;">
            <button onclick="this.parentElement.parentElement.remove()" style="
                position: absolute;
                top: -40px;
                right: 0;
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                font-size: 24px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
            ">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(viewer);
};

// ========== АНИМАЦИИ И ЭФФЕКТЫ ==========
function createHearts(count) {
    const container = document.getElementById('heartsContainer');
    if (!container) return;
    
    for (let i = 0; i < count; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart-float';
        heart.innerHTML = '❤️';
        heart.style.cssText = `
            left: ${Math.random() * 100}%;
            font-size: ${Math.random() * 20 + 15}px;
            color: ${['#ff4081', '#e91e63', '#ff80ab', '#f50057'][Math.floor(Math.random() * 4)]};
            animation: floatHeart ${Math.random() * 20 + 10}s infinite linear;
            animation-delay: ${Math.random() * 5}s;
            z-index: -1;
        `;
        container.appendChild(heart);
        
        setTimeout(() => {
            if (heart.parentNode) {
                heart.remove();
            }
        }, 30000);
    }
}

// ========== УВЕДОМЛЕНИЯ ==========
function showNotification(message) {
    const notification = document.createElement('div');
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(233, 30, 99, 0.3);
        z-index: 10001;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s, fadeOut 0.3s 2.7s;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// ========== ХРАНЕНИЕ ДАННЫХ ==========
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (userData.lastVisit) {
        const now = new Date();
        const lastVisit = new Date(userData.lastVisit);
        const diffDays = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) {
            showWelcomeBack(diffDays);
        }
    }
    
    userData.lastVisit = new Date().toISOString();
    localStorage.setItem('userData', JSON.stringify(userData));
}

function showWelcomeBack(days) {
    const messages = [
        `С возвращением! Мы скучали ${days} дней! 💖`,
        `Рады видеть тебя снова! Прошло ${days} дней. 😊`,
        `${days} дней без тебя - это слишком много! 🥺`
    ];
    
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    const welcome = document.createElement('div');
    welcome.className = 'card';
    welcome.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 9999;
        max-width: 300px;
        animation: slideInRight 0.5s;
    `;
    welcome.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <i class="fas fa-heart" style="color: var(--primary); font-size: 20px;"></i>
            <h3 style="margin: 0; color: var(--primary);">Привет!</h3>
        </div>
        <p style="margin: 0;">${message}</p>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: var(--gray);
            position: absolute;
            top: 10px;
            right: 10px;
            cursor: pointer;
        ">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(welcome);
    
    setTimeout(() => {
        if (welcome.parentNode) {
            welcome.remove();
        }
    }, 5000);
}

// ========== ЗАКРЫТИЕ МОДАЛЬНЫХ ОКОН ==========
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// ========== СТИЛИ ДЛЯ АНИМАЦИЙ ==========
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes fadeInOut {
        0%, 100% { opacity: 0; }
        20%, 80% { opacity: 1; }
    }
    
    @keyframes floatHeart {
        0% { transform: translateY(100vh) rotate(0deg) scale(0.5); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(-100px) rotate(360deg) scale(0.5); opacity: 0; }
    }
        
`;
// Обеспечиваем доступность игровых функций
window.initGame = window.initGame || function() {
    console.log('🔄 initGame вызвана, но функция не определена');
    return false;
};

window.showGameModal = window.showGameModal || function() {
    console.log('🔄 showGameModal вызвана, но функция не определена');
    createSimpleGameModal();
    return false;
};

// Создаем простое модальное окно для игры
function createSimpleGameModal() {
    const modal = document.createElement('div');
    modal.id = 'miniGame';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="
            background: #1a1a2e;
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 90%;
            text-align: center;
            color: white;
            border: 3px solid #e91e63;
        ">
            <h2 style="color: #ff6b8b; margin-bottom: 20px;">
                <i class="fas fa-gamepad"></i> Block Blast
            </h2>
            
            <div style="
                background: rgba(255,255,255,0.1);
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
            ">
                <h3 style="color: #ffd700;">Как играть:</h3>
                <ol style="text-align: left; padding-left: 20px;">
                    <li>Выбери фигуру из доступных</li>
                    <li>Кликни на поле 8×8, чтобы разместить её</li>
                    <li>Заполняй строки и столбцы для бонусов</li>
                    <li>Набери 250 очков для победы!</li>
                </ol>
            </div>
            
            <p style="color: #ff6b8b; font-weight: bold; margin: 20px 0;">
                💖 Меняю приз на самые крепкие обьятия + незабываемый поцелуй! 💖
            </p>
            
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
                <button onclick="startSimpleGame()" style="
                    background: linear-gradient(145deg, #4CAF50, #2E7D32);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 16px;
                ">
                    <i class="fas fa-play"></i> Начать игру
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                    background: linear-gradient(145deg, #f44336, #d32f2f);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 16px;
                ">
                    <i class="fas fa-times"></i> Закрыть
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

window.startSimpleGame = function() {
    // Если game.js загружен, используем его
    if (typeof window.showGameModal === 'function' && window.showGameModal.toString().includes('function')) {
        document.getElementById('miniGame').remove();
        window.showGameModal();
    } else {
        // Показываем сообщение об ошибке
        const gameContent = document.querySelector('#miniGame div div');
        gameContent.innerHTML += `
            <div style="color: #ff6b8b; margin-top: 20px; padding: 10px; background: rgba(255,107,139,0.1); border-radius: 10px;">
                <i class="fas fa-exclamation-triangle"></i> 
                Игра временно недоступна. Попробуйте обновить страницу (F5).
            </div>
        `;
    }
};
document.head.appendChild(style);

// Отладка
console.log('✅ script.js загружен');
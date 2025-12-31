// ========== УПРАВЛЕНИЕ ВОСПОМИНАНИЯМИ С ФОТО ==========

let currentMemoryEditing = null;
let memoryPhotos = [];

// Открытие модального окна воспоминаний
window.showMemories = function() {
    toggleMenu();
    document.getElementById('memoriesModal').style.display = 'flex';
    loadMemories();
};

window.closeMemoriesModal = function() {
    document.getElementById('memoriesModal').style.display = 'none';
};

// Загрузка воспоминаний
function loadMemories() {
    const memories = JSON.parse(localStorage.getItem('memories') || '[]');
    const memoriesList = document.getElementById('memoriesList');
    
    if (memories.length === 0) {
        memoriesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📅</div>
                <h3>Пока нет воспоминаний</h3>
                <p>Добавьте первое воспоминание с фотографиями!</p>
            </div>
        `;
        return;
    }
    
    memoriesList.innerHTML = '';
    
    // Сортируем по дате (новые сверху)
    memories.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    memories.forEach((memory, index) => {
        const memoryDate = new Date(memory.date).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        
        const memoryCard = document.createElement('div');
        memoryCard.className = 'memory-card';
        memoryCard.style.borderLeftColor = memory.color || '#ff4081';
        
        let photosHTML = '';
        if (memory.photos && memory.photos.length > 0) {
            photosHTML = `
                <div class="memory-photos-preview">
                    ${memory.photos.slice(0, 3).map((photo, i) => `
                        <img src="${photo}" alt="Фото ${i + 1}" onclick="viewMemoryPhoto('${photo}')">
                    `).join('')}
                    ${memory.photos.length > 3 ? `<div class="more-photos">+${memory.photos.length - 3}</div>` : ''}
                </div>
            `;
        }
        
        memoryCard.innerHTML = `
            <div class="memory-header">
                <div class="memory-title">${memory.title}</div>
                <div class="memory-date">${memoryDate}</div>
            </div>
            ${photosHTML}
            <div class="memory-description">${memory.description}</div>
            <div class="memory-actions">
                <button class="btn-secondary" onclick="editMemory(${index})">
                    <i class="fas fa-edit"></i> Редактировать
                </button>
                <button class="btn-delete" onclick="deleteMemory(${index})">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            </div>
        `;
        
        memoriesList.appendChild(memoryCard);
    });
}

// Добавление нового воспоминания
window.addMemory = function() {
    currentMemoryEditing = null;
    memoryPhotos = [];
    
    document.getElementById('addMemoryModal').style.display = 'flex';
    
    // Сброс полей
    document.getElementById('memoryTitle').value = '';
    document.getElementById('memoryDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('memoryDescription').value = '';
    document.getElementById('photosPreview').innerHTML = '';
    document.getElementById('photoUploadArea').innerHTML = `
        <div class="upload-slot" onclick="document.getElementById('memoryPhotoInput').click()">
            <i class="fas fa-plus"></i>
            <span>Добавить фото</span>
        </div>
    `;
    
    // Сброс цвета
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector('.color-option[data-color="#ff9a9e"]').classList.add('selected');
};

window.closeAddMemoryModal = function() {
    document.getElementById('addMemoryModal').style.display = 'none';
};

// Загрузка фото в воспоминание
window.handleMemoryPhotoUpload = function(event) {
    const files = Array.from(event.target.files);
    const maxPhotos = 6; // Максимум 6 фото
    
    if (memoryPhotos.length + files.length > maxPhotos) {
        alert(`Можно добавить максимум ${maxPhotos} фотографий!`);
        return;
    }
    
    files.forEach(file => {
        if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите только изображения!');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            alert('Файл слишком большой! Максимальный размер: 5MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            memoryPhotos.push(e.target.result);
            updatePhotosPreview();
        };
        reader.readAsDataURL(file);
    });
    
    // Очищаем input
    event.target.value = '';
};

function updatePhotosPreview() {
    const preview = document.getElementById('photosPreview');
    const uploadArea = document.getElementById('photoUploadArea');
    
    preview.innerHTML = '';
    uploadArea.innerHTML = '';
    
    // Показываем загруженные фото
    memoryPhotos.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-preview-item';
        photoItem.innerHTML = `
            <img src="${photo}" alt="Фото ${index + 1}">
            <button class="delete-photo" onclick="removeMemoryPhoto(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        preview.appendChild(photoItem);
    });
    
    // Показываем слот для загрузки, если есть место
    if (memoryPhotos.length < 6) {
        const uploadSlot = document.createElement('div');
        uploadSlot.className = 'upload-slot';
        uploadSlot.onclick = () => document.getElementById('memoryPhotoInput').click();
        uploadSlot.innerHTML = `
            <i class="fas fa-plus"></i>
            <span>Добавить фото (${memoryPhotos.length}/6)</span>
        `;
        uploadArea.appendChild(uploadSlot);
    }
}

window.removeMemoryPhoto = function(index) {
    memoryPhotos.splice(index, 1);
    updatePhotosPreview();
};

// Выбор цвета воспоминания
window.selectMemoryColor = function(color) {
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.toggle('selected', option.dataset.color === color);
    });
};

// Сохранение воспоминания
window.saveMemory = function() {
    const title = document.getElementById('memoryTitle').value.trim();
    const date = document.getElementById('memoryDate').value;
    const description = document.getElementById('memoryDescription').value.trim();
    const selectedColor = document.querySelector('.color-option.selected').dataset.color;
    
    if (!title || !date || !description) {
        alert('Пожалуйста, заполните все обязательные поля!');
        return;
    }
    
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
        // Редактирование
        memories[currentMemoryEditing] = memoryData;
    } else {
        // Добавление нового
        memories.push(memoryData);
    }
    
    localStorage.setItem('memories', JSON.stringify(memories));
    closeAddMemoryModal();
    loadMemories();
    showNotification('Воспоминание сохранено! 📸');
};

// Редактирование воспоминания
window.editMemory = function(index) {
    currentMemoryEditing = index;
    const memories = JSON.parse(localStorage.getItem('memories') || '[]');
    const memory = memories[index];
    
    if (!memory) return;
    
    document.getElementById('memoryTitle').value = memory.title;
    document.getElementById('memoryDate').value = memory.date.split('T')[0];
    document.getElementById('memoryDescription').value = memory.description;
    memoryPhotos = [...(memory.photos || [])];
    
    // Устанавливаем цвет
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.toggle('selected', option.dataset.color === memory.color);
    });
    
    updatePhotosPreview();
    document.getElementById('addMemoryModal').style.display = 'flex';
};

// Удаление воспоминания
window.deleteMemory = function(index) {
    if (!confirm('Вы уверены, что хотите удалить это воспоминание?')) return;
    
    const memories = JSON.parse(localStorage.getItem('memories') || '[]');
    memories.splice(index, 1);
    localStorage.setItem('memories', JSON.stringify(memories));
    
    loadMemories();
    showNotification('Воспоминание удалено! 🗑️');
};

// Просмотр фото
window.viewMemoryPhoto = function(photoUrl) {
    const viewer = document.createElement('div');
    viewer.className = 'photo-viewer';
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
        animation: fadeIn 0.3s;
    `;
    
    viewer.innerHTML = `
        <div style="position: relative; max-width: 90%; max-height: 90%;">
            <img src="${photoUrl}" style="max-width: 100%; max-height: 90vh; border-radius: 10px;">
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

// Статистика воспоминаний
function updateMemoriesStats() {
    const memories = JSON.parse(localStorage.getItem('memories') || '[]');
    let totalPhotos = 0;
    
    memories.forEach(memory => {
        totalPhotos += (memory.photos || []).length;
    });
    
    document.getElementById('totalMemories').textContent = memories.length;
    document.getElementById('totalPhotos').textContent = totalPhotos;
    
    // Самые старые и новые воспоминания
    if (memories.length > 0) {
        const sortedByDate = [...memories].sort((a, b) => new Date(a.date) - new Date(b.date));
        const oldest = new Date(sortedByDate[0].date);
        const newest = new Date(sortedByDate[sortedByDate.length - 1].date);
        const daysDiff = Math.floor((newest - oldest) / (1000 * 60 * 60 * 24));
        
        document.getElementById('memoryRange').textContent = `${daysDiff} дней`;
    }
}
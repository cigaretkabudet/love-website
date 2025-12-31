// ========== КОНФИГУРАЦИЯ ИГРЫ ==========
const GAME_CONFIG = {
    fieldSize: 8,
    targetScore: 1000,  // Увеличил с 250 до 1000
    basePoints: 15,     // Увеличил базовые очки
    lineBonus: 100,     // Увеличил бонус за линию
    colors: ['#FF6B8B', '#FF9A8B', '#FFB6C1', '#FF4081', '#E91E63', '#C2185B'],
    pieceColors: ['#4A90E2', '#7B68EE', '#20B2AA', '#32CD32', '#FFD700', '#FF6347', '#FF1493', '#00CED1']
};

// ========== ФИГУРЫ ==========
const TETROMINOES = [
    // Квадрат
    [[1, 1], [1, 1]],
    // Прямая (4 блока)
    [[1, 1, 1, 1]],
    // Т-образная
    [[0, 1, 0], [1, 1, 1]],
    // L-образная
    [[1, 0], [1, 0], [1, 1]],
    // S-образная
    [[0, 1, 1], [1, 1, 0]],
    // Крест
    [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
    // Уголок 3x3
    [[1, 1, 1], [1, 0, 0], [1, 0, 0]],
    // Зигзаг
    [[1, 1, 0], [0, 1, 1]],
    // Маленькие фигуры
    [[1, 1, 1]],
    [[1, 1]],
    [[1]]
];

// ========== ПЕРЕМЕННЫЕ ИГРЫ ==========
let gameScore = 0;
let gameField = [];
let pieces = [];
let selectedPieceIndex = null;
let gameActive = false;
let movesCount = 0;
let gameModal = null;

// ========== ОСНОВНЫЕ ФУНКЦИИ ИГРЫ ==========
function initGame() {
    console.log('🎮 Инициализация игры...');
    
    gameScore = 0;
    movesCount = 0;
    gameField = Array(GAME_CONFIG.fieldSize * GAME_CONFIG.fieldSize).fill(0);
    pieces = [];
    selectedPieceIndex = null;
    gameActive = true;
    
    createGameField();
    generatePieces();
    updateScore();
    updateMoves();
    
    console.log('✅ Игра инициализирована');
}

function createGameField() {
    const gameFieldElement = document.getElementById('gameField');
    if (!gameFieldElement) {
        console.error('❌ Элемент gameField не найден!');
        return;
    }
    
    gameFieldElement.innerHTML = '';
    
    // Создаем контейнер для поля с лучшим визуалом
    const fieldContainer = document.createElement('div');
    fieldContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(${GAME_CONFIG.fieldSize}, 1fr);
        grid-template-rows: repeat(${GAME_CONFIG.fieldSize}, 1fr);
        gap: 6px;
        margin: 20px auto;
        max-width: 450px;
        width: 100%;
        background: linear-gradient(145deg, #2c3e50, #1a2530);
        padding: 15px;
        border-radius: 15px;
        border: 4px solid #e74c3c;
        box-shadow: 
            0 15px 35px rgba(0, 0, 0, 0.5),
            inset 0 0 30px rgba(255, 255, 255, 0.1);
    `;
    
    for (let i = 0; i < GAME_CONFIG.fieldSize * GAME_CONFIG.fieldSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'game-cell';
        cell.dataset.index = i;
        
        // Основные стили для ячейки
        cell.style.cssText = `
            aspect-ratio: 1;
            background: linear-gradient(145deg, rgba(52, 73, 94, 0.7), rgba(44, 62, 80, 0.9));
            border: 2px solid rgba(255, 255, 255, 0.15);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            overflow: hidden;
            box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
        `;
        
        // Эффект при наведении
        cell.addEventListener('mouseenter', function() {
            if (gameActive && !this.classList.contains('filled')) {
                this.style.transform = 'scale(1.05)';
                this.style.background = 'linear-gradient(145deg, rgba(255, 107, 139, 0.2), rgba(231, 76, 60, 0.3))';
                this.style.borderColor = 'rgba(255, 107, 139, 0.5)';
                this.style.boxShadow = '0 0 20px rgba(255, 107, 139, 0.3)';
            }
        });
        
        cell.addEventListener('mouseleave', function() {
            if (!this.classList.contains('filled')) {
                this.style.transform = '';
                this.style.background = 'linear-gradient(145deg, rgba(52, 73, 94, 0.7), rgba(44, 62, 80, 0.9))';
                this.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                this.style.boxShadow = 'inset 0 0 10px rgba(0, 0, 0, 0.3)';
            }
        });
        
        // Обработчик клика
        cell.addEventListener('click', () => placePiece(i));
        
        fieldContainer.appendChild(cell);
    }
    
    gameFieldElement.appendChild(fieldContainer);
    console.log('✅ Поле создано');
}

function generatePieces() {
    const piecesContainer = document.getElementById('pieces');
    if (!piecesContainer) {
        console.error('❌ Элемент pieces не найден!');
        return;
    }
    
    piecesContainer.innerHTML = '';
    pieces = [];
    
    // Создаем контейнер для фигур с лучшим оформлением
    const piecesInner = document.createElement('div');
    piecesInner.style.cssText = `
        display: flex;
        justify-content: center;
        gap: 20px;
        flex-wrap: wrap;
        padding: 20px;
        background: linear-gradient(145deg, rgba(44, 62, 80, 0.9), rgba(52, 73, 94, 0.7));
        border-radius: 15px;
        border: 3px solid #3498db;
        margin: 0 auto;
        max-width: 800px;
    `;
    
    // Генерируем 3 фигуры
    for (let i = 0; i < 3; i++) {
        const piece = getRandomPiece();
        pieces.push(piece);
        
        const pieceContainer = document.createElement('div');
        pieceContainer.className = 'game-piece-container';
        pieceContainer.dataset.index = i;
        
        // Стили контейнера фигуры
        pieceContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        // Визуальное представление фигуры
        const pieceVisual = document.createElement('div');
        pieceVisual.style.cssText = `
            display: grid;
            grid-template-columns: repeat(${piece.width}, 1fr);
            grid-template-rows: repeat(${piece.height}, 1fr);
            gap: 5px;
            padding: 12px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            border: 2px solid ${piece.color};
            transition: all 0.3s ease;
        `;
        
        // Заполняем фигуру блоками
        for (let y = 0; y < piece.height; y++) {
            for (let x = 0; x < piece.width; x++) {
                const block = document.createElement('div');
                
                if (piece.shape[y][x]) {
                    block.style.cssText = `
                        width: 30px;
                        height: 30px;
                        background: ${piece.color};
                        border-radius: 6px;
                        box-shadow: 
                            inset 0 -3px 0 rgba(0,0,0,0.2),
                            inset 0 3px 0 rgba(255,255,255,0.1),
                            0 0 10px ${piece.color}80;
                        border: 1px solid rgba(255,255,255,0.2);
                    `;
                } else {
                    block.style.cssText = `
                        width: 30px;
                        height: 30px;
                        background: transparent;
                        border: 1px dashed rgba(255,255,255,0.1);
                        border-radius: 6px;
                    `;
                }
                
                pieceVisual.appendChild(block);
            }
        }
        
        // Подпись с очками
        const pieceScore = document.createElement('div');
        const cellsCount = countCells(piece.shape);
        pieceScore.textContent = `${cellsCount * GAME_CONFIG.basePoints} очков`;
        pieceScore.style.cssText = `
            color: #ecf0f1;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            padding: 5px 10px;
            background: rgba(0,0,0,0.5);
            border-radius: 10px;
        `;
        
        pieceContainer.appendChild(pieceVisual);
        pieceContainer.appendChild(pieceScore);
        
        // Обработчики событий
        pieceContainer.addEventListener('click', (function(index) {
            return function(e) {
                e.stopPropagation();
                selectPiece(index);
            };
        })(i));
        
        pieceContainer.addEventListener('mouseenter', function() {
            if (!this.classList.contains('selected') && gameActive) {
                pieceVisual.style.transform = 'translateY(-5px) scale(1.05)';
                pieceVisual.style.boxShadow = `0 15px 25px rgba(0, 0, 0, 0.4), 0 0 20px ${piece.color}80`;
            }
        });
        
        pieceContainer.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                pieceVisual.style.transform = '';
                pieceVisual.style.boxShadow = '';
            }
        });
        
        piecesInner.appendChild(pieceContainer);
    }
    
    piecesContainer.appendChild(piecesInner);
    console.log('✅ Фигуры сгенерированы');
}

function getRandomPiece() {
    const useBig = Math.random() < 0.5; // 50% шанс на большую фигуру
    let tetromino;
    
    if (useBig) {
        // Большие фигуры (первые 8 в массиве)
        tetromino = TETROMINOES[Math.floor(Math.random() * 8)];
    } else {
        // Маленькие фигуры (последние 3 в массиве)
        tetromino = TETROMINOES[Math.floor(Math.random() * 3) + 8];
    }
    
    const color = GAME_CONFIG.pieceColors[Math.floor(Math.random() * GAME_CONFIG.pieceColors.length)];
    
    return {
        shape: tetromino,
        color: color,
        width: tetromino[0].length,
        height: tetromino.length,
        isBig: useBig
    };
}

function darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    
    return "#" + (0x1000000 + 
        (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16)
        .slice(1);
}

function selectPiece(index) {
    if (!gameActive) {
        console.warn('⚠️ Игра не активна');
        return;
    }
    
    console.log('🎯 Выбор фигуры:', index);
    
    if (index >= pieces.length) {
        console.error('❌ Фигуры с индексом', index, 'не существует!');
        showGameMessage('Эта фигура уже использована! Выбери другую.', 'error');
        return;
    }
    
    // Снимаем выделение со всех фигур
    document.querySelectorAll('.game-piece-container').forEach(p => {
        p.classList.remove('selected');
        const pieceVisual = p.querySelector('div:first-child');
        if (pieceVisual) {
            pieceVisual.style.transform = '';
            pieceVisual.style.boxShadow = '';
            pieceVisual.style.borderColor = pieceVisual.style.borderColor;
        }
    });
    
    // Выделяем выбранную фигуру
    selectedPieceIndex = index;
    const pieceContainer = document.querySelector(`.game-piece-container[data-index="${index}"]`);
    
    if (pieceContainer) {
        pieceContainer.classList.add('selected');
        const pieceVisual = pieceContainer.querySelector('div:first-child');
        if (pieceVisual) {
            pieceVisual.style.transform = 'translateY(-10px) scale(1.1)';
            pieceVisual.style.boxShadow = `
                0 20px 40px rgba(0, 0, 0, 0.5),
                0 0 40px ${pieces[index].color}
            `;
            pieceVisual.style.borderColor = '#FF6B8B';
        }
        
        // Добавляем класс для пульсации
        pieceContainer.classList.add('selected-piece');
        
        console.log('✅ Фигура выбрана');
        showGameMessage(`Фигура выбрана! Размести её на поле ✨`, 'info');
    } else {
        console.error('❌ Контейнер фигуры не найден');
        selectedPieceIndex = null;
    }
}

// ОБНОВЛЯЕМ ФУНКЦИЮ removePiece:
function removePiece(index) {
    console.log('🗑️ Удаление фигуры:', index);
    
    const pieceContainer = document.querySelector(`.game-piece-container[data-index="${index}"]`);
    if (pieceContainer) {
        // Анимация удаления
        pieceContainer.style.opacity = '0';
        pieceContainer.style.transform = 'scale(0.5) translateY(20px)';
        
        setTimeout(() => {
            if (pieceContainer.parentNode) {
                pieceContainer.remove();
            }
            pieces.splice(index, 1);
            
            // Обновляем индексы оставшихся фигур
            document.querySelectorAll('.game-piece-container').forEach((p, newIndex) => {
                p.dataset.index = newIndex;
                
                // Обновляем обработчики событий
                p.onclick = (e) => {
                    e.stopPropagation();
                    selectPiece(newIndex);
                };
            });
            
            console.log('✅ Фигура удалена');
        }, 300);
    } else {
        // Если элемент не найден в DOM, просто удаляем из массива
        pieces.splice(index, 1);
        console.log('✅ Фигура удалена из массива');
    }
}

function checkLines() {
    let linesCleared = 0;
    const linesToClear = [];
    const columnsToClear = [];
    
    // Проверяем строки
    for (let y = 0; y < GAME_CONFIG.fieldSize; y++) {
        let fullLine = true;
        for (let x = 0; x < GAME_CONFIG.fieldSize; x++) {
            if (gameField[y * GAME_CONFIG.fieldSize + x] === 0) {
                fullLine = false;
                break;
            }
        }
        
        if (fullLine) {
            linesToClear.push(y);
        }
    }
    
    // Проверяем столбцы
    for (let x = 0; x < GAME_CONFIG.fieldSize; x++) {
        let fullColumn = true;
        for (let y = 0; y < GAME_CONFIG.fieldSize; y++) {
            if (gameField[y * GAME_CONFIG.fieldSize + x] === 0) {
                fullColumn = false;
                break;
            }
        }
        
        if (fullColumn) {
            columnsToClear.push(x);
        }
    }
    
    // Очищаем линии
    linesToClear.forEach(y => {
        for (let x = 0; x < GAME_CONFIG.fieldSize; x++) {
            gameField[y * GAME_CONFIG.fieldSize + x] = 0;
        }
        linesCleared++;
    });
    
    columnsToClear.forEach(x => {
        for (let y = 0; y < GAME_CONFIG.fieldSize; y++) {
            gameField[y * GAME_CONFIG.fieldSize + x] = 0;
        }
        linesCleared++;
    });
    
    // Бонусные очки за линии
    if (linesCleared > 0) {
        let bonus = linesCleared * GAME_CONFIG.lineBonus;
        
        // Дополнительный бонус за комбо
        if (linesToClear.length > 0 && columnsToClear.length > 0) {
            bonus = Math.floor(bonus * 2);
        }
        
        gameScore += bonus;
        updateScore();
        updateField();
    }
    
    return linesCleared;
}

function updateField() {
    const cells = document.querySelectorAll('.game-cell');
    cells.forEach((cell, index) => {
        if (gameField[index] !== 0) {
            const cellData = gameField[index];
            cell.style.background = `linear-gradient(145deg, ${cellData.color}, ${darkenColor(cellData.color, 20)})`;
            cell.style.boxShadow = `
                0 4px 12px rgba(0, 0, 0, 0.3),
                inset 0 -2px 6px rgba(0, 0, 0, 0.2),
                inset 0 2px 6px rgba(255, 255, 255, 0.1)
            `;
            cell.style.border = '2px solid rgba(255, 255, 255, 0.2)';
            cell.classList.add('filled');
        } else {
            cell.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.1))';
            cell.style.boxShadow = '';
            cell.style.border = '2px solid rgba(255, 255, 255, 0.08)';
            cell.classList.remove('filled');
        }
    });
}

function updateScore() {
    const scoreElement = document.getElementById('scoreBoard');
    if (scoreElement) {
        scoreElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="
                    background: linear-gradient(145deg, #FF6B8B, #E91E63);
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(255, 107, 139, 0.4);
                ">
                    <i class="fas fa-star" style="color: white; font-size: 24px;"></i>
                </div>
                <div>
                    <div style="font-size: 12px; color: #aaa; margin-bottom: 2px;">СЧЁТ</div>
                    <div style="font-size: 32px; font-weight: bold; color: ${gameScore >= GAME_CONFIG.targetScore ? '#4CAF50' : 'white'}">
                        ${gameScore}<span style="font-size: 16px; color: #FF6B8B">/${GAME_CONFIG.targetScore}</span>
                    </div>
                </div>
            </div>
        `;
    }
}

function updateMoves() {
    const movesElement = document.getElementById('movesCount');
    if (movesElement) {
        movesElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="
                    background: linear-gradient(145deg, #4A90E2, #357ABD);
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(74, 144, 226, 0.4);
                ">
                    <i class="fas fa-shoe-prints" style="color: white; font-size: 20px;"></i>
                </div>
                <div>
                    <div style="font-size: 12px; color: #aaa; margin-bottom: 2px;">ХОДЫ</div>
                    <div style="font-size: 24px; font-weight: bold; color: white;">
                        ${movesCount}
                    </div>
                </div>
            </div>
        `;
    }
}

function winGame() {
    gameActive = false;
    
    const winMessage = document.getElementById('winMessage');
    if (winMessage) {
        winMessage.style.display = 'block';
        winMessage.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="
                    font-size: 80px;
                    margin-bottom: 20px;
                    animation: trophyFloat 2s infinite ease-in-out;
                    text-shadow: 0 0 30px gold;
                ">🏆</div>
                
                <div style="
                    background: linear-gradient(145deg, rgba(76, 175, 80, 0.2), rgba(46, 125, 50, 0.2));
                    padding: 30px;
                    border-radius: 20px;
                    border: 3px solid #4CAF50;
                    margin-bottom: 30px;
                ">
                    <h2 style="color: #4CAF50; margin-bottom: 15px; font-size: 36px; text-shadow: 0 0 10px rgba(76, 175, 80, 0.3)">
                        ПОБЕДА! 🎉
                    </h2>
                    <p style="font-size: 20px; color: white; margin-bottom: 10px;">
                        Ты набрала <span style="color: #FFD700; font-weight: bold; font-size: 28px">${gameScore}</span> очков!
                    </p>
                    <p style="font-size: 18px; color: #ccc">
                        Ходов сделано: ${movesCount}
                    </p>
                </div>
                
                <p style="
                    font-size: 22px;
                    color: #FF6B8B;
                    margin-bottom: 30px;
                    font-weight: bold;
                    text-shadow: 0 0 10px rgba(255, 107, 139, 0.3);
                ">
                    💖 Меняю приз, на самые крепкие обьятия, и на самый незабываемый поцелуй! 💖
                </p>
                
                <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap">
                    <button onclick="resetGame()" style="
                        background: linear-gradient(145deg, #4CAF50, #2E7D32);
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 15px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        font-weight: bold;
                        font-size: 16px;
                        transition: all 0.3s;
                        box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
                    " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 12px 30px rgba(76, 175, 80, 0.6)'"
                     onmouseout="this.style.transform=''; this.style.boxShadow='0 8px 25px rgba(76, 175, 80, 0.4)'">
                        <i class="fas fa-redo"></i> Играть снова
                    </button>
                    
                    <button onclick="closeGame()" style="
                        background: linear-gradient(145deg, #FF6B8B, #E91E63);
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 15px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        font-weight: bold;
                        font-size: 16px;
                        transition: all 0.3s;
                        box-shadow: 0 8px 25px rgba(255, 107, 139, 0.4);
                    " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 12px 30px rgba(255, 107, 139, 0.6)'"
                     onmouseout="this.style.transform=''; this.style.boxShadow='0 8px 25px rgba(255, 107, 139, 0.4)'">
                        <i class="fas fa-times"></i> Закрыть
                    </button>
                </div>
            </div>
        `;
    }
    
    // Победные эффекты
    createHearts(20);
}

function resetGame() {
    console.log('🔄 Сброс игры');
    
    const winMessage = document.getElementById('winMessage');
    if (winMessage) {
        winMessage.style.display = 'none';
    }
    
    initGame();
    showGameMessage('Новая игра началась! Удачи! 🍀', 'success');
}

function closeGame() {
    console.log('❌ Закрытие игры');
    
    if (gameModal) {
        gameModal.remove();
        gameModal = null;
    }
    gameActive = false;
}

function showGameMessage(text, type) {
    const message = document.createElement('div');
    message.className = 'game-message';
    message.textContent = text;
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${type === 'error' ? 'linear-gradient(145deg, #f44336, #d32f2f)' : 
                     type === 'success' ? 'linear-gradient(145deg, #4CAF50, #2E7D32)' : 
                     'linear-gradient(145deg, #FF9800, #F57C00)'};
        color: white;
        padding: 20px 40px;
        border-radius: 15px;
        z-index: 10002;
        animation: messagePopIn 2.5s;
        font-weight: bold;
        font-size: 18px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        text-align: center;
        min-width: 300px;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 2500);
}

function showFloatingText(text, color) {
    const floatingText = document.createElement('div');
    floatingText.textContent = text;
    floatingText.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: ${color};
        font-size: 28px;
        font-weight: bold;
        z-index: 10002;
        animation: floatUp 1s forwards;
        text-shadow: 0 0 10px rgba(0,0,0,0.5);
        pointer-events: none;
    `;
    
    document.body.appendChild(floatingText);
    
    setTimeout(() => {
        if (floatingText.parentNode) {
            floatingText.remove();
        }
    }, 1000);
}

// ========== ФУНКЦИЯ ПОКАЗА МОДАЛЬНОГО ОКНА ИГРЫ ==========
window.showGameModal = function() {
    console.log('🎮 Открытие модального окна игры');
    
    // Удаляем старую модалку, если есть
    const oldModal = document.getElementById('miniGame');
    if (oldModal) {
        oldModal.remove();
    }
    
    // Создаем модальное окно игры
    gameModal = document.createElement('div');
    gameModal.id = 'miniGame';
    gameModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        animation: fadeIn 0.3s;
    `;
    
    gameModal.innerHTML = `
        <div style="
            background: linear-gradient(145deg, #1a1a2e, #16213e);
            border-radius: 30px;
            padding: 40px;
            max-width: 900px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            border: 3px solid #FF6B8B;
            animation: slideUp 0.5s;
            position: relative;
        ">
            <!-- Фоновый узор -->
            <div style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: 
                    radial-gradient(circle at 20% 80%, rgba(255, 107, 139, 0.05) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(74, 144, 226, 0.05) 0%, transparent 50%);
                pointer-events: none;
            "></div>
            
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid rgba(255, 107, 139, 0.3);
                position: relative;
                z-index: 1;
            ">
                <div>
                    <h2 style="
                        color: white;
                        margin: 0;
                        font-size: 36px;
                        background: linear-gradient(90deg, #FF6B8B, #FFD700);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        text-shadow: 0 0 20px rgba(255, 107, 139, 0.3);
                    ">
                        <i class="fas fa-gamepad" style="margin-right: 15px;"></i>Block Blast
                    </h2>
                    <p style="color: #aaa; margin: 5px 0 0 0; font-size: 14px">
                        Собери линии, получи приз! 💖
                    </p>
                </div>
                
                <button onclick="closeGame()" style="
                    background: linear-gradient(145deg, rgba(255, 107, 139, 0.2), rgba(233, 30, 99, 0.1));
                    color: #FF6B8B;
                    border: 2px solid rgba(255, 107, 139, 0.4);
                    font-size: 20px;
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                    position: relative;
                    overflow: hidden;
                    z-index: 1;
                " onmouseover="this.style.transform='rotate(90deg) scale(1.1)'; this.style.boxShadow='0 0 25px rgba(255, 107, 139, 0.6)'"
                 onmouseout="this.style.transform=''; this.style.boxShadow=''">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 20px;
                margin-bottom: 30px;
                padding: 25px;
                background: linear-gradient(145deg, rgba(255, 255, 255, 0.03), rgba(0, 0, 0, 0.1));
                border-radius: 20px;
                border: 2px solid rgba(255, 107, 139, 0.2);
                position: relative;
                z-index: 1;
            ">
                <!-- Счет -->
                <div id="scoreBoard"></div>
                
                <!-- Ходы -->
                <div id="movesCount"></div>
                
                <!-- Кнопка новой игры -->
                <button onclick="resetGame()" style="
                    background: linear-gradient(145deg, #4A90E2, #357ABD);
                    color: white;
                    border: none;
                    padding: 15px 25px;
                    border-radius: 15px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: bold;
                    font-size: 16px;
                    transition: all 0.3s;
                    box-shadow: 0 8px 25px rgba(74, 144, 226, 0.4);
                " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 12px 30px rgba(74, 144, 226, 0.6)'"
                 onmouseout="this.style.transform=''; this.style.boxShadow='0 8px 25px rgba(74, 144, 226, 0.4)'">
                    <i class="fas fa-redo"></i> Новая игра
                </button>
            </div>
            
            <!-- Как играть -->
            <div style="
                background: linear-gradient(145deg, rgba(255, 107, 139, 0.1), rgba(74, 144, 226, 0.1));
                padding: 25px;
                border-radius: 20px;
                margin-bottom: 30px;
                border: 2px solid rgba(255, 107, 139, 0.2);
                position: relative;
                z-index: 1;
            ">
                <h3 style="
                    color: white;
                    margin: 0 0 20px 0;
                    font-size: 24px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                ">
                    <div style="
                        background: linear-gradient(145deg, #FF6B8B, #E91E63);
                        width: 40px;
                        height: 40px;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <i class="fas fa-info-circle" style="color: white; font-size: 20px;"></i>
                    </div>
                    Как играть:
                </h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px">
                    <div style="
                        background: rgba(255, 255, 255, 0.03);
                        padding: 20px;
                        border-radius: 15px;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                    ">
                        <div style="
                            background: linear-gradient(145deg, #4CAF50, #2E7D32);
                            width: 40px;
                            height: 40px;
                            border-radius: 10px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-bottom: 15px;
                        ">
                            <i class="fas fa-mouse-pointer" style="color: white; font-size: 18px"></i>
                        </div>
                        <h4 style="color: white; margin: 0 0 10px 0">1. Выбери фигуру</h4>
                        <p style="color: #ccc; margin: 0; line-height: 1.5">
                            Кликни на любую из трёх фигур ниже
                        </p>
                    </div>
                    
                    <div style="
                        background: rgba(255, 255, 255, 0.03);
                        padding: 20px;
                        border-radius: 15px;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                    ">
                        <div style="
                            background: linear-gradient(145deg, #FF9800, #F57C00);
                            width: 40px;
                            height: 40px;
                            border-radius: 10px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-bottom: 15px;
                        ">
                            <i class="fas fa-th" style="color: white; font-size: 18px"></i>
                        </div>
                        <h4 style="color: white; margin: 0 0 10px 0">2. Размести фигуру</h4>
                        <p style="color: #ccc; margin: 0; line-height: 1.5">
                            Кликни на свободное место на поле 8×8
                        </p>
                    </div>
                    
                    <div style="
                        background: rgba(255, 255, 255, 0.03);
                        padding: 20px;
                        border-radius: 15px;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                    ">
                        <div style="
                            background: linear-gradient(145deg, #9C27B0, #7B1FA2);
                            width: 40px;
                            height: 40px;
                            border-radius: 10px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-bottom: 15px;
                        ">
                            <i class="fas fa-bolt" style="color: white; font-size: 18px"></i>
                        </div>
                        <h4 style="color: white; margin: 0 0 10px 0">3. Собирай линии</h4>
                        <p style="color: #ccc; margin: 0; line-height: 1.5">
                            Заполни строку или столбец для бонуса
                        </p>
                    </div>
                    
                    <div style="
                        background: rgba(255, 255, 255, 0.03);
                        padding: 20px;
                        border-radius: 15px;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                    ">
                        <div style="
                            background: linear-gradient(145deg, #FFD700, #FFC107);
                            width: 40px;
                            height: 40px;
                            border-radius: 10px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-bottom: 15px;
                        ">
                            <i class="fas fa-trophy" style="color: white; font-size: 18px"></i>
                        </div>
                        <h4 style="color: white; margin: 0 0 10px 0">4. Цель игры</h4>
                        <p style="color: #ccc; margin: 0; line-height: 1.5">
                            Набрать ${GAME_CONFIG.targetScore} очков для победы!
                        </p>
                    </div>
                </div>
                
                <p style="
                    color: #FFD700;
                    margin: 25px 0 0 0;
                    font-weight: bold;
                    text-align: center;
                    font-size: 16px;
                    padding: 15px;
                    background: rgba(255, 215, 0, 0.1);
                    border-radius: 10px;
                    border: 1px solid rgba(255, 215, 0, 0.2);
                ">
                    💡 Совет: Старайся создавать несколько линий сразу - это даёт огромные бонусы! 💥
                </p>
            </div>
            
            <!-- Игровое поле -->
            <div id="gameField" style="position: relative; z-index: 1"></div>
            
            <!-- Фигуры -->
            <div style="margin-top: 30px; position: relative; z-index: 1">
                <h3 style="
                    color: white;
                    margin-bottom: 20px;
                    font-size: 24px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    justify-content: center;
                ">
                    <div style="
                        background: linear-gradient(145deg, #7B68EE, #6A5ACD);
                        width: 40px;
                        height: 40px;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <i class="fas fa-shapes" style="color: white; font-size: 20px"></i>
                    </div>
                    Твои фигуры:
                </h3>
                <div id="pieces"></div>
                <p style="
                    text-align: center;
                    color: #aaa;
                    font-size: 14px;
                    margin-top: 15px;
                    padding: 10px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                ">
                    <i class="fas fa-mouse-pointer" style="margin-right: 8px"></i>
                    Выбери фигуру, затем кликни на поле, чтобы разместить её
                </p>
            </div>
            
            <!-- Сообщение о победе -->
            <div id="winMessage" style="
                display: none;
                margin-top: 30px;
                position: relative;
                z-index: 1;
            "></div>
        </div>
    `;
    
    document.body.appendChild(gameModal);
    
    // Добавляем стили для анимаций
    const gameStyles = document.createElement('style');
    gameStyles.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from { transform: translateY(100px) scale(0.9); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }
        
        @keyframes pulseBorder {
            0%, 100% { border-color: rgba(255, 107, 139, 0.8); box-shadow: 0 0 20px rgba(255, 107, 139, 0.4); }
            50% { border-color: rgba(255, 107, 139, 1); box-shadow: 0 0 40px rgba(255, 107, 139, 0.8); }
        }
        
        @keyframes blockPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        @keyframes floatUp {
            0% { transform: translate(-50%, -50%); opacity: 1; }
            100% { transform: translate(-50%, -150%); opacity: 0; }
        }
        
        @keyframes messagePopIn {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
            20% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
            40% { transform: translate(-50%, -50%) scale(1); }
            80% { opacity: 1; }
            100% { opacity: 0; }
        }
        
        @keyframes trophyFloat {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-20px) rotate(5deg); }
            50% { transform: translateY(0) rotate(0deg); }
            75% { transform: translateY(-10px) rotate(-5deg); }
        }
    `;
    document.head.appendChild(gameStyles);
    
    // Инициализируем игру
    setTimeout(() => {
        initGame();
        console.log('✅ Игра инициализирована');
    }, 100);
};

// Функция для создания сердечек
function createHearts(count) {
    const container = document.getElementById('heartsContainer') || document.body;
    
    for (let i = 0; i < count; i++) {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.cssText = `
            position: fixed;
            left: ${Math.random() * 100}%;
            font-size: ${Math.random() * 25 + 20}px;
            color: ${['#FF6B8B', '#E91E63', '#FFB6C1'][Math.floor(Math.random() * 3)]};
            animation: floatHeart ${Math.random() * 20 + 10}s infinite linear;
            animation-delay: ${Math.random() * 5}s;
            z-index: 10001;
            pointer-events: none;
            opacity: 0.8;
            text-shadow: 0 0 10px currentColor;
        `;
        container.appendChild(heart);
        
        setTimeout(() => {
            if (heart.parentNode) {
                heart.remove();
            }
        }, 30000);
    }
}
function updateGamePieces() {
    // Если фигур стало меньше 3, добавляем новые
    if (pieces.length < 3) {
        const piecesToAdd = 3 - pieces.length;
        for (let i = 2; i < piecesToAdd; i++) {
            const piece = getRandomPiece();
            pieces.push(piece);
        }
        generatePieces(); // Перерисовываем все фигуры
    }
}

// ОБНОВЛЯЕМ ФУНКЦИЮ placePiece:
function placePiece(cellIndex) {
    console.log('📍 Размещение фигуры в ячейку:', cellIndex);
    
    if (selectedPieceIndex === null || !gameActive) {
        showGameMessage('Сначала выбери фигуру! Кликни на фигуру ниже.', 'warning');
        return;
    }
    
    if (selectedPieceIndex >= pieces.length) {
        console.error('❌ Выбранной фигуры больше нет!');
        showGameMessage('Эта фигура уже использована! Выбери другую.', 'error');
        selectedPieceIndex = null;
        return;
    }
    
    const piece = pieces[selectedPieceIndex];
    const x = cellIndex % GAME_CONFIG.fieldSize;
    const y = Math.floor(cellIndex / GAME_CONFIG.fieldSize);
    
    console.log('📐 Координаты:', {x, y}, 'Размер фигуры:', piece.width, 'x', piece.height);
    
    if (!canPlacePiece(piece, x, y)) {
        showGameMessage('Нельзя разместить здесь! Попробуй другое место.', 'error');
        return;
    }
    
    // Размещаем фигуру
    placePieceOnField(piece, x, y);
    movesCount++;
    
    // Начисляем очки
    const cellsCount = countCells(piece.shape);
    let points = cellsCount * GAME_CONFIG.basePoints;
    
    if (piece.isBig) {
        points = Math.floor(points * 1.8); // Увеличил множитель
        showFloatingText(`+${points} БОЛЬШАЯ!`, piece.color);
    } else {
        showFloatingText(`+${points}`, piece.color);
    }
    
    gameScore += points;
    
    // Обновляем интерфейс
    updateScore();
    updateField();
    updateMoves();
    
    // Удаляем использованную фигуру
    removePiece(selectedPieceIndex);
    
    // Сбрасываем выбор
    selectedPieceIndex = null;
    
    // Проверяем заполненные линии
    const linesCleared = checkLines();
    
    if (linesCleared > 0) {
        const bonus = linesCleared * GAME_CONFIG.lineBonus;
        // Дополнительный бонус за комбо
        if (linesCleared >= 2) {
            bonus = Math.floor(bonus * (1 + (linesCleared - 1) * 0.5));
        }
        showFloatingText(`КОМБО x${linesCleared}! +${bonus}`, '#FFD700');
        gameScore += bonus;
    }
    
    // Проверяем победу
    if (gameScore >= GAME_CONFIG.targetScore) {
        setTimeout(() => winGame(), 500);
    }
    
    // Генерируем новые фигуры, если нужно
    setTimeout(() => {
        updateGamePieces();
    }, 300);
    
    console.log('✅ Фигура размещена. Осталось фигур:', pieces.length);
}

// ОБНОВЛЯЕМ ФУНКЦИЮ checkLines:
function checkLines() {
    let linesCleared = 0;
    const linesToClear = [];
    const columnsToClear = [];
    
    // Проверяем строки
    for (let y = 0; y < GAME_CONFIG.fieldSize; y++) {
        let fullLine = true;
        for (let x = 0; x < GAME_CONFIG.fieldSize; x++) {
            if (gameField[y * GAME_CONFIG.fieldSize + x] === 0) {
                fullLine = false;
                break;
            }
        }
        
        if (fullLine) {
            linesToClear.push(y);
        }
    }
    
    // Проверяем столбцы
    for (let x = 0; x < GAME_CONFIG.fieldSize; x++) {
        let fullColumn = true;
        for (let y = 0; y < GAME_CONFIG.fieldSize; y++) {
            if (gameField[y * GAME_CONFIG.fieldSize + x] === 0) {
                fullColumn = false;
                break;
            }
        }
        
        if (fullColumn) {
            columnsToClear.push(x);
        }
    }
    
    // Очищаем линии
    linesToClear.forEach(y => {
        for (let x = 0; x < GAME_CONFIG.fieldSize; x++) {
            gameField[y * GAME_CONFIG.fieldSize + x] = 0;
        }
        linesCleared++;
    });
    
    columnsToClear.forEach(x => {
        for (let y = 0; y < GAME_CONFIG.fieldSize; y++) {
            gameField[y * GAME_CONFIG.fieldSize + x] = 0;
        }
        linesCleared++;
    });
    
    // Добавляем анимацию очистки
    if (linesCleared > 0) {
        animateLineClearing(linesToClear, columnsToClear);
    }
    
    return linesCleared;
}

function animateLineClearing(lines, columns) {
    const cells = document.querySelectorAll('.game-cell');
    
    // Анимация для строк
    lines.forEach(y => {
        for (let x = 0; x < GAME_CONFIG.fieldSize; x++) {
            const index = y * GAME_CONFIG.fieldSize + x;
            const cell = cells[index];
            if (cell) {
                cell.style.animation = 'cellExplode 0.5s';
                setTimeout(() => {
                    cell.style.animation = '';
                }, 500);
            }
        }
    });
    
    // Анимация для столбцов
    columns.forEach(x => {
        for (let y = 0; y < GAME_CONFIG.fieldSize; y++) {
            const index = y * GAME_CONFIG.fieldSize + x;
            const cell = cells[index];
            if (cell) {
                cell.style.animation = 'cellExplode 0.5s';
                setTimeout(() => {
                    cell.style.animation = '';
                }, 500);
            }
        }
    });
}

// ОБНОВЛЯЕМ ФУНКЦИЮ updateField:
function updateField() {
    const cells = document.querySelectorAll('.game-cell');
    cells.forEach((cell, index) => {
        if (gameField[index] !== 0) {
            const cellData = gameField[index];
            cell.style.background = `linear-gradient(145deg, ${cellData.color}, ${darkenColor(cellData.color, 30)})`;
            cell.style.boxShadow = `
                0 4px 12px rgba(0, 0, 0, 0.4),
                inset 0 -3px 0 rgba(0, 0, 0, 0.3),
                inset 0 3px 0 rgba(255, 255, 255, 0.1)
            `;
            cell.style.border = '2px solid rgba(255, 255, 255, 0.3)';
            cell.classList.add('filled');
        } else {
            cell.style.background = 'linear-gradient(145deg, rgba(52, 73, 94, 0.7), rgba(44, 62, 80, 0.9))';
            cell.style.boxShadow = 'inset 0 0 10px rgba(0, 0, 0, 0.3)';
            cell.style.border = '2px solid rgba(255, 255, 255, 0.15)';
            cell.classList.remove('filled');
        }
    });
}

// ОБНОВЛЯЕМ СТИЛИ В МОДАЛКЕ (добавляем новые анимации):
// В конце файла добавляем:
const gameStyles = document.createElement('style');
gameStyles.textContent = `
    @keyframes cellExplode {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.7; background: white; }
        100% { transform: scale(1); opacity: 1; }
    }
    
    @keyframes pieceAppear {
        from { opacity: 0; transform: scale(0.8) rotate(-10deg); }
        to { opacity: 1; transform: scale(1) rotate(0deg); }
    }
    
    .game-piece-container {
        animation: pieceAppear 0.3s ease-out;
    }
    
    .selected-piece {
        animation: pulse 0.8s infinite;
    }
    
    @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(255, 107, 139, 0.7); }
        70% { box-shadow: 0 0 0 15px rgba(255, 107, 139, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 107, 139, 0); }
    }
`;
document.head.appendChild(gameStyles);

// Убедимся, что функция доступна глобально
window.initGame = initGame;
window.selectPiece = selectPiece;
window.placePiece = placePiece;
window.resetGame = resetGame;
window.closeGame = closeGame;
// ===== ИСПРАВЛЕНИЯ ДЛЯ ИНТЕГРАЦИИ =====

// Создаем глобальную функцию openGame, которую вызывает site.html
window.openGame = function() {
    console.log('🎮 Открытие игры через openGame()');
    window.showGameModal();
};

// Убедимся, что функция для мини-игры доступна
window.startMiniGame = function() {
    console.log('🚀 Запуск мини-игры');
    if (typeof initGame === 'function') {
        initGame();
    } else {
        console.error('❌ Функция initGame не найдена');
        showGameMessage('Игра не может быть запущена. Пожалуйста, обновите страницу.', 'error');
    }
};

// Функция для подсчета клеток в фигуре
function countCells(shape) {
    if (!shape || !Array.isArray(shape)) return 0;
    return shape.flat().filter(cell => cell === 1).length;
}

// Функция для проверки возможности размещения фигуры
function canPlacePiece(piece, startX, startY) {
    if (!piece || !piece.shape) return false;
    
    for (let y = 0; y < piece.height; y++) {
        for (let x = 0; x < piece.width; x++) {
            if (piece.shape[y][x] === 1) {
                const fieldX = startX + x;
                const fieldY = startY + y;
                
                if (fieldX >= GAME_CONFIG.fieldSize || 
                    fieldY >= GAME_CONFIG.fieldSize || 
                    fieldX < 0 || 
                    fieldY < 0) {
                    return false;
                }
                
                if (gameField[fieldY * GAME_CONFIG.fieldSize + fieldX] !== 0) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Функция для размещения фигуры на поле
function placePieceOnField(piece, startX, startY) {
    if (!piece || !piece.shape) return;
    
    for (let y = 0; y < piece.height; y++) {
        for (let x = 0; x < piece.width; x++) {
            if (piece.shape[y][x] === 1) {
                const fieldX = startX + x;
                const fieldY = startY + y;
                const index = fieldY * GAME_CONFIG.fieldSize + fieldX;
                
                if (index >= 0 && index < gameField.length) {
                    gameField[index] = {
                        color: piece.color,
                        pieceIndex: selectedPieceIndex
                    };
                }
            }
        }
    }
}

console.log('✅ Все функции игры готовы к использованию');

console.log('✅ game.js загружен, игра готова к запуску');
<template>
  <main class="hat">
    <!-- ШАПКА -->
           <button class="ghost-btn hat__rules-btn" @click="isRulesOpen = true">
        ?
      </button>
    <header class="hat__header">

      <h1 class="hat__title">Игра «Шляпа»</h1>
  
  
    </header>
  
    <!-- ОСНОВНОЙ ЭКРАН ИГРЫ -->
    <section class="layout">
      <!-- ЛЕВО — КОМАНДЫ (пример статической верстки) -->
      <div class="card teams">
        <div class="team-block team-block--active">
          <div class="team">
            <span class="team__name">Команда 1</span>
            <span class="team__score">12</span>
          </div>
          <ul class="members">
            <li class="member member--active">
              <span class="member__name">Игрок 1</span>
              <span class="member__score">5</span>
            </li>
            <li class="member">
              <span class="member__name">Игрок 2</span>
              <span class="member__score">4</span>
            </li>
            <li class="member">
              <span class="member__name">Игрок 3</span>
              <span class="member__score">3</span>
            </li>
          </ul>
        </div>
  
        <div class="team-block">
          <div class="team">
            <span class="team__name">Команда 2</span>
            <span class="team__score">9</span>
          </div>
          <ul class="members">
            <li class="member">
              <span class="member__name">Игрок 1</span>
              <span class="member__score">5</span>
            </li>
            <li class="member">
              <span class="member__name">Игрок 2</span>
              <span class="member__score">4</span>
            </li>
          </ul>
        </div>
        <div class="team-block">
          <div class="team">
            <span class="team__name">Команда 3</span>
            <span class="team__score">9</span>
          </div>
          <ul class="members">
            <li class="member">
              <span class="member__name">Игрок 1</span>
              <span class="member__score">5</span>
            </li>
            <li class="member">
              <span class="member__name">Игрок 2</span>
              <span class="member__score">4</span>
            </li>
            <li class="member">
              <span class="member__name">Игрок 3</span>
              <span class="member__score">4</span>
            </li>
          </ul>
        </div>
      </div>
  
      <!-- ПРАВО — ИГРОВОЕ ПОЛЕ -->
      <div class="card game">
        <h2 class="card__title">Текущее слово</h2>
        <p class="game__subtitle">
          Объясни слово своей команде за ограниченное время. За каждое
          угаданное слово команда получает очко.
        </p>
        <div class="timer">01:00</div>
        <div class="word">
          слово
        </div>
  
        <div class="game__actions">
          <button class="btn">
            Следующее слово
          </button>
        </div>
      </div>
    </section>
  
    <!-- КНОПКА В МЕНЮ СЛЕВА СНИЗУ -->
    <div class="hat__bottom">
      <router-link to="/" class="hat__back-bottom">
        ← В меню
      </router-link>
    </div>
  
    <!-- МОДАЛКА С ПРАВИЛАМИ -->
    <transition name="fade">
      <div v-if="isRulesOpen" class="modal-overlay" @click.self="isRulesOpen = false">
        <div class="modal card">
          <button class="modal__close" @click="isRulesOpen = false">✕</button>
          <h2 class="card__title">Правила игры «Шляпа»</h2>
  
          <p class="modal__text">
            Цель игры — за одну минуту объяснить как можно больше слов своей
            команде. За каждое угаданное слово команда получает очко.
          </p>
  
          <h3 class="modal__subtitle">Объясняющий НЕ может:</h3>
          <ul class="modal__list">
            <li>говорить однокоренные слова;</li>
            <li>давать созвучные подсказки и почти одинаковые по звучанию слова;</li>
            <li>переводить слово на другой язык;</li>
            <li>
              подсказывать через буквы, слоги, количество букв и похожие
              «технические» подсказки.
            </li>
          </ul>
  
          <h3 class="modal__subtitle">Объясняющий МОЖЕТ:</h3>
          <ul class="modal__list">
            <li>объяснять смыслом, примерами, ассоциациями;</li>
            <li>использовать синонимы и антонимы;</li>
            <li>описывать предмет, действие, ситуацию, контекст.</li>
          </ul>
  
          <h3 class="modal__subtitle">Очки:</h3>
          <ul class="modal__list">
            <li>+1 — слово угадано;</li>
            <li>−1 — пропуск слова или нарушение правила;</li>
            <li>0 — слово названо в неправильной форме.</li>
          </ul>
        </div>
      </div>
    </transition>
  </main>
</template>

<script setup>
import { ref } from 'vue'

const isRulesOpen = ref(false)
</script>

<style scoped>
:root {
  --bg-main: #020617;
  --bg-gradient-1: #1f2937;
  --bg-gradient-2: #020617;

  --card-bg: rgba(15, 23, 42, 0.96);
  --card-border: rgba(148, 163, 184, 0.3);

  --text-main: #e5e7eb;
  --text-accent: #f9fafb;
  --text-muted: #9ca3af;

  --accent-1: #22d3ee;
  --accent-2: #a855f7;
  --accent-green: #4ade80;

  --shadow-card: 0 20px 40px rgba(0, 0, 0, 0.65);
  --transition-fast: 0.18s ease-out;
}

* {
  box-sizing: border-box;
  font-family: "Nunito", system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
}

/* Фон и базовый контейнер */
.hat {
  color: var(--text-main);
  background:
    radial-gradient(circle at 0% 0%, #1f2937 0, transparent 40%),
    radial-gradient(circle at 100% 0%, #0f172a 0, transparent 40%),
    radial-gradient(circle at 50% 100%, #111827 0, transparent 40%),
    linear-gradient(135deg, var(--bg-gradient-1), var(--bg-gradient-2));
  min-height: 100vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 24px 40px;
}

/* Шапка */
.hat__header {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 25px;

  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* Название игры по центру и крупное */
.hat__title {
  color: var(--text-accent);
  font-size: 40px;
  text-align: center;
  white-space: nowrap;
  text-shadow: 0 0 24px rgba(34, 211, 238, 0.8);
}

/* Кнопка с правилами справа */
.hat__controls {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Таймер (если понадобится) */
.timer {
  font-size: 42px;
  font-weight: 700;
  text-shadow: 0 0 20px rgba(168, 85, 247, 0.75);
}

/* Кнопки-шильдики */
.ghost-btn {
  background: transparent;
  color: var(--accent-1);
  border-radius: 999px;
  border: 1px solid rgba(34, 211, 238, 0.6);
  padding: 6px 16px;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast),
    color var(--transition-fast);
}

.ghost-btn:hover {
  background: radial-gradient(circle at 0 0,
      rgba(34, 211, 238, 0.3),
      transparent 55%);
  border-color: rgba(168, 85, 247, 0.9);
  color: var(--text-accent);
  box-shadow: 0 0 16px rgba(34, 211, 238, 0.7);
  transform: translateY(-1px);
}

/* Layout для игрового экрана */
.layout {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;

  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 24px;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

/* Карточки */
.card {
  background:
    radial-gradient(circle at top left,
      rgba(34, 211, 238, 0.18),
      transparent 60%),
    radial-gradient(circle at bottom right,
      rgba(168, 85, 247, 0.25),
      transparent 60%),
    var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--shadow-card);
  backdrop-filter: blur(12px);
}

.card__title {
  color: var(--text-accent);
  font-size: 18px;
  margin-bottom: 10px;
}

/* Команды */
.teams {
  display: flex;
  flex-direction: column;
  gap: 14px;

  max-height: 372px;
  overflow: hidden;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 6px;

}

.teams::-webkit-scrollbar {
  width: 0;
}


.team-block {
  padding: 10px 10px 8px;
  border-radius: 14px;
  background-color: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.3);
  transition: box-shadow var(--transition-fast),
    border-color var(--transition-fast),
    background-color var(--transition-fast),
    transform var(--transition-fast);
}

.team-block--active {
  border-color: rgba(34, 211, 238, 0.8);
  box-shadow: 0 0 18px rgba(34, 211, 238, 0.7);
  transform: translateY(-1px);
}

.team {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.team__name {
  font-weight: 600;
}

.team__score {
  color: var(--accent-green);
  font-weight: 700;
}

/* Участники */
.members {
  list-style: none;
  margin: 6px 0 0;
  padding-left: 10px;
  border-left: 2px solid rgba(148, 163, 184, 0.25);
}

.member {
  display: flex;
  justify-content: space-between;
  color: var(--text-muted);
  font-size: 14px;
  margin: 2px 0;
}

.member--active .member__name {
  color: var(--accent-1);
  text-shadow: 0 0 8px rgba(34, 211, 238, 0.7);
}

.member__score {
  color: var(--accent-green);
  font-weight: 600;
  margin-left: 8px;
}

/* Игровая часть */
.game {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.game__subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 16px;
  text-align: center;
}

.word {
  margin: 24px auto 28px;
  text-align: center;
  font-size: 32px;
  padding: 20px 32px;
  color: var(--accent-1);
  text-shadow: 0 0 8px rgba(34, 211, 238, 0.7);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.8);
}

.game__actions {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

/* Кнопка "Следующее слово" */
.btn {
  display: inline-block;
  padding: 12px 20px;

  background: transparent;
  border: 1px solid var(--accent-1);
  color: var(--accent-1);

  border-radius: 999px;
  font-size: 16px;
  font-weight: 600;

  cursor: pointer;
  transition: background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast),
    color var(--transition-fast),
    opacity var(--transition-fast);
}

.btn:hover {
  background: linear-gradient(90deg, var(--accent-1), var(--accent-2));
  color: #020617;
  box-shadow: 0 0 20px var(--accent-1);
  transform: translateY(-1px);
}

/* НИЖНЯЯ ПАНЕЛЬ С КНОПКОЙ "В МЕНЮ" */
.hat__bottom {
  width: 100%;
  max-width: 1200px;
  margin: 24px auto 0;
  display: flex;
  justify-content: flex-start;
}

.hat__back-bottom {
  background: transparent;
  color: var(--accent-1);
  border-radius: 999px;
  border: 1px solid rgba(34, 211, 238, 0.7);
  padding: 10px 26px;
  font-size: 16px;
  text-decoration: none;
  transition: background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast),
    color var(--transition-fast);
}

.hat__back-bottom:hover {
  background: linear-gradient(90deg, var(--accent-1), var(--accent-2));
  color: #020617;
  box-shadow: 0 0 18px var(--accent-1);
  transform: translateY(-1px);
}

/* Модалка */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 40;
}

.modal {
  max-width: 640px;
  width: calc(100% - 40px);
  position: relative;
}

.modal__close {
  position: absolute;
  top: 10px;
  right: 12px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
  transition: color var(--transition-fast), transform var(--transition-fast);
}

.modal__close:hover {
  color: var(--accent-1);
  transform: scale(1.1);
}

.modal__text {
  font-size: 14px;
  color: var(--text-main);
  margin: 8px 0 12px;
}

.modal__subtitle {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-accent);
  margin-top: 10px;
}

.modal__list {
  margin: 4px 0 8px 18px;
  font-size: 14px;
  color: var(--text-main);
}

/* Анимация модалки */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}



@media (max-width: 901px) {
  .layout {
    display: flex;
    flex-direction: column-reverse;
  }

  .teams {
    max-height: 300px;
  }
}
</style>

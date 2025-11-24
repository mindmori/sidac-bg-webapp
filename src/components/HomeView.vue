<template>
  <main>
    <header>
      <h1>Sometimes I dream about cheese</h1>
    </header>
  
    <div class="container">
      <div class="cards">
  
        <!-- 1) Шляпа -->
        <div class="cards__item card">
          <div class="card__header">
            <div class="card__header-name">
              <h2 class="card__title">Шляпа</h2>
              <button class="card__rule" @click="toggleSection('hat', 'rules')">
                Как играть
              </button>
            </div>
            <div class="card__nav">
              <button class="card__rooms" @click="toggleSection('hat', 'rooms')">
                Комнаты
              </button>
              <router-link to="/hat" class="card__create">
                <span class="card__icon">→</span>
              </router-link>
            </div>
          </div>
  
          <!-- Комнаты Шляпа -->
          <div class="card__rooms card-room-hat"
            v-show="openedSection.game === 'hat' && openedSection.section === 'rooms'">
            <hr>
            <div class="card__room_name">
              <p>Комната</p>
              <a href="#">1324535</a>
            </div>
            <div class="card__room_name">
              <p>Комната</p>
              <a href="#">1324535</a>
            </div>
            <div class="card__room_name">
              <p>Комната</p>
              <a href="#">1324535</a>
            </div>
            <div class="card__room_name">
              <p>Комната</p>
              <a href="#">1324535</a>
            </div>
          </div>
  
          <!-- Правила Шляпа -->
          <div class="card__body hat__body" v-show="openedSection.game === 'hat' && openedSection.section === 'rules'">
            <div class="rule__text">
              <hr>
              <div class="modal card">
                <h2 class="card__title">Правила игры «Шляпа»</h2>
  
                <!-- 1) НЕ ГОВОРИ ОДНОКОРЕННЫЕ -->
                <div class="rule-block">
                  <h3 class="rule-title">
                    1. Не говори однокоренные (никогда)
                  </h3>
  
                  <button class="example-toggle" @click="openExample(1)">
                    Примеры
                  </button>
  
                  <div class="examples" v-show="exampleOpened === 1">
                    <p>Педали крутишь на нём → велосипед</p>
                    <p>Есть эритроцит, а есть… → тромбоцит</p>
                    <p>Ти-рекс, но по-другому → тиранозавр</p>
                    <p>МГУ → университет</p>
                  </div>
                </div>
  
                <!-- 2) НЕ ГОВОРИ СОЗВУЧНЫЕ -->
                <div class="rule-block">
                  <h3 class="rule-title">
                    2. Не говори созвучные
                  </h3>
  
                  <button class="example-toggle" @click="openExample(2)">
                    Примеры
                  </button>
  
                  <div class="examples" v-show="exampleOpened === 2">
                    <p>Катка, только по-другому → кадка (созвучие)</p>
                    <p>Умнец наоборот → глупец (выдуманное слово)</p>
                    <p>Против лома нет… → приём (рифма)</p>
                    <p>Есть пила, а есть… → липа (анаграмма)</p>
                    <p>Конь… як (часть слова «коньяк»)</p>
                    <p>Контр- что?… страйк (часть фразы «контр-страйк»)</p>
                  </div>
                </div>
  
                <!-- 3) НЕ ГОВОРИ ПЕРЕВОДЫ -->
                <div class="rule-block">
                  <h3 class="rule-title">
                    3. Не говори переводы
                  </h3>
  
                  <button class="example-toggle" @click="openExample(3)">
                    Примеры
                  </button>
  
                  <div class="examples" v-show="exampleOpened === 3">
                    <p>Хенд по-русски → рука</p>
                    <p>Солнце по-английски → сан</p>
                  </div>
                </div>
  
                <!-- 4) НЕ ГОВОРИ ПРО БУКВЫ/СЛОГИ -->
                <div class="rule-block">
                  <h3 class="rule-title">
                    4. Не говори про буквы и слоги
                  </h3>
  
                  <button class="example-toggle" @click="openExample(4)">
                    Примеры
                  </button>
  
                  <div class="examples" v-show="exampleOpened === 4">
                    <p>Поменяй первую букву, второй слог</p>
                    <p>Слово из двух слогов, пяти букв</p>
                    <p>Личное местоимение → «Я»</p>
                    <p>Соединительная гласная → «И»</p>
                  </div>
                </div>
  
                <!-- РЕКОМЕНДАЦИИ ПО ОЧКАМ -->
                <div class="rule-block">
                  <h3 class="rule-title">
                    Рекомендуемые правила подсчёта очков
                  </h3>
  
                  <button class="example-toggle" @click="openExample(5)">
                    Показать
                  </button>
  
                  <div class="examples" v-show="exampleOpened === 5">
                    <p>+1 очко за каждое угаданное слово</p>
                    <p>Пропуск слова → -1 очко</p>
                    <p>Нарушение = пропуск</p>
                    <p>Слово в неверной форме = 0 очков</p>
                    <p>Если выкрикивает не игрок команды — очко получает активная команда</p>
                    <p>Очки раунда выставляются вручную</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- 2) Кодовые слова -->
        <div class="cards__item card">
          <div class="card__header">
            <div class="card__header-name">
              <h2 class="card__title">Кодовые слова</h2>
              <button class="card__rule" @click="toggleSection('code', 'rules')">
                Как играть
              </button>
            </div>
            <div class="card__nav">
              <button class="card__rooms" @click="toggleSection('code', 'rooms')">
                Комнаты
              </button>
              <router-link to="/codegames" class="card__create">
                <span class="card__icon">→</span>
              </router-link>
            </div>
          </div>
  
          <!-- Комнаты Кодовые слова -->
          <div class="card__rooms card-room-code"
            v-show="openedSection.game === 'code' && openedSection.section === 'rooms'">
            <hr>
            <div class="card__room_name">
              <p>Комната</p>
              <a href="#">1324535</a>
            </div>
            <div class="card__room_name">
              <p>Комната</p>
              <a href="#">1324535</a>
            </div>
            <div class="card__room_name">
              <p>Комната</p>
              <a href="#">1324535</a>
            </div>
            <div class="card__room_name">
              <p>Комната</p>
              <a href="#">1324535</a>
            </div>
          </div>
  
          <!-- Правила Кодовые слова -->
          <div class="card__body code__body" v-show="openedSection.game === 'code' && openedSection.section === 'rules'">
            <div class="rule__text">
              <hr>
              <p class="card__text">
                Кодовые слова — это увлекательная командная игра на ассоциации и логику. Игроки делятся на две команды —
                красную и синюю.
                Каждая команда выбирает капитана, который знает расположение всех своих «агентов» на поле. На столе лежат
                карточки со словами,
                и капитан должен давать своей команде подсказки: одно слово и число, показывающее, сколько карточек
                связано с этой подсказкой.
  
                Задача игроков — по подсказке капитана отгадать все слова своей команды, избегая карточек соперников,
                нейтральных слов и
                особенно «убийцы» — если его откроют, команда сразу проигрывает.
  
                Чтобы победить, нужно проявить сообразительность, стратегию и чувство ассоциаций. Побеждает та команда,
                которая первой
                угадает все свои слова-агенты.
              </p>
            </div>
          </div>
        </div>
  
        <!-- 3) Третья игра -->
        <div class="cards__item card">
          <div class="card__header">
            <div class="card__header-name">
              <h2 class="card__title">Третья игра</h2>
              <button class="card__rule" @click="toggleSection('third', 'rules')">
                Как играть
              </button>
            </div>
            <div class="card__nav">
              <button class="card__rooms" @click="toggleSection('third', 'rooms')">
                Комнаты
              </button>
              <router-link to="/third" class="card__create">
                <span class="card__icon">→</span>
              </router-link>
            </div>
          </div>
  
          <!-- Комнаты Третья игра -->
          <div class="card__rooms card-room-our"
            v-show="openedSection.game === 'third' && openedSection.section === 'rooms'">
            <hr>
            <div class="card__room_name">
              <p>Комната</p>
              <a href="#">1324535</a>
            </div>
            <div class="card__room_name">
              <p>Комната</p>
              <a href="#">1324535</a>
            </div>
            <div class="card__room_name">
              <p>Комната</p>
              <a href="#">1324535</a>
            </div>
            <div class="card__room_name">
              <p>Комната</p>
              <a href="#">1324535</a>
            </div>
          </div>
  
          <!-- Правила Третья игра -->
          <div class="card__body" v-show="openedSection.game === 'third' && openedSection.section === 'rules'">
            <div class="rule__text">
              <hr>
              <p class="card__text our__body">
                Шляпа — это весёлая командная игра, в которой участники объясняют слова своей команде за
                ограниченное время. Все игроки пишут по несколько слов и складывают их в «шляпу». Затем
                команды по очереди пытаются объяснить и угадать эти слова. Игра проходит в три раунда:
                сначала нужно объяснять слово любыми словами, кроме однокоренных, потом разрешается произнести
                только одно слово, а в последнем раунде можно показывать слово жестами, не говоря ничего. За
                каждое угаданное слово команда получает очки. После трёх раундов побеждает команда, набравшая
                больше всего очков.
              </p>
            </div>
          </div>
        </div>
  
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'

// Какая секция сейчас открыта: игра + тип ("rules" или "rooms")
const openedSection = ref({
  game: null,     // 'hat' | 'code' | 'third' | null
  section: null,  // 'rules' | 'rooms' | null
})

function toggleSection(game, section) {
  const isSame =
    openedSection.value.game === game &&
    openedSection.value.section === section

  if (isSame) {
    // Нажали по уже открытому — закрываем
    openedSection.value = { game: null, section: null }
  } else {
    // Открываем новую секцию (все остальные автоматически "закрыты")
    openedSection.value = { game, section }
  }
}

// какая группа примеров сейчас открыта (1–5), либо null
const exampleOpened = ref(null)

function openExample(id) {
  exampleOpened.value = exampleOpened.value === id ? null : id
}
</script>

<style scoped>
/* Контейнер с карточками */
.container {
  display: flex;
  justify-content: center;
  margin: 0 auto;
}

/* Колонка с карточками */
.cards {
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
}

/* Карточка игры */
.cards__item {
  background: radial-gradient(circle at top left,
      rgba(34, 211, 238, 0.14),
      transparent 55%),
    radial-gradient(circle at bottom right,
      rgba(168, 85, 247, 0.18),
      transparent 60%),
    var(--card-bg);
  padding: 22px 26px;
  border-radius: var(--radius-card);
  border: 1px solid var(--card-border);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(14px);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal);
}

/* Ховер карточки — лёгкий подъём и усиление «неона» */
.cards__item:hover {
  transform: translateY(-4px);
  box-shadow: 0 26px 65px rgba(15, 23, 42, 0.95);
  border-color: rgba(34, 211, 238, 0.75);
}

/* Шапка карточки */
.card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.card__header-name {
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: space-between;
}

.card__title {
  font-size: 22px;
  color: var(--text-accent);
}

/* Навигация в карточке (кнопки справа) */
.card__nav {
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-end;
  height: 100%;
}

/* Текст */
.card__text {
  text-align: justify;
  color: var(--text-main);
  line-height: 1.5;
  font-size: 15px;
}

/* =========================
   КНОПКИ и ССЫЛКИ
   ========================= */

button {
  color: var(--accent-1);
  border: 1px solid rgba(34, 211, 238, 0.5);
  background: transparent;
  font-size: 14px;
  padding: 6px 14px;
  border-radius: 999px;
  text-align: center;
  cursor: pointer;
  transition: background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast),
    color var(--transition-fast);
}

.card__rule {
  width: 120px;
}

button:hover {
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.18), rgba(168, 85, 247, 0.35));
  border-color: rgba(168, 85, 247, 0.85);
  color: var(--text-accent);
  box-shadow: 0 0 18px rgba(34, 211, 238, 0.7);
  transform: translateY(-1px);
}

/* Ссылка-кнопка перехода (стрелка) */
.card__create {
  color: var(--accent-2);
  text-decoration: none;
  font-size: 16px;
  border-radius: 999px;
  border: 1px solid rgba(168, 85, 247, 0.6);
  padding: 6px 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.card__icon {
  transform: translateX(0);
  transition: transform var(--transition-fast);
}

.card__create:hover {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.5), rgba(34, 211, 238, 0.7));
  color: #0b1120;
  border-color: transparent;
  box-shadow: 0 0 16px rgba(88, 85, 247, 0.5);
  border-color: rgba(168, 85, 247, 0.85);
}


/* =========================
   КОМНАТЫ
   ========================= */

.card__rooms,
.card__rule {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
  bottom: 0px;
}


.card__room_name {
  display: flex;
  gap: 10px;
  align-items: baseline;
  font-size: 14px;
}

.card__room_name p {
  color: var(--text-muted);
}

.card__room_name a {
  color: var(--accent-1);
  text-decoration: none;
  position: relative;
  font-weight: 600;
}

.card__room_name a::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--accent-1), var(--accent-2));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-fast);
}

.card__room_name a:hover::after {
  transform: scaleX(1);
}

/* =========================
   ПРАВИЛА И ТЕКСТ
   ========================= */

.rule__text {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;
}

/* Линия-разделитель с градиентом */
hr {
  border: none;
  height: 1px;
  width: 100%;
  background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.6), transparent);
  box-shadow: 0 0 12px rgba(15, 23, 42, 0.9);
}

/* =========================
   АДАПТИВ
   ========================= */

@media (max-width: 357px) {
  .card__header {
    flex-direction: column;
    align-items: start;
    gap: 10px;
  }

  .card__header-name {
    width: 100%;
  }

  .card__nav {
    flex-direction: column;
    gap: 10px;
    align-items: start;
    width: 100%;
  }

  .card__rooms,
  .card__rule {
    margin-top: 0;
    width: 100%;
  }

  .card__create {
    width: 100%;
  }

  .card__header {
    align-items: center;
  }

  .card__header-name {
    align-items: center;
  }

  header h1 {
    margin: 0;
  }
}


/*для шляпы*/

/* .rule-block {
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
} */

.rule-title {
  font-size: 16px;
  color: var(--text-accent);
  margin-top: 15px;
  font-weight: 200;
}

.example-toggle {
  background: transparent;
  border: none;
  padding: 0;
  margin: 0px 0 10px;
  color: var(--accent-1);
  font-size: 15px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;

  transition: color 0.2s ease, text-shadow 0.2s ease;
}

.example-toggle:hover {
  background: none;
  box-shadow: none;
}

.examples {
  padding-left: 10px;
  border-left: 2px solid rgba(168, 85, 247, 0.35);
  animation: fadeExamples 0.25s ease;
}

.examples p {
  margin: 4px 0;
  opacity: 0.85;
  font-size: 14px;
  color: var(--text-main);
}

@keyframes fadeExamples {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
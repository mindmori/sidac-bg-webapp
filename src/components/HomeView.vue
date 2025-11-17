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
          <div
            class="card__rooms card-room-hat"
            v-show="openedSection.game === 'hat' && openedSection.section === 'rooms'"
          >
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
          <div
            class="card__body hat__body"
            v-show="openedSection.game === 'hat' && openedSection.section === 'rules'"
          >
          <div class="rule__text">
            <hr>
            <p class="card__text">
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
          <div
            class="card__rooms card-room-code"
            v-show="openedSection.game === 'code' && openedSection.section === 'rooms'"
          >
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
          <div
            class="card__body code__body"
            v-show="openedSection.game === 'code' && openedSection.section === 'rules'"
          >
          <div class="rule__text">
            <hr>
                <p class="card__text">
                Кодовые слова — это увлекательная командная игра на ассоциации и логику. Игроки делятся на две команды — красную и синюю. 
                Каждая команда выбирает капитана, который знает расположение всех своих «агентов» на поле. На столе лежат карточки со словами, 
                и капитан должен давать своей команде подсказки: одно слово и число, показывающее, сколько карточек связано с этой подсказкой.

                Задача игроков — по подсказке капитана отгадать все слова своей команды, избегая карточек соперников, нейтральных слов и 
                особенно «убийцы» — если его откроют, команда сразу проигрывает.

                Чтобы победить, нужно проявить сообразительность, стратегию и чувство ассоциаций. Побеждает та команда, которая первой 
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
          <div
            class="card__rooms card-room-our"
            v-show="openedSection.game === 'third' && openedSection.section === 'rooms'"
          >
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
          <div
            class="card__body"
            v-show="openedSection.game === 'third' && openedSection.section === 'rules'"
          >
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
</script>

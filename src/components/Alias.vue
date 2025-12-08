<script setup lang="ts">
import { ref, onMounted } from "vue";
import { db } from "../firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  Timestamp
} from "firebase/firestore";

// Слова для игры Alias
const aliasWordList = [
  // Животные
  "слон", "тигр", "жираф", "крокодил", "обезьяна", "попугай", "дельфин", "медведь", "волк", "лиса",
  "заяц", "белка", "ёж", "верблюд", "панда", "коала", "кенгуру", "пингвин", "лебедь", "орёл",

  // Профессии
  "врач", "учитель", "повар", "инженер", "программист", "художник", "музыкант", "актёр", "спортсмен", "полицейский",
  "пожарный", "строитель", "водитель", "пилот", "учёный", "журналист", "фотограф", "дизайнер", "бухгалтер", "юрист",

  // Еда и напитки
  "пицца", "суп", "салат", "бутерброд", "мороженое", "торт", "шоколад", "кофе", "чай", "сок",
  "яблоко", "банан", "апельсин", "помидор", "огурец", "картофель", "морковь", "лук", "сыр", "хлеб",

  // Предметы быта
  "стул", "стол", "кровать", "шкаф", "зеркало", "часы", "лампа", "телефон", "компьютер", "телевизор",
  "холодильник", "микроволновка", "утюг", "пылесос", "зонт", "сумка", "кошелёк", "ключ", "очки", "расчёска",

  // Природа
  "гора", "река", "озеро", "море", "океан", "лес", "поле", "пустыня", "водопад", "вулкан",
  "радуга", "солнце", "луна", "звезда", "облако", "дождь", "снег", "ветер", "гроза", "туман",

  // Город и транспорт
  "улица", "площадь", "парк", "мост", "фонтан", "магазин", "ресторан", "кинотеатр", "библиотека", "музей",
  "автомобиль", "автобус", "поезд", "самолёт", "велосипед", "корабль", "метро", "такси", "трамвай", "вертолёт",

  // Спорт
  "футбол", "баскетбол", "теннис", "хоккей", "плавание", "бег", "прыжки", "гимнастика", "бокс", "лыжи",
  "коньки", "скакалка", "мяч", "ракетка", "штанга", "форма", "стадион", "медаль", "кубок", "чемпион",

  // Эмоции и состояния
  "радость", "грусть", "злость", "удивление", "страх", "любовь", "счастье", "волнение", "спокойствие", "усталость",
  "голод", "жажда", "боль", "здоровье", "болезнь", "сон", "мечта", "надежда", "разочарование", "восторг",

  // Наука и образование
  "книга", "тетрадь", "ручка", "карандаш", "учебник", "школа", "университет", "лекция", "экзамен", "диплом",
  "математика", "физика", "химия", "биология", "история", "география", "литература", "язык", "исследование", "эксперимент",

  // Разное
  "праздник", "день рождения", "свадьба", "новый год", "рождество", "путешествие", "отпуск", "каникулы", "вечеринка", "концерт"
] as const;

const roomId = "main"; //TODO: get from adress instead
const roundDuration = 20;
const winRequirement = 20;
const roundTimer = ref(0);

const playerUid = ref(""); //TODO: assign automatically
const currentTeamIndex = ref(-1); //-1 means no team
let wordHistory = new Array<string>();

let isRoundOver = false;

//firebase refs and paths
const roomRef = doc(db, "room", roomId);

const teamsPath = "gameState.teams";
const currentWordPath = "gameState.currentWord";
const roundStartTimePath = "gameState.roundStartTime";
const masterPlayerPath = "gameState.masterPlayer";

interface Team {
  players: string[];
  score: number;
}

//sync with server
const roundStartTime = ref(Timestamp.fromMillis(0));
const currentWord = ref("");
const teams = ref(new Array<Team>());

const masterPlayer = ref<string>();
const masterPlayerIndex = ref(0);
const masterTeamIndex = ref(0);

// указываем путь к документу
onMounted(() => {
  setInterval(updateRoundTimer, 100);
  // слушаем изменения в Firestore
  onSnapshot(roomRef, (snap) => {
    if (snap.exists()) {
      roundStartTime.value = snap.data().gameState.roundStartTime;
      teams.value = snap.data().gameState.teams;
      masterPlayer.value = snap.data().gameState.masterPlayer;

      const serverCurrentWord = snap.data().gameState.currentWord;

      if (currentWord.value !== serverCurrentWord) {
        wordHistory.push(currentWord.value);
      }

      currentWord.value = serverCurrentWord;

      if (!teams.value) {
        teams.value = new Array<Team>();
      }

      updateMPIndex();
    }
  });
});
const isRulesOpen = ref(false)
const startRound = async () => {
  wordHistory = new Array<string>();
  if (isRoundInProgress() || !amIMaster())
    return;

  roundStartTime.value = Timestamp.fromDate(new Date());
  skipWord();

  await updateDoc(roomRef,
    {
      [roundStartTimePath]: roundStartTime.value,
    });
};

const getRandomWord = () => {
  const randomIndex = Math.floor(Math.random() * aliasWordList.length);
  if (!aliasWordList[randomIndex])
    return "word error"
  return aliasWordList[randomIndex];
}

const roundTimeDiff = () => {
  if (!roundStartTime.value)
    return roundDuration;
  const startDate = roundStartTime.value.toDate();
  const currentTime = new Date();
  return (currentTime.getTime() - startDate.getTime()) / 1000; //seconds
}

const updateRoundTimer = () => {
  roundTimer.value = roundDuration - Math.floor(roundTimeDiff());
  if (isRoundOver && isRoundInProgress()) {
    isRoundOver = false;
    wordHistory = new Array<string>();
  }
  if (isRoundInProgress())
    return;
  if (!isRoundOver) {
    isRoundOver = true;
    if (!amIMaster())
      return;
    decideOnNextMasterPlayer();
  }
}

const formatTime = (seconds: number) => {
  if (seconds <= 0) return "00:00";

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const isRoundInProgress = () => {
  if (roundTimeDiff() < roundDuration) {
    return true;
  }
  return false;
}

//TEAMS
const createTeam = async () => {
  if (!teams.value) {
    teams.value = new Array<Team>();
  }

  teams.value.push(
    {
      players: new Array<string>(),
      score: 0
    }
  );
  await leaveTeam();
  await joinTeam(teams.value.length - 1);
}

const joinTeam = async (index: number) => {
  if (index == currentTeamIndex.value)
    return;
  if (!teams.value)
    return;
  if (!teams.value[index])
    return;
  if (currentTeamIndex.value != -1)
    await leaveTeam();

  teams.value[index].players.push(playerUid.value);
  currentTeamIndex.value = index;

  await updateDoc(roomRef,
    {
      [teamsPath]: teams.value,
    });
}
const leaveTeam = async () => {
  if (currentTeamIndex.value == -1)
    return;
  if (!teams.value)
    return;
  if (!teams.value[currentTeamIndex.value])
    return;

  const playersArray = teams.value[currentTeamIndex.value]?.players;
  if (!playersArray)
    return;
  if (!playersArray.includes(playerUid.value))
    return;

  teams.value[currentTeamIndex.value]?.players.splice(playersArray.indexOf(playerUid.value), 1);
  const myTeam = teams.value[currentTeamIndex.value];
  if (myTeam) {
    if (myTeam.players.length <= 0) {
      await deleteTeam(currentTeamIndex.value);
      return;
    }
  }

  await updateDoc(roomRef,
    {
      [teamsPath]: teams.value,
    });
  currentTeamIndex.value = -1;
}

const canJoinTeam = (index: number) => {
  updateTeamIndex();
  if (index === currentTeamIndex.value)
    return false;
  if (playerUid.value.length <= 0)
    return false;
  return true;
}

const deleteTeam = async (index: number) => {
  teams.value.splice(index, 1);
  if (index == currentTeamIndex.value)
    currentTeamIndex.value = -1;


  await updateDoc(roomRef,
    {
      [teamsPath]: teams.value,
    });

  if (index == masterTeamIndex.value)
    await decideOnNextMasterPlayer();
}

const updateTeamIndex = () => {
  if (!teams.value)
    return;
  for (const item of teams.value) {
    if (item.players.includes(playerUid.value)) {
      currentTeamIndex.value = teams.value.indexOf(item);
      return;
    }
  }
  currentTeamIndex.value = -1;
}

const resetGame = async () => {
  for (const team of teams.value) {
    team.score = 0;
  }

  resetMasterPlayer();
  roundStartTime.value = Timestamp.fromMillis(0);

  await updateDoc(roomRef,
    {
      [teamsPath]: teams.value,
      [masterPlayerPath]: masterPlayer.value,
      [roundStartTimePath]: roundStartTime.value,
    });
  console.info("RESET")
}

//MASTER PLAYER
const amIMaster = () => {
  return masterPlayer.value == playerUid.value;
}

const decideOnNextMasterPlayer = async () => {
  if (!amIMaster())
    return;
  // console.info("Maste rdecideing");
  // console.info(masterTeamIndex.value);
  // console.info(masterPlayerIndex.value);

  let masterPlayerFound = false;
  while (!masterPlayerFound) {
    masterTeamIndex.value++;
    if (teams.value.length <= masterTeamIndex.value) {
      masterTeamIndex.value = 0;

      masterPlayerIndex.value++;

      const team = teams.value[masterTeamIndex.value];
      if (team) {
        if (team.players.length <= masterPlayerIndex.value)
          masterPlayerIndex.value = 0;
      }
    }

    if (teams.value.length > masterTeamIndex.value) {
      const team = teams.value[masterPlayerIndex.value];
      if (!team || team.players.length == 0) {
        updateMPIndex();
        return;
      }
      if (team.players.length > masterPlayerIndex.value) {
        masterPlayerFound = true;
      }
    }
  }

  masterPlayer.value = teams.value[masterTeamIndex.value]?.players[masterPlayerIndex.value];

  // console.info(masterTeamIndex.value);
  // console.info(masterPlayerIndex.value);

  await updateDoc(roomRef,
    {
      [masterPlayerPath]: masterPlayer.value,
    });

}

const resetMasterPlayer = async () => {
  masterPlayerIndex.value = 0;
  masterTeamIndex.value = 0;
  masterPlayer.value = teams.value[0]?.players[0];

  await updateDoc(roomRef,
    {
      [masterPlayerPath]: masterPlayer.value,
    });

}

const updateMPIndex = () => {
  if (masterPlayer.value) {
    for (const team of teams.value) {
      if (team.players.includes(masterPlayer.value)) {
        masterPlayerIndex.value = team.players.indexOf(masterPlayer.value);
        masterTeamIndex.value = teams.value.indexOf(team);
        break;
      }
    }
  }
}

//WORD GUESS
const skipWord = async () => {
  if (!amIMaster())
    return;
  wordHistory.push(currentWord.value);
  currentWord.value = getRandomWord();

  await updateDoc(roomRef,
    {
      [currentWordPath]: currentWord.value
    });
}

const guessWord = async () => {
  if (!amIMaster()) {
    return;
  }

  if (teams.value && currentTeamIndex.value !== -1) {
    const masterTeam = teams.value[currentTeamIndex.value];
    if (masterTeam) {
      masterTeam.score += 1;
    }
  }

  skipWord();

  await updateDoc(roomRef, {
    [teamsPath]: teams.value,
    [currentWordPath]: currentWord.value
  });
};
const canSeeWord = () => {
  if (!isRoundInProgress())
    return true;

  if (isRoundInProgress() && amIMaster())
    return true;

  return false;
}

const getWinnerTeam = () => {
  for (const team of teams.value) {
    if (team.score >= winRequirement)
      return teams.value.indexOf(team);
  }
  return -1;
}

</script>

<template>
  <main class="hat">
    <div>
      <div class="hat__header">
        <button class="ghost-btn hat__rules-btn" @click="isRulesOpen = true">
          ?
        </button>
        <header class="hat__header">
          <h1 class="hat__title">Шляпа</h1>
        </header>
      </div>
  
      <section class="layout">
        <h1 :hidden="getWinnerTeam() == -1">Победила команда {{ getWinnerTeam() }}</h1>
        <ul class="card teams">
          <li class="team-block team-block--active" v-for="(value, index) in teams" :key="index">
            <div class="team">
              <p class="team__name">Команда {{ index+1 }}</p>
              <p>{{ value.score }}</p>
            </div>
  
            <ul class="members">
              <li v-for="(player, pIndex) in value.players" :key="player + pIndex"
                :class="['member', { 'member--active': player === playerUid }]">
                <span class="member__name">{{ player }}</span>
              </li>
            </ul>
            <button @click="joinTeam(index)"
              v-bind:hidden="isRoundInProgress() || !canJoinTeam(index)">Присоединится</button>
          </li>
          <li v-bind:hidden="isRoundInProgress()" class="btn_team"><button @click="createTeam">+ Команда</button></li>
        </ul>
  
        <!-- Игровое поле -->
        <div class="card game">
          <p class="card__title" :hidden="amIMaster()">{{ masterPlayer}} объясняет</p>
          <p class="card__title" :hidden="!amIMaster()">Вы объясняете</p>
          <!-- <p :hidden="currentTeamIndex == -1">Вы в команде {{ currentTeamIndex }}</p> -->
          <h1 class="timer" v-bind:hidden="!isRoundInProgress()">{{ formatTime(roundTimer) }}</h1>
  
          <!-- <p v-bind:hidden="!canSeeWord() || !isRoundInProgress()">Текущее слово:</p>
                    <p v-bind:hidden="!canSeeWord() || isRoundInProgress()">Последнее слово:</p> -->
          <h1 class="word" v-bind:hidden="!canSeeWord()">{{ currentWord }}</h1>
  
          <!-- <ul :hidden="wordHistory.length <= 0">
                                        <li v-for="(value, index) in wordHistory" :key="index">
                                          {{ value }}
                                        </li>
                                      </ul> -->
  
  
  
          <div class="buttons-group">
            <button @click="startRound" v-bind:disabled="isRoundInProgress() || !amIMaster()">Начать</button>
            <button @click="leaveTeam" v-bind:disabled="isRoundInProgress()">Выйти из команды</button>
            <input type="text" v-model="playerUid" placeholder="Type something..." />
            <button @click="updateTeamIndex" v-bind:disabled="isRoundInProgress()">(R)</button>
            <button @click="skipWord" v-bind:hidden="!isRoundInProgress() || !amIMaster()">(X) Пропустить</button>
            <button @click="guessWord" v-bind:hidden="!isRoundInProgress() || !amIMaster()">(->) Угадано</button>
            <button @click="resetGame">Ресет игры</button>
          </div>
          <!-- <div hidden>
                                        DEBUG INFO:<br>
                                        RoundOver: {{ isRoundOver }}<br>
                                        currentTeamIndex: {{ currentTeamIndex }}<br>
                                        masterTeamIndex: {{ masterTeamIndex }}<br>
                                        masterPlayerIndex: {{ masterPlayerIndex }}
                                      </div> -->
        </div>
      </section>
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

<style scoped>
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

* {
  box-sizing: border-box;
  font-family: "Nunito", system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
}
</style>

<style>
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
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Nunito", system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
}

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

.layout {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 60px;

  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 24px;
}

/* Название игры*/
.hat__title {
  color: var(--text-accent);
  font-size: 40px;
  text-align: center;
  white-space: nowrap;
  text-shadow: 0 0 24px rgba(34, 211, 238, 0.8);
}

.hat__header {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 45px;
}

.btn_team {
  text-align: center;
}

.btn_team button {
  width: 100%;
  background: transparent;
  border: 1px solid var(--accent-1);
  color: var(--accent-1);
}

.btn_team button:hover {
  box-shadow: 0 0 16px rgba(34, 211, 238, 0.7);
  transition: box-shadow var(--transition-fast);
}

.ghost-btn {
  background: transparent;
  width: 40px;
  height: 40px;
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

.buttons-group {
  display: flex;
  flex-direction: row;
}

.word {
  margin: 24px auto 28px;
  width: 50%;
  text-align: center;
  font-size: 32px;
  padding: 20px 32px;
  color: var(--accent-1);
  text-shadow: 0 0 8px rgba(34, 211, 238, 0.7);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.8);
}

.game {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timer {
  font-size: 42px;
  font-weight: 700;
  text-shadow: 0 0 20px rgba(168, 85, 247, 0.75);
}

.teams {
  display: flex;
  flex-direction: column;
  gap: 14px;

  max-height: 372px;
  overflow: hidden;
  overflow-y: auto;
  overflow-x: hidden;
}

.teams li {
  list-style: none;
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

.teams::-webkit-scrollbar {
  width: 0;
}

.members {
  border-left: 2px solid rgba(148, 163, 184, 0.25);
  padding-left: 10px;
  margin: 6px 0 0;
}
</style>
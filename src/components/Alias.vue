<script setup lang="ts">
import { ref, onMounted  } from "vue";
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
const roundDuration = 10;
const winRequirement = 20;
const roundTimer = ref(0);

const playerUid = ref(""); //TODO: assign automatically
const currentTeamIndex = ref(-1); //-1 means no team
let wordHistory = new Array<string>();

let isRoundOver = false;

//firebase refs and paths
const roomRef= doc(db, "room", roomId);

const teamsPath = "gameState.teams";
const currentWordPath = "gameState.currentWord";
const roundStartTimePath = "gameState.roundStartTime";
const masterPlayerPath = "gameState.masterPlayer";

interface Team
{
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
    if (snap.exists()) 
    {
      roundStartTime.value = snap.data().gameState.roundStartTime;
      teams.value = snap.data().gameState.teams;
      masterPlayer.value = snap.data().gameState.masterPlayer;

      const serverCurrentWord = snap.data().gameState.currentWord;

      if(currentWord.value !== serverCurrentWord)
      {
        wordHistory.push(currentWord.value);
      }

      currentWord.value = serverCurrentWord;

      if(!teams.value)
      {
        teams.value = new Array<Team>();
      }

      updateMPIndex();
    }
  });
});

const startRound = async () => 
{
  wordHistory = new Array<string>();
  if(isRoundInProgress() || !amIMaster())
    return;
  
  roundStartTime.value = Timestamp.fromDate(new Date());
  skipWord();

  await updateDoc(roomRef, 
  {
    [roundStartTimePath]:  roundStartTime.value,
  });
};

const getRandomWord = () =>
{
  const randomIndex = Math.floor(Math.random() * aliasWordList.length);
  if(!aliasWordList[randomIndex])
    return "word error"
  return aliasWordList[randomIndex];
}

const roundTimeDiff = () =>
{
  if(!roundStartTime.value)
    return roundDuration;
  const startDate = roundStartTime.value.toDate();
  const currentTime = new Date();
  return (currentTime.getTime() - startDate.getTime()) / 1000; //seconds
}

const updateRoundTimer = () =>
{
  roundTimer.value = roundDuration - Math.floor(roundTimeDiff());
  if(isRoundOver && isRoundInProgress())
  {
    isRoundOver = false;
    wordHistory = new Array<string>();
  }
  if(isRoundInProgress())
    return;
  if(!isRoundOver)
  {
    isRoundOver = true;
    if(!amIMaster())
      return;
    decideOnNextMasterPlayer();
  }
}

const formatTime = (seconds: number) => 
{
  if (seconds <= 0) return "00:00";
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const isRoundInProgress = () =>
{
  if (roundTimeDiff() < roundDuration)
  {
    return true;
  } 
  return false;
}

//TEAMS
const createTeam = async () =>
{
  if(!teams.value)
  {
    teams.value = new Array<Team>();
  }

  teams.value.push(
    {
      players:new Array<string>(),
      score:0
    }
  );
  await leaveTeam();
  await joinTeam(teams.value.length - 1);
}

const joinTeam = async (index:number) =>
{
  if(index == currentTeamIndex.value)
    return;
  if(!teams.value)
    return;
  if(!teams.value[index])
    return;
  if(currentTeamIndex.value != -1)
    await leaveTeam();

  teams.value[index].players.push(playerUid.value);
  currentTeamIndex.value = index;

  await updateDoc(roomRef, 
  {
    [teamsPath]: teams.value,
  });
}
const leaveTeam = async () =>
{
  if(currentTeamIndex.value == -1)
    return;
  if(!teams.value)
    return;
  if(!teams.value[currentTeamIndex.value])
    return;
  
  const playersArray = teams.value[currentTeamIndex.value]?.players;
  if(!playersArray)
    return;
  if(!playersArray.includes(playerUid.value))
    return;

  teams.value[currentTeamIndex.value]?.players.splice(playersArray.indexOf(playerUid.value), 1);
  const myTeam = teams.value[currentTeamIndex.value];
  if(myTeam)
  {
    if(myTeam.players.length <= 0)
    {
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

const canJoinTeam = (index:number) =>
{
  updateTeamIndex();
  if(index === currentTeamIndex.value)
    return false;
  if(playerUid.value.length <= 0)
    return false;
  return true;
}

const deleteTeam = async (index:number) =>
{
  teams.value.splice(index, 1);
  if(index == currentTeamIndex.value)
    currentTeamIndex.value = -1;


  await updateDoc(roomRef, 
  {
    [teamsPath]: teams.value,
  });

  if(index == masterTeamIndex.value)
    await decideOnNextMasterPlayer();
}

const updateTeamIndex = () =>
{
  if(!teams.value)
        return;
      for(const item of teams.value)
      {
        if(item.players.includes(playerUid.value))
        {
          currentTeamIndex.value = teams.value.indexOf(item);
          return;
        }
      }
  currentTeamIndex.value = -1;
}

const resetGame = async () =>
{
  for(const team of teams.value)
  {
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
const amIMaster = () =>
{
  return masterPlayer.value == playerUid.value;
}

const decideOnNextMasterPlayer = async () =>
{
  if(!amIMaster())
    return;
  // console.info("Maste rdecideing");
  // console.info(masterTeamIndex.value);
  // console.info(masterPlayerIndex.value);

  let masterPlayerFound = false;
  while(!masterPlayerFound)
  {
    masterTeamIndex.value++;
    if(teams.value.length <= masterTeamIndex.value)
    {
      masterTeamIndex.value = 0;
      
      masterPlayerIndex.value++;
      
      const team = teams.value[masterTeamIndex.value];
      if(team)
      {
        if(team.players.length <= masterPlayerIndex.value)
          masterPlayerIndex.value = 0;
      }
    }
    
    if(teams.value.length > masterTeamIndex.value)
    {
      const team = teams.value[masterPlayerIndex.value];
      if(!team || team.players.length == 0)
      {
        updateMPIndex();
        return;
      }
      if(team.players.length > masterPlayerIndex.value)
      {
        masterPlayerFound = true;
      }
    }
  }

  masterPlayer.value = teams.value[masterTeamIndex.value]?.players[masterPlayerIndex.value];
  
  // console.info(masterTeamIndex.value);
  // console.info(masterPlayerIndex.value);

      await updateDoc(roomRef, 
      {
        [masterPlayerPath]:masterPlayer.value,
      });

}

const resetMasterPlayer = async () =>
{
  masterPlayerIndex.value = 0;
  masterTeamIndex.value = 0;
  masterPlayer.value = teams.value[0]?.players[0];

      await updateDoc(roomRef, 
      {
        [masterPlayerPath]:masterPlayer.value,
      });

}

const updateMPIndex = () =>
{
  if(masterPlayer.value)
      { 
        for(const team of teams.value)
        {
          if(team.players.includes(masterPlayer.value))
          {
            masterPlayerIndex.value = team.players.indexOf(masterPlayer.value);
            masterTeamIndex.value = teams.value.indexOf(team);
            break;
          }
        }
      }
}

//WORD GUESS
const skipWord = async () =>
{
  if(!amIMaster())
    return;
  wordHistory.push(currentWord.value);
  currentWord.value = getRandomWord();

  await updateDoc(roomRef, 
  {
    [currentWordPath]:  currentWord.value
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
const canSeeWord = () =>
{
  if(!isRoundInProgress())
    return true;

  if(isRoundInProgress() && amIMaster())
    return true;

  return false;
}

const getWinnerTeam = () =>
{
  for(const team of teams.value)
  {
    if(team.score >= winRequirement)
      return teams.value.indexOf(team);
  }
  return -1;
}

</script>

<template>
  <div>
    <h1>Шляпа</h1> 
    <h1 :hidden="getWinnerTeam() == -1">Победила команда {{ getWinnerTeam() }}</h1>
    <p :hidden="amIMaster()">{{ masterPlayer}} объясняет</p>
    <p :hidden="!amIMaster()">Вы объясняете</p>
    <p :hidden="currentTeamIndex == -1">Вы в команде {{ currentTeamIndex }}</p>
    <h1 v-bind:hidden="!isRoundInProgress()">{{ formatTime(roundTimer) }}</h1>

    <p v-bind:hidden="!canSeeWord() || !isRoundInProgress()">Текущее слово:</p>
    <p v-bind:hidden="!canSeeWord() || isRoundInProgress()">Последнее слово:</p>
    <h1 v-bind:hidden="!canSeeWord()">{{ currentWord }}</h1>
    <ul :hidden="wordHistory.length <= 0">
      <li v-for="(value, index) in wordHistory" >
        {{ value }}
      </li>
    </ul>

    <ul style="flex-direction: row; display: flex; align-items: center;">
      <li v-for="(value, index) in teams" >
        <p>Команда {{ index }}: {{ value.score }}</p> 
        <p>{{ value.players }}</p>
        <button @click="joinTeam(index)" v-bind:hidden="isRoundInProgress() || !canJoinTeam(index)">Присоединится</button>
      </li>
      <li  v-bind:hidden="isRoundInProgress()"><button @click="createTeam">+ Команда</button></li>
    </ul>
    
    <button @click="startRound" v-bind:disabled="isRoundInProgress() || !amIMaster()">Начать</button>
    |
    <button @click="leaveTeam" v-bind:disabled="isRoundInProgress()">Выйти из команды</button>
    |
    <input type="text" v-model="playerUid" placeholder="Type something..." />
    <button @click="updateTeamIndex" v-bind:disabled="isRoundInProgress()">(R)</button>
    |
    <button @click="skipWord" v-bind:hidden="!isRoundInProgress() || !amIMaster()">(X) Пропустить</button>
    <button @click="guessWord" v-bind:hidden="!isRoundInProgress() || !amIMaster()">(->) Угадано</button>
    |
    <button @click="resetGame">Ресет игры</button>
  <div>
    DEBUG INFO:<br>
    RoundOver: {{ isRoundOver }}<br>
    currentTeamIndex: {{ currentTeamIndex }}<br></br>
    masterTeamIndex: {{ masterTeamIndex }}<br></br>
    masterPlayerIndex: {{ masterPlayerIndex }}
  </div> 
  </div>
  
</template>
<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted  } from "vue";
import { db } from "../firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  Timestamp
} from "firebase/firestore";

// Слова для игры Codenames
 const codenamesWordList = [
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

const roomId = "codenames_test"; //TODO: get from adress instead
const playersRoundDuration = 10;
const captainRoundDuration = 10;
const winRequirement = 20;
const roundTimer = ref(0);
const currentTeamIndex = ref<number>(-1);

const playerUid = ref("testUID"); //TODO: assign automatically
const roomRef= doc(db, "room", roomId);

interface Team
{
  players: string[];
  score: number;
}

//sync with server
const redCap = ref<string>("");
const teamRed = ref<Team>({players:new Array<string>(), score:0});

const blueCap = ref<string>("");
const teamBlue = ref<Team>({players:new Array<string>(), score:0});

const redCapPath = "gameState.redCap";
const teamRedPath = "gameState.teamRed";
const teamBluePath = "gameState.teamBlue";
const blueCapPath = "gameState.blueCap";

const currentlyUpdatingData = ref<boolean>(false);

onMounted(() => 
{
  window.addEventListener('beforeunload', handleBeforeUnload);
  watch(playerUid, () => 
  {
    updateCurrentTeamIndex();
  });
  onSnapshot(roomRef, (snap) => 
  {
    if (snap.exists()) 
    {
      if (snap.data().gameState.redCap !== undefined)
      {
          redCap.value = snap.data().gameState.redCap;
      }
      if (snap.data().gameState.blueCap !== undefined)
      {
        blueCap.value = snap.data().gameState.blueCap;
      }
      if (snap.data().gameState.teamRed !== undefined)
      {
        teamRed.value = snap.data().gameState.teamRed;
      }
      if (snap.data().gameState.teamBlue !== undefined)
      {
        teamBlue.value = snap.data().gameState.teamBlue;
      }
    }
  });
  updateCurrentTeamIndex();
});

const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if(canLeaveTeam())
  { 
    //leaveTeam(); //UNCOMMENT TO KICK FROM TEAM ON PAGE REFRESH/CLOSE
  }
};

onUnmounted(() => {
 
   window.removeEventListener('beforeunload', handleBeforeUnload);
});

const updateToServer = async (data:{}) =>
{
  currentlyUpdatingData.value = true;
  await updateDoc(roomRef, 
    data);
  currentlyUpdatingData.value = false;
}

const updateCurrentTeamIndex = () =>
{
  if(teamBlue.value.players.includes(playerUid.value))
    {
     currentTeamIndex.value = 0; 
    }
    else if(teamRed.value.players.includes(playerUid.value))
    {
     currentTeamIndex.value = 1; 
    }
    else
    {
     currentTeamIndex.value = -1; 
    }
}


//BLUE = 0 RED = 1 
const canJoinTeam = (teamIndex:number) =>
{
  if(currentlyUpdatingData.value)
    return false;
  if(teamIndex < 0 || teamIndex > 1)
    return false;
  if(teamIndex == currentTeamIndex.value)
    return false;

  return true;
  
}

const canLeaveTeam = () =>
{
  updateCurrentTeamIndex();
  if(currentlyUpdatingData.value)
    return false;
  if(currentTeamIndex.value == -1)
    return false;
  return true;
  
}

const leaveTeam = async () =>
{
  if(!canLeaveTeam())
  {
    console.warn("Cant leave team " + "But trying to anyway?");
    return;
  }
  
  if(currentTeamIndex.value  == 0)
  {
    const index = teamBlue.value.players.indexOf(playerUid.value);
    teamBlue.value.players.splice(index, 1);
    await updateToServer( 
    {
      [teamBluePath]: teamBlue.value
    });
    
  }
  else
  {
    const index = teamRed.value.players.indexOf(playerUid.value);
    teamRed.value.players.splice(index, 1);
    await updateToServer( 
    {
      [teamRedPath]: teamRed.value
    });
  }
  updateCurrentTeamIndex();
}

//BLUE = 0 RED = 1 
const joinTeam = async (teamIndex:number) =>
{
  if(teamIndex < 0 && teamIndex > 1)
    return;
  if(canLeaveTeam())
  {
    await leaveTeam();
  }
  if(!canJoinTeam(teamIndex))
  {
    console.warn("Cant join team " + teamIndex + " But trying to anyway?");
    return;
  }
  
  
  if(teamIndex == 0)
  {
    teamBlue.value.players.push(playerUid.value);
    await updateDoc(roomRef, 
    {
      [teamBluePath]: teamBlue.value
    });
  }
  else
  {
    teamRed.value.players.push(playerUid.value);
    await updateDoc(roomRef, 
    {
      [teamRedPath]: teamRed.value
    });
  }
  updateCurrentTeamIndex();
}

</script>
<template>
  <div>
    <h1>CODENAMES</h1> 
    <input type="text" v-model="playerUid" placeholder="Type something..." />
    <div style="display: flex; flex-direction: row;">
      <div>
        <p>BLUE</p>
        <p>{{ redCap }}</p>
        <ul>
          <li v-for="(value) in teamBlue.players" >
            {{ value }}
          </li>
        </ul>
        <button :disabled="!canJoinTeam(0)" @click="joinTeam(0)">JOIN</button>
      </div>

      <div>
        <p>RED</p>
        <p>{{ redCap }}</p>
        <ul style="flex-direction: row; display: flex; align-items: center;">
          <li v-for="(value) in teamRed.players" >
            {{ value }}
          </li>
        </ul>
        <button :disabled="!canJoinTeam(1)" @click="joinTeam(1)">JOIN</button>
      </div>
    </div>
    <div>
      DEBUG INFO:<br>
      Updating data:{{ currentlyUpdatingData }}<br></br>
      currentTeamIndex: {{ currentTeamIndex }}<br></br>
    </div>

  </div>
  
</template>
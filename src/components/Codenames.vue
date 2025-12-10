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
const localTeamIndex = ref<number>(-1); // -1 = no team 0 = blue 1 = red 2 = blueCap 3 = redCap

const playerUid = ref("testUID"); //TODO: assign automatically
const roomRef= doc(db, "room", roomId);

interface Team
{
  players: string[];
  score: number;
}

const currentlyUpdatingData = ref<boolean>(false);

//sync with server
const redCap = ref<string>("");
const teamRed = ref<Team>({players:new Array<string>(), score:0});

const blueCap = ref<string>("");
const teamBlue = ref<Team>({players:new Array<string>(), score:0});

const wordsField = ref<Array<string>>(new Array<string>);

const redWordIndexes = ref<Array<number>>(new Array<number>);
const blueWordIndexes = ref<Array<number>>(new Array<number>);
const whiteWordIndexes = ref<Array<number>>(new Array<number>);
const blackWordIndex = ref<number>(0);

//paths
const redCapPath = "gameState.redCap";
const teamRedPath = "gameState.teamRed";
const teamBluePath = "gameState.teamBlue";
const blueCapPath = "gameState.blueCap";


onMounted(() => 
{
  window.addEventListener('beforeunload', handleBeforeUnload);
  watch(playerUid, () => 
  {
    updateLocalTeamIndex();
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
  updateLocalTeamIndex();
  });
});

const handleBeforeUnload = (event: BeforeUnloadEvent) => 
{
   // leaveAnyPosition(); //UNCOMMENT TO KICK FROM TEAM ON PAGE REFRESH/CLOSE
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

const updateLocalTeamIndex = () =>
{
  if(teamBlue.value.players.includes(playerUid.value))
    {
     localTeamIndex.value = 0; 
    }
    else if(teamRed.value.players.includes(playerUid.value))
    {
     localTeamIndex.value = 1; 
    }
    else if(blueCap.value == playerUid.value)
    {
     localTeamIndex.value = 2; 
    }
    else if(redCap.value == playerUid.value)
    {
     localTeamIndex.value = 3; 
    }
    else
    {
     localTeamIndex.value = -1; 
    }
}


//BLUE = 0 RED = 1 
const canJoinTeam = (teamIndex:number) =>
{
  if(teamIndex < 0 || teamIndex > 1)
    return false;
  if(teamIndex == localTeamIndex.value)
    return false;

  return true;
  
}

const canLeaveTeam = () =>
{
  updateLocalTeamIndex();
  if(localTeamIndex.value == -1 || localTeamIndex.value == 2 || localTeamIndex.value == 3)
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
  
  if(localTeamIndex.value  == 0)
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
  updateLocalTeamIndex();
}

//BLUE = 0 RED = 1 
const joinTeam = async (teamIndex:number) =>
{
  if(teamIndex < 0 && teamIndex > 1)
    return;

  await leaveAnyPosition();
  
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
  updateLocalTeamIndex();
}

//BLUE = 0 RED = 1
const canBecomeCap = (teamIndex:number) =>
{
  updateLocalTeamIndex();
  if(teamIndex < 0 || teamIndex > 1)
    return false;
  const currnetCap = teamIndex == 0 ? blueCap.value : redCap.value; 
  if(currnetCap != "")
  {
    return false;    
  }
  return true;
}

//BLUE = 0 RED = 1
const becomeCap = async (teamIndex:number) =>
{
  if(!canBecomeCap(teamIndex))
  {
    console.warn("Trying to become cap of team " + teamIndex + " when can not.");
    return;
  }
  await leaveAnyPosition();
  

  //BLUE
  if(teamIndex == 0)
  {
    blueCap.value = playerUid.value;
    await updateDoc(roomRef, 
    {
      [blueCapPath]: blueCap.value
    });
  }
  else
  {
    redCap.value = playerUid.value;
    await updateDoc(roomRef, 
    {
      [redCapPath]: redCap.value
    });
  }
  updateLocalTeamIndex();
}

const canLeaveCapPost = () =>
{
  updateLocalTeamIndex();
  if(localTeamIndex.value != 2 && localTeamIndex.value != 3)
  {
    return false;
  }
  return true;
}

const leaveCapPost = async () =>
{
  if(localTeamIndex.value != 2 && localTeamIndex.value != 3)
  {
    console.warn("Trying to leave cap post when can not.");
    return;
  }
  //BLUE
  if(localTeamIndex.value == 2)
  {
    blueCap.value = "";
    await updateDoc(roomRef, 
    {
      [blueCapPath]: blueCap.value
    });
  }
  else
  {
      redCap.value ="";
      await updateDoc(roomRef, 
      {
        [redCapPath]: redCap.value
      });
  }
  updateLocalTeamIndex();
}

const leaveAnyPosition = async () =>
{
  if(canLeaveCapPost())
  {
    await leaveCapPost();
  }
  else if(canLeaveTeam())
  {
    await leaveTeam();
  }
}

</script>
<template>
  <div>
    <h1>CODENAMES</h1> 
    <input type="text" v-model="playerUid" placeholder="Type something..." />
    <div style="display: flex; flex-direction: row;">
      <div>
        <p>BLUE</p>
        <p>{{ blueCap }}</p>
        <button :hidden="!canBecomeCap(0)" :disabled="currentlyUpdatingData" @click="becomeCap(0)">JOIN BLUE AS CAP</button>

        <ul>
          <li v-for="(value) in teamBlue.players" >
            {{ value }}
          </li>
        </ul>
        <button :hidden="!canJoinTeam(0)" :disabled="currentlyUpdatingData" @click="joinTeam(0)">JOIN BLUE</button>
      </div>

      <div>
        <p>RED</p>
        <p>{{ redCap }}</p>
        <button :hidden="!canBecomeCap(1)" :disabled="currentlyUpdatingData" @click="becomeCap(1)">JOIN RED AS CAP</button>

        <ul style="flex-direction: row; display: flex; align-items: center;">
          <li v-for="(value) in teamRed.players" >
            {{ value }}
          </li>
        </ul>
        <button :hidden="!canJoinTeam(1)" :disabled="currentlyUpdatingData" @click="joinTeam(1)">JOIN RED</button>
      </div>
    </div>
    <button :hidden="!canLeaveTeam()" :disabled="currentlyUpdatingData" @click="leaveTeam">Leave team</button>
    <button :hidden="!canLeaveCapPost()" :disabled="currentlyUpdatingData" @click="leaveCapPost">Leave cap post</button>
    <div>
      DEBUG INFO:<br>
      Updating data:{{ currentlyUpdatingData }}<br></br>
      currentTeamIndex: {{ localTeamIndex }}<br></br>
      blueCap: {{ blueCap }}<br></br>
      redCap: {{ redCap }}<br></br>
    </div>

  </div>
  
</template>
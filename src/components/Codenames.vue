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
const startingTeam = ref<number>(0); // 0 = blue, 1 = red


const redCap = ref<string>("");
const teamRed = ref<Team>({players:new Array<string>(), score:0});

const blueCap = ref<string>("");
const teamBlue = ref<Team>({players:new Array<string>(), score:0});

const wordsField = ref<Array<string>>(new Array<string>);

const redWordsIndexes = ref<Array<number>>(new Array<number>);
const blueWordsIndexes = ref<Array<number>>(new Array<number>);
const whiteWordsIndexes = ref<Array<number>>(new Array<number>);
const blackWordIndex = ref<number>(0);

//paths

const startingTeamPath = "gameState.startingTeam";

const redCapPath = "gameState.redCap";
const teamRedPath = "gameState.teamRed";
const teamBluePath = "gameState.teamBlue";
const blueCapPath = "gameState.blueCap";

const wordsFieldPath = "gameState.wordsField";

const redWordIndexesPath = "gameState.redWordsIndexes";
const blueWordIndexesPath ="gameState.blueWordsIndexes";
const whiteWordIndexesPath = "gameState.whiteWordsIndexes";
const blackWordIndexPath = "gameState.blackWordIndex";


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
      if (snap.data().gameState.startingTeam !== undefined)
      {
        startingTeam.value = snap.data().gameState.startingTeam;
      }

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

      if (snap.data().gameState.wordsField !== undefined)
      {
        wordsField.value = snap.data().gameState.wordsField;
      }

      if (snap.data().gameState.redWordsIndexes !== undefined)
      {
        redWordsIndexes.value = snap.data().gameState.redWordsIndexes;
      }
      if (snap.data().gameState.blueWordsIndexes !== undefined)
      {
        blueWordsIndexes.value = snap.data().gameState.blueWordsIndexes;
      }
      if (snap.data().gameState.whiteWordsIndexes !== undefined)
      {
        whiteWordsIndexes.value = snap.data().gameState.whiteWordsIndexes;
      }
      if (snap.data().gameState.blackWordIndex !== undefined)
      {
        blackWordIndex.value = snap.data().gameState.blackWordIndex;
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
    await updateToServer( 
    {
      [teamBluePath]: teamBlue.value
    });
  }
  else
  {
    teamRed.value.players.push(playerUid.value);
    await updateToServer( 
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
    await updateToServer( 
    {
      [blueCapPath]: blueCap.value
    });
  }
  else
  {
    redCap.value = playerUid.value;
    await updateToServer( 
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
    await updateToServer( 
    {
      [blueCapPath]: blueCap.value
    });
  }
  else
  {
      redCap.value ="";
      await updateToServer( 
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

const generateNewWordField = async () => {

  // 1. Создаем случайный список из 25 уникальных слов.

  // Создаем копию списка слов, чтобы не изменять оригинал

  const shuffledCodenamesWordList = [...codenamesWordList].sort(() => Math.random() - 0.5);
  wordsField.value = shuffledCodenamesWordList.slice(0, 25);


  // 2. Случайно выбираем команду, которая будет отвечать первой.
  const firstTeamIsBlue = Math.random() < 0.5;
  startingTeam.value = firstTeamIsBlue ? 0 : 1; // 0 для синих, 1 для красных


  // 3. Назначаем слова командам, черное и белые слова.
  const allWordIndexes = Array.from({ length: 25 }, (_, i) => i);
  const shuffledIndexes = allWordIndexes.sort(() => Math.random() - 0.5);


  let currentIndex = 0;


  if (firstTeamIsBlue) {

    blueWordsIndexes.value = shuffledIndexes.slice(currentIndex, currentIndex + 9);
    currentIndex += 9;
    redWordsIndexes.value = shuffledIndexes.slice(currentIndex, currentIndex + 8);
    currentIndex += 8;

  } else {

    redWordsIndexes.value = shuffledIndexes.slice(currentIndex, currentIndex + 9);
    currentIndex += 9;
    blueWordsIndexes.value = shuffledIndexes.slice(currentIndex, currentIndex + 8);
    currentIndex += 8;

  }

  blackWordIndex.value = shuffledIndexes[currentIndex]!;
  currentIndex += 1;

  whiteWordsIndexes.value = shuffledIndexes.slice(currentIndex);


  // 4. Обновляем Firebase с новыми данными игрового состояния.
  await updateToServer({

    [wordsFieldPath]: wordsField.value,
    [startingTeamPath]: startingTeam.value,
    [redWordIndexesPath]: redWordsIndexes.value,
    [blueWordIndexesPath]: blueWordsIndexes.value,
    [whiteWordIndexesPath]: whiteWordsIndexes.value,
    [blackWordIndexPath]: blackWordIndex.value,

  });

  console.log("Новое игровое поле сгенерировано и сохранено в Firestore!");
};

const getWordClass = (index: number): string => 
{
  if(localTeamIndex.value != 2 && localTeamIndex.value != 3)
  {
    return 'color-unknown';    
  }


  if (redWordsIndexes.value.includes(index)) 
  {
    return 'color-red';
  }

  if (blueWordsIndexes.value.includes(index)) 
  {
    return 'color-blue';
  }

  if (blackWordIndex.value === index) 
  {
    return 'color-black';
  }
  
  return 'color-white';


};

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

      <div class="codenames-board">
        <div
          v-for="(word, index) in wordsField"
          :key="index"
          :class="getWordClass(index)"
          class="codenames-card"
        >
          {{ word }}
        </div>
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
    <button  @click="generateNewWordField">GENERATE WORD FIELD</button>
    <div>
      DEBUG INFO:<br>
      Updating data:{{ currentlyUpdatingData }}<br></br>
      currentTeamIndex: {{ localTeamIndex }}<br></br>
      blueCap: {{ blueCap }}<br></br>
      redCap: {{ redCap }}<br></br>
      wordsField: {{ wordsField }}<br></br>
      whiteWordIndexes: {{ whiteWordsIndexes }}<br></br>
      redWordIndexes: {{ redWordsIndexes }}<br></br>
      blueWordIndexes: {{ blueWordsIndexes }}<br></br>
      blackWordIndex: {{ blackWordIndex }}<br></br>
    </div>

  </div>
  
</template>

<style>

/* Добавьте эти стили в ваш <style> блок */

.codenames-board {

  display: grid;

  grid-template-columns: repeat(5, 1fr); /* 5 колонок */

  gap: 10px; /* Отступы между карточками */

  width: fit-content;

  margin: 20px auto;

  border: 1px solid #ccc;

  padding: 10px;

  border-radius: 8px;

}


.codenames-card {

  border: 1px solid #eee;

  padding: 15px 10px;

  display: flex;

  justify-content: center;

  align-items: center;

  text-align: center;

  font-size: 1.1em;

  font-weight: bold;

  height: 80px; /* Фиксированная высота для карточек */

  border-radius: 5px;

  cursor: pointer; /* Для интерактивности */

  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;

  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

}


/* Стили для разных цветов */

.color-red {

  background-color: #ffcccc; /* Светло-красный */

  color: #a00000; /* Темно-красный текст */

}


.color-blue {

  background-color: #cceeff; /* Светло-синий */

  color: #0000a0; /* Темно-синий текст */

}


.color-white {

  background-color: #f0f0f0; /* Серый/белый фон */

  color: #333; /* Темный текст */

}


.color-black {

  background-color: #111; /* Темный фон */

  color: #f0f0f0; /* Светлый текст */

}


.color-unknown {

  background-color: #444; /* Темный фон */

  color: #f0f0f0; /* Светлый текст */

}


/* Дополнительные стили для команды, которая ходит первой, если хотите */

.starting-team-indicator {

  margin-top: 10px;

  font-size: 1.2em;

  font-weight: bold;

  text-align: center;

}

.starting-team-blue { color: #0000a0; }

.starting-team-red { color: #a00000; }

</style>

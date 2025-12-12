<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted  } from "vue";
import { db } from "../firebase";
import {
  doc,
  onSnapshot,
  updateDoc
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

const knownWordsIndexes= ref<Array<number>>(new Array<number>);
const winner = ref<number>(-1);

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

const knownWordsIndexesPath = "gameState.knownWordsIndexes";
const winnerPath = "gameState.winner";


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
      if (snap.data().gameState.knownWordsIndexes !== undefined)
      {
        knownWordsIndexes.value = snap.data().gameState.knownWordsIndexes;
      }
      if (snap.data().gameState.winner !== undefined)
      {
        winner.value = snap.data().gameState.winner;
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
const canJoinTeam = (teamIndex:number): boolean =>
{
  if(teamIndex < 0 || teamIndex > 1)
    return false;
  if(teamIndex == localTeamIndex.value)
    return false;

  return true;
  
}

const canLeaveTeam = (): boolean =>
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
const canBecomeCap = (teamIndex:number): boolean =>
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

const canLeaveCapPost = (): boolean =>
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

const generateNewWordField = async () => 
{
  knownWordsIndexes.value = new Array<number>();
  winner.value = -1;

  const shuffledCodenamesWordList = [...codenamesWordList].sort(() => Math.random() - 0.5);
  wordsField.value = shuffledCodenamesWordList.slice(0, 25);

  const firstTeamIsBlue = Math.random() < 0.5;
  startingTeam.value = firstTeamIsBlue ? 0 : 1; 

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

  await updateToServer({

    [wordsFieldPath]: wordsField.value,
    [startingTeamPath]: startingTeam.value,
    [redWordIndexesPath]: redWordsIndexes.value,
    [blueWordIndexesPath]: blueWordsIndexes.value,
    [whiteWordIndexesPath]: whiteWordsIndexes.value,
    [blackWordIndexPath]: blackWordIndex.value,
    [knownWordsIndexesPath]:knownWordsIndexes.value,
    [winnerPath]:winner.value,

  });

  console.log("Новое игровое поле сгенерировано и сохранено в Firestore!");
};

const getWordClass = (index: number): string => 
{
  if(knownWordsIndexes.value.includes(index) || localTeamIndex.value == 2 || localTeamIndex.value == 3)
  {
    if (blackWordIndex.value === index) 
    {
      return 'color-black';
    }

    if (redWordsIndexes.value.includes(index)) 
    {
      return 'color-red';
    }

    if (blueWordsIndexes.value.includes(index)) 
    {
      return 'color-blue';
    }
    
    return 'color-white'
  }
  
  return 'color-unknown';

};

const canRevealWord = (index:number): boolean =>
{
  if(winner.value != -1)
  {
   return false; 
  }
  if(startingTeam.value == 0)
  {
   if(localTeamIndex.value == 0)
    {
      return true;
    } 
  }
  else
  {
    if(localTeamIndex.value == 1)
    {
      return true;
    } 
  }
  if(knownWordsIndexes.value.includes(index))
  {
    return false;
  }
  return false;
}

const revealWord = async (index:number) =>
{
  if(!canRevealWord(index))
  {
    return; 
  }
  knownWordsIndexes.value.push(index);
  
  await updateToServer(
  {
    [knownWordsIndexesPath]:knownWordsIndexes.value,
  });

  if(blackWordIndex.value == index)
  {
    if(localTeamIndex.value == 0)
    {
      await winGame(1);
    }
    else
    {
      await winGame(0);
    }
  }

  if(whiteWordsIndexes.value.includes(index))
  {
    await nextRound();
  }
  if(localTeamIndex.value == 0)
  {
    if(redWordsIndexes.value.includes(index))
    {
      await nextRound();
    }
  }
  else if(blueWordsIndexes.value.includes(index))
    {
      await nextRound();
    }
    
  const winner = checkWinner();
  if(winner != -1)
  {
    await winGame(winner);
  }
  
}

//-1 Nobody 0 - Blue 1 - Red
const checkWinner = ():number =>
{
  let blueRevealedCount = 0;
  let redRevealedCount = 0;

  for (const knownIndex of knownWordsIndexes.value) 
  {
    if (blueWordsIndexes.value.includes(knownIndex)) 
    {
      blueRevealedCount++;
    } 
    else if (redWordsIndexes.value.includes(knownIndex))
    {
      redRevealedCount++;
    }
  }

  const blueTarget = blueWordsIndexes.value.length;
  const redTarget = redWordsIndexes.value.length;

  if (blueRevealedCount === blueTarget)
  {
    return 0; // Blue team wins
  }

  if (redRevealedCount === redTarget) 
  {
    return 1; // Red team wins
  }
  return -1; // No team has won yet
}

const canGoToTheNextRound = ():boolean =>
{
  if(startingTeam.value == 0)
  {
   if(localTeamIndex.value == 2 || localTeamIndex.value == 0)
    {
      return true;
    } 
    return false;
  }
  else if(localTeamIndex.value == 3  || localTeamIndex.value == 1)
  {
    return true;
  } 
  return false;
}

const nextRound = async () =>
{
  if(!canGoToTheNextRound())
  {
    return; 
  }

  if(startingTeam.value == 0)
  {
    startingTeam.value = 1;
  }
  else
  {
    startingTeam.value = 0;
  }

}

const winGame = async (teamIndex:number) =>
{
    winner.value = teamIndex;
    await updateToServer(
      {
      [winnerPath]:winner.value
    })
}

const isCap = ():boolean =>
{
  return localTeamIndex.value == 2 || localTeamIndex.value == 3;
}

</script>
<template>
  <div>
    <h1>CODENAMES</h1> 
    <h2 :hidden="winner == -1">{{ winner == 0 ? "BLUE": "RED"}} team WINS!</h2>
    <input type="text" v-model="playerUid" placeholder="Type something..." />
    <div style="display: flex; flex-direction: row;">
      <div>
        <p>{{startingTeam == 0 ? "(TURN) " : ""}}BLUE</p>
        <p>CAP: {{ blueCap }}</p>
        <button :hidden="!canBecomeCap(0)" :disabled="currentlyUpdatingData" @click="becomeCap(0)">JOIN BLUE AS CAP</button>

        <ul>
          <li v-for="(value) in teamBlue.players" >
            {{ value }}
          </li>
        </ul>
        <button :hidden="!canJoinTeam(0)" :disabled="currentlyUpdatingData" @click="joinTeam(0)">JOIN BLUE</button>
      </div>

      <div class="codenames-board">
        <button
          v-for="(word, index) in wordsField"
          :key="index"
          :class="getWordClass(index)"
          class="codenames-card"
          :disabled="!canRevealWord(index) || currentlyUpdatingData"
          @click="revealWord(index)"
        >
          {{ word }} {{isCap() && knownWordsIndexes.includes(index) ? "(V)" : ""  }}
        </button>
      </div>

      <div>
        <p>{{startingTeam == 1 ? "(TURN) " : ""}}RED</p>
        <p>CAP: {{ redCap }}</p>
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
    <button :hidden="!canGoToTheNextRound() || !isCap()" :disabled="currentlyUpdatingData" @click="nextRound">Next round -></button>
    <button  @click="generateNewWordField">GENERATE WORD FIELD</button>
    <div>
      DEBUG INFO:<br>
      Updating data:{{ currentlyUpdatingData }}<br></br>
      localTeamIndex: {{ localTeamIndex }}<br></br>
      blueCap: {{ blueCap }}<br></br>
      redCap: {{ redCap }}<br></br>
      wordsField: {{ wordsField }}<br></br>
      whiteWordIndexes: {{ whiteWordsIndexes }}<br></br>
      redWordIndexes: {{ redWordsIndexes }}<br></br>
      blueWordIndexes: {{ blueWordsIndexes }}<br></br>
      blackWordIndex: {{ blackWordIndex }}<br></br>
      startingTeam: {{ startingTeam }}<br></br>
      knownWordsIndexes: {{ knownWordsIndexes }}<br></br>
      
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

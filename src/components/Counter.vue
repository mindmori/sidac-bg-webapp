<script setup lang="ts">
import { ref, onMounted } from "vue";
import { db } from "../firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  increment
} from "firebase/firestore";

const counter = ref(0);

// указываем путь к документу
const counterRef = doc(db, "counters", "main");

onMounted(() => {
  // слушаем изменения в Firestore
  onSnapshot(counterRef, (snap) => {
    if (snap.exists()) {
      counter.value = snap.data().value;
    }
  });
});

// функции изменения
const increase = async () => {
  await updateDoc(counterRef, {
    value: increment(1)
  });
};

const decrease = async () => {
  await updateDoc(counterRef, {
    value: increment(-1)
  });
};
</script>

<template>
  <div>
    <h1>Counter: {{ counter }}</h1>
    <button @click="increase">+</button>
    <button @click="decrease">−</button>
  </div>
</template>

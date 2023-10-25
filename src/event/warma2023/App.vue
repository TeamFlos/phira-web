<script setup lang="ts">
import { ref } from 'vue';

import warma from '@/assets/warma2023/warma.png';
import spider from '@/assets/warma2023/spider.svg';

type Questions = {
  type: 'oneChoice' | 'multiChoice' | 'text';
  question: string;
  answer: string;
  choices?: string[];
};
type Quiz = {
  title: string;
  questions: Questions[];
};

import quizzes from './quizzes.json';

quizzes as Quiz[];

// Randomly pick a quiz

const quizIndex = ref(0);
quizIndex.value = Math.floor(Math.random() * quizzes.length);
// quizIndex.value = 1;
const quiz = quizzes[quizIndex.value] as Quiz;

const showQuiz = ref(false);
function alterShowQuiz() {
  showQuiz.value = !showQuiz.value;
  const quizExpand = document.querySelector('.quiz-expand');
  if (quizExpand) {
    if (quizExpand.classList.contains('open')) {
      quizExpand.classList.remove('open');
    } else {
      quizExpand.classList.add('open');
    }
  }
  const hint = document.querySelector('.hint');
  if (hint) {
    if (showQuiz.value) {
      hint.textContent = '这里什么也没有...吗?';
    } else {
      hint.textContent = '这里什么也没有......';
    }
  }
}
</script>

<template>
  <div class="board relative flex flex-col z-0">
    <div class="relative min-h-screen flex flex-col items-center">
      <img :src="spider" @click="alterShowQuiz()" class="z-10 w-1/12" />
      <div class="quiz-expand flex-grow mx-4 md:mx-8 lg:mx-12">
        <div v-if="showQuiz" class="quiz">
          <p class="text-3xl md:text-4xl lg:text-5xl font-bold quiz-title">{{ quiz.title }}</p>
          <div v-for="(question, index) in quiz.questions" :key="index" class="question mt-4 ml-8">
            <p class="text-xl md:text-2xl lg:text-3xl font-bold">{{ question.question }}</p>
            <div class="choice ml-8 text-l md:text-xl">
              <div class="form-control mt-1">
                <div v-if="question.type === 'oneChoice'">
                  <div v-for="(choice, key) in question.choices" :key="key">
                    <label class="flex flex-row items-center mt-1" :for="key">
                      <input type="radio" class="radio radio-error" :name="String(index)" :id="key" />
                      <span class="ml-2">{{ choice }}</span>
                    </label>
                  </div>
                </div>
                <div v-else-if="question.type === 'multiChoice'">
                  <div v-for="(choice, key) in question.choices" :key="key">
                    <label class="flex flex-row items-center mt-1" :for="key">
                      <input type="checkbox" class="checkbox checkbox-error" :name="String(index)" :id="key" />
                      <span class="ml-2">{{ choice }}</span>
                    </label>
                  </div>
                </div>
                <div v-else-if="question.type === 'text'">
                  <input type="text" placeholder="是什么呢..." class="input input-error input-bordered w-5/6 mt-1 mb-2"
                    :name="String(index)" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full relative">
        <img :src="warma" class="relative left-0 z-10 w-1/3" />
        <div class="split-line" />
        <div class="hint-board absolute mt-0.5">
          <span class="hint absolute right-0 mr-10 md:mr-20 lg:mr-30 text-xl md:text-3xl lg:text-5xl">这里什么也没有...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.board {
  background-color: #fec180;
}

.split-line {
  background-color: #543335;
  height: 2px;
  position: absolute;
  top: 60%;
  width: 100%;
  z-index: 5;
}

.hint-board {
  align-items: center;
  background-color: #ff7b6f;
  display: flex;
  top: 60%;
  bottom: 0%;
  width: 100%;
  z-index: 5;
}

.hint {
  color: #ffffff;
}

.quiz-expand {
  transition: max-height 0.8s ease-in-out;
}

.quiz {
  animation: fadeIn 0.6s ease-in-out forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.quiz-title {
  color: #543335;
}

.question {
  color: #543335;
}

.choice {
  color: #543335;
}
</style>

<script setup lang="ts">
import { ref, type Ref } from 'vue';

import warma from '@/assets/warma2023/warma.png';
import spider from '@/assets/warma2023/spider.svg';

type Questions = {
  type: 'oneChoice' | 'multiChoice' | 'text';
  question: string;
  answer: string | string[];
  choices?: string[];
  user_selected?: boolean[];
  user_answer?: string;
  result_class?: Ref<string>;
  result_text?: Ref<string>;
};
type Quiz = {
  title: string;
  questions: Questions[];
};

import untypedQuizzes from './quizzes.json';

const quizzes: Quiz[] = untypedQuizzes as Quiz[];

for (let quiz of quizzes) {
  for (let q of quiz.questions) {
    if (q.type === 'multiChoice') {
      q.user_selected = Array(q.choices!!.length).fill(false);
    }
    q.result_class = ref('');
    q.result_text = ref('');
  }
}

// Randomly pick a quiz

const quizIndex = ref(0);
quizIndex.value = Math.floor(Math.random() * quizzes.length);

const allCorrect = ref(false);

function check() {
  allCorrect.value = true;
  for (let q of quizzes[quizIndex.value].questions) {
    let correct = false,
      message = '';
    switch (q.type) {
      case 'oneChoice': {
        if (q.user_answer === q.answer) {
          correct = true;
          message = '正确';
        } else {
          correct = false;
          message = '错误，正确答案为 ' + q.answer;
        }
        break;
      }
      case 'multiChoice': {
        let userAnswer = '';
        for (let i = 0; i < q.user_selected!!.length; i++) {
          if (q.user_selected!![i]) {
            userAnswer += String.fromCharCode(65 + i);
          }
        }
        let answer = (q.answer as string[]).join('');
        if (userAnswer === answer) {
          correct = true;
          message = '正确';
        } else {
          correct = false;
          message = '错误，正确答案为 ' + answer;
        }
        break;
      }
      case 'text': {
        if (q.user_answer?.toLowerCase().trim() === (q.answer as string).toLowerCase().trim()) {
          correct = true;
          message = '正确';
        } else {
          correct = false;
          message = '错误，正确答案为 ' + q.answer;
        }
        break;
      }
    }
    q.result_text!!.value = message;
    if (correct) {
      q.result_class!!.value = 'text-green-500';
    } else {
      q.result_class!!.value = 'text-red-500';
    }
    allCorrect.value &&= correct;
  }
}
</script>

<template>
  <div class="board relative flex flex-col z-0">
    <div class="relative min-h-screen flex flex-col items-center">
      <img :src="spider" class="z-10 w-1/12" />
      <div class="quiz-expand flex-grow mx-4 md:mx-8 lg:mx-12">
        <div class="quiz">
          <p class="text-3xl md:text-4xl lg:text-5xl font-bold quiz-title">{{ quizzes[quizIndex].title }}</p>
          <div v-for="(question, index) in quizzes[quizIndex].questions" :key="index" class="question mt-4 ml-8">
            <p class="text-xl md:text-2xl lg:text-3xl font-bold">{{ question.question }}</p>
            <div class="choice ml-8 text-l md:text-xl">
              <form class="form-control mt-1 flex gap-1">
                <template v-if="question.type === 'oneChoice'">
                  <div class="flex items-center" v-for="(choice, id) in question.choices" :key="id">
                    <input
                      type="radio"
                      class="radio radio-error"
                      :id="index + ':' + id"
                      :name="String(index)"
                      :value="String.fromCharCode(65 + id)"
                      v-model="question.user_answer" />
                    <label :for="index + ':' + id">
                      <span class="ml-2">{{ choice }}</span>
                    </label>
                  </div>
                </template>
                <template v-else-if="question.type === 'multiChoice'">
                  <div class="flex items-center" v-for="(choice, id) in question.choices" :key="id">
                    <input type="checkbox" class="checkbox checkbox-error" :id="index + ':' + id" :name="String(index)" v-model="question.user_selected!![id]" />
                    <label :for="index + ':' + id">
                      <span class="ml-2">{{ choice }}</span>
                    </label>
                  </div>
                </template>
                <div v-else-if="question.type === 'text'">
                  <input type="text" placeholder="是什么呢..." class="input input-error input-bordered w-5/6 mt-1 mb-2" :name="String(index)" v-model="question.user_answer" />
                </div>
              </form>
            </div>
            <p class="mt-1 font-black" :class="question.result_class!!.value">{{ question.result_text!!.value }}</p>
          </div>
          <div class="w-full flex justify-end mt-2 gap-2">
            <button class="btn bg-[#ff7b6f] text-white" @click="check">检查</button>
            <button v-if="allCorrect" class="btn btn-success text-white" @click="quizIndex = Math.floor(Math.random() * quizzes.length)">再来一次</button>
          </div>
        </div>
      </div>
      <div class="w-full relative">
        <img :src="warma" class="relative left-0 z-10 w-1/3" />
        <div class="split-line" />
        <div class="hint-board absolute mt-0.5">
          <span class="text-white absolute right-0 mr-10 md:mr-20 lg:mr-30 text-xl md:text-3xl lg:text-5xl">WARMA 的小测验</span>
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

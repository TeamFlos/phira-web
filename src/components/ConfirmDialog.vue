<script setup lang="ts">
import { toastError } from '@/common';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

let props = defineProps<{
    do: () => Promise<void>;
    onError?: () => void;
}>();

defineExpose({ showModal: () => dialogE.value!.showModal() });

const doing = ref(false);
const dialogE = ref<HTMLDialogElement>();

async function onConfirm() {
    if (doing.value) return;
    doing.value = true;
    try {
        await props.do();
        dialogE.value!.close();
    } catch (e) {
        toastError(e);
        if (props.onError) props.onError();
    } finally {
        doing.value = false;
    }
}

function tryCloseDialog() {
    if (!doing.value) dialogE.value!.close();
}

</script>

<template>
    <dialog class="modal modal-bottom sm:modal-middle" ref="dialogE" @close.prevent="tryCloseDialog">
        <div class="modal-box">
            <slot />
            <div class="modal-action">
                <button class="btn btn-neutral" :disabled="doing" @click="tryCloseDialog" v-t="'cancel'"></button>
                <button class="btn btn-error" @click="onConfirm">
                    <LoadOr :loading="doing">{{ t('confirm') }}</LoadOr>
                </button>
            </div>
        </div>
        <div class="modal-backdrop">
            <button class="cursor-default" @click="tryCloseDialog"></button>
        </div>
    </dialog>
</template>
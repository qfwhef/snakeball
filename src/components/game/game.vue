<template>
    <div class="game _fullscreen" v-show="game.if_visible.value">
        <!-- 游戏组件，仅作为占位符，实际功能由 Stage 组件提供 -->
    </div>
</template>

<script setup>
import { global } from "@/stores/global";
import { onMounted } from "vue";

const store = global();
const game = store.game;

onMounted(() => {
    // 初始化操作
});
</script>

<style scoped>
.game {
    --scale: 1;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}
</style> 
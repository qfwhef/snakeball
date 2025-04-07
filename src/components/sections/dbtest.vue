<template>
  <div class="dbtest _fullscreen" v-show="if_visible">
    <div class="dbtest_container">
      <h1 class="_font_4">数据库连接测试</h1>
      
      <div class="dbtest_status">
        <p class="_font_2">连接状态: <span :class="{'success': dbStatus === '连接成功', 'error': dbStatus === '连接失败'}">{{ dbStatus }}</span></p>
        <button class="dbtest_btn" @click="testConnection">测试连接</button>
      </div>

      <div class="dbtest_operations">
        <div class="dbtest_section">
          <h2 class="_font_3">玩家数据列表</h2>
          <div class="dbtest_table" v-if="players.length">
            <div class="dbtest_header">
              <div>排名</div>
              <div>名称</div>
              <div>分数</div>
              <div>生命</div>
              <div>波数</div>
              <div>操作</div>
            </div>
            <div class="dbtest_row" v-for="(player, index) in players" :key="index">
              <div>{{ index + 1 }}</div>
              <div>{{ player.name }}</div>
              <div>{{ player.score }}</div>
              <div>{{ player.lives }}</div>
              <div>{{ player.wave }}</div>
              <div>
                <button class="dbtest_small_btn" @click="deletePlayer(player.name)">删除</button>
              </div>
            </div>
          </div>
          <p v-else>暂无数据</p>
        </div>

        <div class="dbtest_section">
          <h2 class="_font_3">添加测试数据</h2>
          <div class="dbtest_form">
            <div class="dbtest_field">
              <label>名称:</label>
              <input v-model="newPlayer.name" placeholder="输入玩家名称" />
            </div>
            <div class="dbtest_field">
              <label>分数:</label>
              <input v-model="newPlayer.score" type="number" placeholder="输入分数" />
            </div>
            <div class="dbtest_field">
              <label>生命:</label>
              <input v-model="newPlayer.lives" type="number" placeholder="输入生命值" />
            </div>
            <div class="dbtest_field">
              <label>波数:</label>
              <input v-model="newPlayer.wave" type="number" placeholder="输入波数" />
            </div>
            <button class="dbtest_btn" @click="addPlayer">添加数据</button>
          </div>
        </div>
      </div>

      <div class="dbtest_log">
        <h2 class="_font_3">操作日志</h2>
        <div class="dbtest_log_content">
          <p v-for="(log, index) in logs" :key="index" :class="{'error': log.type === 'error'}">
            {{ log.time }} - {{ log.message }}
          </p>
        </div>
      </div>

      <div class="dbtest_closebtn" @click="closeDbTest">
        <div class="closebtn_cross"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const if_visible = ref(false);
const dbStatus = ref('未测试');
const players = ref([]);
const logs = ref([]);
const newPlayer = ref({
  name: '',
  score: 100,
  lives: 3,
  wave: 1
});

// 添加日志
function addLog(message, type = 'info') {
  const now = new Date();
  const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
  logs.value.unshift({ time, message, type });
  
  // 限制日志数量
  if (logs.value.length > 10) {
    logs.value.pop();
  }
}

// 测试数据库连接
async function testConnection() {
  try {
    addLog('正在测试数据库连接...');
    const response = await fetch('/api/db-test');
    const data = await response.json();
    
    if (data.success) {
      dbStatus.value = '连接成功';
      addLog('数据库连接成功!');
    } else {
      throw new Error(data.error || '未知错误');
    }
  } catch (error) {
    dbStatus.value = '连接失败';
    addLog(`数据库连接失败: ${error.message}`, 'error');
  }
}

// 获取所有玩家数据
async function fetchPlayers() {
  try {
    addLog('正在获取玩家数据...');
    const response = await fetch('/api/rank');
    const data = await response.json();
    
    players.value = data || [];
    addLog(`成功获取 ${players.value.length} 条玩家数据`);
  } catch (error) {
    addLog(`获取玩家数据失败: ${error.message}`, 'error');
  }
}

// 添加新玩家
async function addPlayer() {
  try {
    if (!newPlayer.value.name) {
      addLog('请输入玩家名称', 'error');
      return;
    }
    
    addLog(`正在添加玩家: ${newPlayer.value.name}...`);
    const response = await fetch('/api/player', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newPlayer.value)
    });
    
    const data = await response.json();
    
    if (data.success) {
      addLog(`玩家 ${newPlayer.value.name} 添加成功!`);
      // 清空表单
      newPlayer.value = {
        name: '',
        score: 100,
        lives: 3,
        wave: 1
      };
      // 刷新列表
      fetchPlayers();
    } else {
      throw new Error(data.error || '未知错误');
    }
  } catch (error) {
    addLog(`添加玩家失败: ${error.message}`, 'error');
  }
}

// 删除玩家
async function deletePlayer(name) {
  try {
    if (!confirm(`确定要删除玩家 "${name}" 吗?`)) {
      return;
    }
    
    addLog(`正在删除玩家: ${name}...`);
    const response = await fetch(`/api/player?name=${encodeURIComponent(name)}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (data.success) {
      addLog(`玩家 ${name} 删除成功!`);
      // 刷新列表
      fetchPlayers();
    } else {
      throw new Error(data.error || '未知错误');
    }
  } catch (error) {
    addLog(`删除玩家失败: ${error.message}`, 'error');
  }
}

// 关闭测试页面
function closeDbTest() {
  if_visible.value = false;
}

// 显示测试页面
function showDbTest() {
  if_visible.value = true;
  fetchPlayers();
}

// 导出方法供其他组件调用
defineExpose({ showDbTest });

// 组件挂载时初始化
onMounted(() => {
  // 初始化
});
</script>

<style scoped>
.dbtest {
  background-color: rgba(0, 0, 0, 0.95);
  z-index: 1001;
  justify-content: center;
  align-items: center;
}

.dbtest_container {
  position: relative;
  width: 80%;
  max-width: 800px;
  max-height: 90vh;
  background-color: var(--color_front);
  border-radius: 16px;
  padding: 30px;
  overflow-y: auto;
}

.dbtest_container h1 {
  text-align: center;
  color: var(--color_back);
  margin-bottom: 20px;
}

.dbtest_status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.dbtest_status p {
  color: var(--color_back);
}

.success {
  color: #4CAF50 !important;
  font-weight: bold;
}

.error {
  color: #F44336 !important;
  font-weight: bold;
}

.dbtest_operations {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-bottom: 30px;
}

.dbtest_section {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 15px;
  border-radius: 8px;
}

.dbtest_section h2 {
  color: var(--color_back);
  margin-bottom: 15px;
}

.dbtest_table {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
}

.dbtest_header, .dbtest_row {
  display: grid;
  grid-template-columns: 0.5fr 1.5fr 1fr 0.5fr 0.5fr 0.8fr;
  text-align: center;
}

.dbtest_header {
  background-color: var(--color_back);
  color: var(--color_front);
  padding: 10px 0;
  font-weight: bold;
}

.dbtest_row {
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  color: var(--color_back);
}

.dbtest_row:nth-child(odd) {
  background-color: rgba(0, 0, 0, 0.02);
}

.dbtest_form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dbtest_field {
  display: flex;
  align-items: center;
}

.dbtest_field label {
  width: 60px;
  color: var(--color_back);
}

.dbtest_field input {
  flex: 1;
  padding: 8px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  background-color: white;
  color: var(--color_back);
}

.dbtest_btn {
  padding: 8px 16px;
  background-color: var(--color_back);
  color: var(--color_front);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  align-self: flex-end;
  margin-top: 10px;
}

.dbtest_btn:hover {
  background-color: #333;
}

.dbtest_small_btn {
  padding: 4px 8px;
  background-color: #F44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.dbtest_small_btn:hover {
  background-color: #D32F2F;
}

.dbtest_log {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 15px;
  border-radius: 8px;
}

.dbtest_log h2 {
  color: var(--color_back);
  margin-bottom: 10px;
}

.dbtest_log_content {
  background-color: #333;
  color: #eee;
  padding: 10px;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  font-family: monospace;
}

.dbtest_log_content p {
  margin: 5px 0;
  line-height: 1.4;
}

.dbtest_log_content .error {
  color: #FF8A80 !important;
}

.dbtest_closebtn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.closebtn_cross {
  position: relative;
  width: 20px;
  height: 20px;
}

.closebtn_cross:before,
.closebtn_cross:after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  background-color: var(--color_back);
  top: 50%;
  left: 0;
}

.closebtn_cross:before {
  transform: rotate(45deg);
}

.closebtn_cross:after {
  transform: rotate(-45deg);
}

@media (max-width: 768px) {
  .dbtest_container {
    width: 95%;
    padding: 15px;
  }
  
  .dbtest_header, .dbtest_row {
    grid-template-columns: 0.5fr 1fr 0.5fr 0.5fr 0.5fr 0.8fr;
    font-size: 14px;
  }
  
  .dbtest_field {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .dbtest_field label {
    width: 100%;
    margin-bottom: 5px;
  }
}
</style> 
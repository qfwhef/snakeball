// Cloudflare Pages Function for player CRUD operations
export async function onRequest(context) {
  const { request, env } = context;
  
  // 处理预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
  
  // 添加玩家
  if (request.method === 'POST') {
    try {
      const player = await request.json();
      
      // 验证必填字段
      if (!player.name) {
        throw new Error('玩家名称不能为空');
      }
      
      // 确保数值类型
      const score = parseInt(player.score) || 0;
      const lives = parseInt(player.lives) || 0;
      const wave = parseInt(player.wave) || 0;
      
      // 插入数据
      await env.DB.prepare(`
        INSERT INTO players (name, score, lives, wave)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(name) DO UPDATE SET
          score = excluded.score,
          lives = excluded.lives,
          wave = excluded.wave
      `).bind(player.name, score, lives, wave).run();
      
      return new Response(JSON.stringify({
        success: true,
        message: '玩家数据添加成功'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
  
  // 删除玩家
  if (request.method === 'DELETE') {
    try {
      const url = new URL(request.url);
      const name = url.searchParams.get('name');
      
      if (!name) {
        throw new Error('玩家名称不能为空');
      }
      
      // 删除数据
      const result = await env.DB.prepare(`
        DELETE FROM players WHERE name = ?
      `).bind(name).run();
      
      if (!result.changes) {
        throw new Error('未找到该玩家');
      }
      
      return new Response(JSON.stringify({
        success: true,
        message: '玩家数据删除成功'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
  
  return new Response('方法不允许', {
    status: 405,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });
} 
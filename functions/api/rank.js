export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // 获取排行榜列表
  if (request.method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT * FROM players ORDER BY score DESC LIMIT 15'
    ).all();
    
    return new Response(JSON.stringify(results), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  // 提交分数
  if (request.method === 'POST') {
    const data = await request.json();
    
    // 插入或更新玩家数据
    await env.DB.prepare(`
      INSERT INTO players (name, score, lives, wave)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(name) DO UPDATE SET
        score = MAX(excluded.score, players.score),
        lives = excluded.lives,
        wave = excluded.wave
    `).bind(data.name, data.score, data.lives, data.wave).run();
    
    // 获取玩家排名
    const { results } = await env.DB.prepare(`
      SELECT COUNT(*) + 1 as rank 
      FROM players 
      WHERE score > ?
    `).bind(data.score).all();
    
    return new Response(JSON.stringify({ rank: results[0].rank }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  // OPTIONS 请求处理 CORS 预检
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
  
  return new Response('方法不允许', { status: 405 });
} 
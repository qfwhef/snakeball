export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 获取排行榜列表
    if (request.method === 'GET' && url.pathname === '/api/rank') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM players ORDER BY score DESC LIMIT 15'
      ).all();
      
      return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 提交分数
    if (request.method === 'POST' && url.pathname === '/api/rank') {
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
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Not Found', { status: 404 });
  }
}; 
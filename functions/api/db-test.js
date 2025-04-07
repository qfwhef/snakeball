// Cloudflare Pages Function for testing database connection
export async function onRequest(context) {
  const { env } = context;
  
  try {
    // 尝试执行一个简单的 SQL 查询
    const { results } = await env.DB.prepare(
      'SELECT 1 as connection_test'
    ).all();
    
    return new Response(JSON.stringify({
      success: true,
      message: '数据库连接成功',
      data: results
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
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 
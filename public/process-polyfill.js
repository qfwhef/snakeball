// 提供一个简单的 process polyfill
window.process = window.process || {
  env: {
    NODE_ENV: 'production'
  }
}; 
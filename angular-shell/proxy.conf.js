const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = {
  '/api/menu': {
    target: 'http://localhost:4200',
    pathRewrite: { '^/api/menu': '/assets/mock-menu.json' },
    changeOrigin: false,
  },
};

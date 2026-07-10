const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = {
  '/api/menu': {
    target: 'http://localhost:4200',
    pathRewrite: { '^/api/menu': '/assets/mock-menu.json' },
    changeOrigin: false,
  },
  '/remotes/menu': {
    target: 'http://localhost:4201',
    pathRewrite: { '^/remotes/menu': '' },
    changeOrigin: true,
  },
  '/remotes/toolbar': {
    target: 'http://localhost:4202',
    pathRewrite: { '^/remotes/toolbar': '' },
    changeOrigin: true,
  },
  '/remotes/overview': {
    target: 'http://localhost:4203',
    pathRewrite: { '^/remotes/overview': '' },
    changeOrigin: true,
  },
  '/remotes/reports': {
    target: 'http://localhost:4204',
    pathRewrite: { '^/remotes/reports': '' },
    changeOrigin: true,
  },
  '/remotes/analytics': {
    target: 'http://localhost:4205',
    pathRewrite: { '^/remotes/analytics': '' },
    changeOrigin: true,
  },
  '/remotes/export': {
    target: 'http://localhost:4206',
    pathRewrite: { '^/remotes/export': '' },
    changeOrigin: true,
  },
};

export default [
  {
    context: ['/api/users', '/api/payments'],
    target: "http://xx.xx.xx.xx:3000",
    secure: false,
    changeOrigin: true,
    logLevel: "debug",
    pathRewrite: {
      '^/api/users': '/api/auth',
      '^/api/payments': '/api/pay'
    }
  },
  
  {
    "context": ['/api/**'],
    "target": "http://xx.xx.xx.xx:5000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  },

  {
    "context": ['/auth-service'],
    "target": "http://xx.xx.xx.xx:8000",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug",
    "pathRewrite": {
      "^/auth-service": ""
    }
  }
];

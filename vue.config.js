module.exports = {
  devServer: {
    // 项目运行时候的端口号
    port: 8002
  },
    publicPath: process.env.NODE_ENV === 'production'
      ? '/vuejs-essential/dist/'
      : '/'
  }
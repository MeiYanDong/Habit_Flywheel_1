
// 小程序入口文件
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log('登录成功', res.code)
      }
    })
  },
  
  globalData: {
    userInfo: null,
    baseUrl: 'https://your-api-endpoint.com' // 替换为您的API地址
  }
})

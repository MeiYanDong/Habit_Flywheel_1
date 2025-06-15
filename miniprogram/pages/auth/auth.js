
// auth.js - 用户认证页面逻辑
Page({
  data: {
    isLoading: false,
    userInfo: null
  },

  onLoad() {
    // 检查是否已经登录
    this.checkLoginStatus()
  },

  onShow() {
    // 每次显示页面时检查登录状态
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      // 已登录，跳转到首页
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },

  // 微信登录处理
  handleWechatLogin(e) {
    if (this.data.isLoading) return

    const { userInfo } = e.detail
    
    if (!userInfo) {
      wx.showToast({
        title: '需要授权才能使用完整功能',
        icon: 'none',
        duration: 2000
      })
      return
    }

    this.setData({ isLoading: true })

    // 获取登录凭证
    wx.login({
      success: (res) => {
        if (res.code) {
          this.performLogin(userInfo, res.code)
        } else {
          this.handleLoginError('获取登录凭证失败')
        }
      },
      fail: () => {
        this.handleLoginError('微信登录失败')
      }
    })
  },

  // 执行登录逻辑
  performLogin(userInfo, code) {
    // 模拟API调用延迟
    setTimeout(() => {
      try {
        // 构造用户信息
        const user = {
          id: this.generateUserId(),
          nickname: userInfo.nickName,
          avatar: userInfo.avatarUrl,
          gender: userInfo.gender,
          city: userInfo.city,
          province: userInfo.province,
          country: userInfo.country,
          loginTime: new Date().toISOString(),
          loginType: 'wechat',
          code: code
        }

        // 保存用户信息到本地存储
        wx.setStorageSync('userInfo', user)
        wx.setStorageSync('isLoggedIn', true)

        // 初始化用户数据
        this.initUserData(user)

        // 登录成功提示
        wx.showToast({
          title: '登录成功！',
          icon: 'success',
          duration: 1500
        })

        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }, 1500)

      } catch (error) {
        console.error('登录处理失败:', error)
        this.handleLoginError('登录处理失败，请重试')
      } finally {
        this.setData({ isLoading: false })
      }
    }, 1000)
  },

  // 游客登录处理
  handleGuestLogin() {
    if (this.data.isLoading) return

    this.setData({ isLoading: true })

    // 模拟延迟
    setTimeout(() => {
      try {
        // 构造游客用户信息
        const guestUser = {
          id: this.generateUserId(),
          nickname: '游客用户',
          avatar: '/images/default-avatar.png',
          loginTime: new Date().toISOString(),
          loginType: 'guest',
          isGuest: true
        }

        // 保存游客信息
        wx.setStorageSync('userInfo', guestUser)
        wx.setStorageSync('isLoggedIn', true)

        // 初始化游客数据
        this.initUserData(guestUser)

        wx.showToast({
          title: '进入游客模式',
          icon: 'success',
          duration: 1500
        })

        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }, 1500)

      } catch (error) {
        console.error('游客登录失败:', error)
        this.handleLoginError('游客登录失败，请重试')
      } finally {
        this.setData({ isLoading: false })
      }
    }, 500)
  },

  // 初始化用户数据
  initUserData(user) {
    // 初始化用户统计数据
    const userStats = {
      totalEnergy: 0,
      totalHabits: 0,
      completedHabits: 0,
      streakDays: 0,
      joinDate: new Date().toISOString(),
      lastActiveDate: new Date().toISOString()
    }

    wx.setStorageSync('userStats', userStats)

    // 初始化默认习惯（仅首次登录）
    const existingHabits = wx.getStorageSync('userHabits')
    if (!existingHabits || existingHabits.length === 0) {
      const defaultHabits = [
        {
          id: 1,
          name: '🌅 晨间阅读',
          description: '每天阅读30分钟，充实心灵',
          energy_value: 10,
          color: '#8B5CF6',
          category: '学习成长',
          created_at: new Date().toISOString(),
          is_active: true
        },
        {
          id: 2,
          name: '💪 健身锻炼',
          description: '保持身体健康，增强体魄',
          energy_value: 15,
          color: '#F59E0B',
          category: '健康生活',
          created_at: new Date().toISOString(),
          is_active: true
        }
      ]
      
      wx.setStorageSync('userHabits', defaultHabits)
    }

    console.log('用户数据初始化完成:', user.nickname)
  },

  // 生成用户ID
  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  },

  // 登录错误处理
  handleLoginError(message) {
    this.setData({ isLoading: false })
    
    wx.showModal({
      title: '登录失败',
      content: message,
      showCancel: false,
      confirmText: '确定',
      confirmColor: '#8B5CF6'
    })
  },

  // 显示用户协议
  showUserAgreement() {
    wx.showModal({
      title: '用户服务协议',
      content: '使用本应用即表示您同意我们的用户服务协议和隐私政策。我们承诺保护您的个人信息安全。',
      confirmText: '我同意',
      cancelText: '取消',
      confirmColor: '#8B5CF6',
      success: (res) => {
        if (res.confirm) {
          console.log('用户同意服务协议')
        }
      }
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '习惯飞轮 - 让每一份努力都精准浇灌你的目标',
      path: '/pages/auth/auth',
      imageUrl: '/images/share-login.png'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '习惯飞轮 - 开启你的成长之旅',
      query: '',
      imageUrl: '/images/timeline-share.png'
    }
  }
})

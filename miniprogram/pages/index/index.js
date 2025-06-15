
// index.js - 今日习惯页面逻辑
Page({
  data: {
    habits: [],
    totalEnergy: 0,
    streakDays: 0,
    showStats: true,
    completedHabits: new Set(),
    todayDate: '',
    isLoading: false
  },

  onLoad() {
    this.initPage()
  },

  onShow() {
    this.loadHabits()
    this.loadStats()
  },

  onPullDownRefresh() {
    this.loadHabits()
    this.loadStats()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  initPage() {
    // 设置今日日期
    const today = new Date()
    const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    
    this.setData({ 
      todayDate,
      isLoading: true 
    })

    // 加载数据
    this.loadHabits()
    this.loadStats()
    this.loadCompletedHabits()
  },

  loadHabits() {
    // 模拟API调用延迟
    setTimeout(() => {
      // 丰富的模拟数据，保持与Web版本一致的设计
      const habits = [
        { 
          id: 1, 
          name: '🌅 晨间阅读', 
          description: '每天阅读30分钟，充实心灵',
          energy_value: 10,
          color: '#8B5CF6',
          category: '学习成长'
        },
        { 
          id: 2, 
          name: '💪 健身锻炼', 
          description: '保持身体健康，增强体魄',
          energy_value: 15,
          color: '#F59E0B',
          category: '健康生活'
        },
        { 
          id: 3, 
          name: '🧘 冥想练习', 
          description: '静心冥想，提升专注力',
          energy_value: 8,
          color: '#10B981',
          category: '心理健康'
        },
        { 
          id: 4, 
          name: '📝 写作记录', 
          description: '记录思考，沉淀智慧',
          energy_value: 12,
          color: '#EF4444',
          category: '创意表达'
        }
      ]
      
      this.setData({ 
        habits,
        isLoading: false
      })
    }, 800)
  },

  loadStats() {
    // 从本地存储获取统计数据
    const totalEnergy = wx.getStorageSync('totalEnergy') || 0
    const streakDays = this.calculateStreakDays()
    
    this.setData({ 
      totalEnergy,
      streakDays,
      showStats: true
    })
  },

  loadCompletedHabits() {
    // 获取今日已完成的习惯
    const todayKey = `completed_${this.data.todayDate}`
    const completedToday = wx.getStorageSync(todayKey) || []
    
    this.setData({
      completedHabits: new Set(completedToday)
    })
  },

  calculateStreakDays() {
    // 计算连续打卡天数
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 30; i++) { // 检查最近30天
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      
      const dateKey = `completed_${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`
      const dayCompleted = wx.getStorageSync(dateKey) || []
      
      if (dayCompleted.length > 0) {
        streak++
      } else if (i > 0) { // 如果不是今天且没有完成，则中断
        break
      }
    }
    
    return streak
  },

  checkInHabit(e) {
    const habitId = e.currentTarget.dataset.id
    const habit = this.data.habits.find(h => h.id === habitId)
    
    if (!habit) return

    // 检查是否已完成
    if (this.data.completedHabits.has(habitId)) {
      wx.showToast({
        title: '今日已完成此习惯！',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 添加加载状态
    this.setData({
      [`habits[${this.data.habits.findIndex(h => h.id === habitId)}].isLoading`]: true
    })

    // 模拟API调用
    setTimeout(() => {
      this.completeHabit(habit)
    }, 500)
  },

  completeHabit(habit) {
    const { habitId } = habit
    const newTotalEnergy = this.data.totalEnergy + habit.energy_value
    const newCompletedHabits = new Set(this.data.completedHabits)
    newCompletedHabits.add(habit.id)

    // 更新本地存储
    wx.setStorageSync('totalEnergy', newTotalEnergy)
    
    // 保存今日完成记录
    const todayKey = `completed_${this.data.todayDate}`
    const completedToday = Array.from(newCompletedHabits)
    wx.setStorageSync(todayKey, completedToday)

    // 更新页面状态
    this.setData({
      totalEnergy: newTotalEnergy,
      completedHabits: newCompletedHabits,
      [`habits[${this.data.habits.findIndex(h => h.id === habit.id)}].isLoading`]: false
    })

    // 触觉反馈
    wx.vibrateShort({
      type: 'light'
    })

    // 成功提示with自定义样式
    wx.showToast({
      title: `🎉 +${habit.energy_value}⚡`,
      icon: 'success',
      duration: 2000,
      success: () => {
        // 播放音效（如果用户允许）
        wx.createInnerAudioContext?.({
          src: '/sounds/success.mp3',
          autoplay: true
        })
      }
    })

    // 检查是否完成所有习惯
    if (newCompletedHabits.size === this.data.habits.length) {
      setTimeout(() => {
        wx.showModal({
          title: '🎊 恭喜完成今日所有习惯！',
          content: '坚持就是胜利，明天继续加油！',
          showCancel: false,
          confirmText: '好的',
          confirmColor: '#8B5CF6'
        })
      }, 1000)
    }

    // 重新计算连续天数
    const newStreakDays = this.calculateStreakDays()
    this.setData({
      streakDays: newStreakDays
    })
  },

  // 判断习惯是否已完成
  isHabitCompleted(habitId) {
    return this.data.completedHabits.has(habitId)
  },

  // 获取完成进度
  getCompletionProgress() {
    const completed = this.data.completedHabits.size
    const total = this.data.habits.length
    return total > 0 ? Math.round((completed / total) * 100) : 0
  },

  // 分享功能
  onShareAppMessage() {
    const progress = this.getCompletionProgress()
    return {
      title: `我今天完成了${progress}%的习惯！一起来养成好习惯吧 🌟`,
      path: '/pages/index/index',
      imageUrl: '/images/share-image.png'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    const progress = this.getCompletionProgress()
    return {
      title: `习惯飞轮 - 今日完成度${progress}%`,
      query: '',
      imageUrl: '/images/timeline-share.png'
    }
  }
})

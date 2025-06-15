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
    // 获取活跃习惯（未归档的）
    const allHabits = wx.getStorageSync('userHabits') || []
    const activeHabits = allHabits.filter(habit => !habit.is_archived)
    
    // 获取奖励信息用于显示绑定状态
    const rewards = wx.getStorageSync('userRewards') || []
    
    // 增强习惯数据
    const enhancedHabits = activeHabits.map(habit => {
      let habitData = { ...habit }
      
      // 如果绑定了奖励，添加奖励信息
      if (habit.binding_reward_id) {
        const boundReward = rewards.find(r => r.id === habit.binding_reward_id)
        if (boundReward) {
          habitData.reward_name = boundReward.name
          habitData.reward_progress = boundReward.current_energy
          habitData.reward_cost = boundReward.energy_cost
          habitData.reward_percentage = Math.min(100, Math.round((boundReward.current_energy / boundReward.energy_cost) * 100))
        }
      }
      
      return habitData
    })
    
    this.setData({ 
      habits: enhancedHabits,
      isLoading: false
    })
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
    const newTotalEnergy = this.data.totalEnergy + habit.energy_value
    const newCompletedHabits = new Set(this.data.completedHabits)
    newCompletedHabits.add(habit.id)

    // 更新本地存储 - 总能量
    wx.setStorageSync('totalEnergy', newTotalEnergy)
    
    // 保存今日完成记录
    const todayKey = `completed_${this.data.todayDate}`
    const completedToday = Array.from(newCompletedHabits)
    wx.setStorageSync(todayKey, completedToday)

    // 更新绑定奖励的进度
    if (habit.binding_reward_id) {
      this.updateRewardProgress(habit.binding_reward_id, habit.energy_value)
    }

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

    // 成功提示
    wx.showToast({
      title: `🎉 +${habit.energy_value}⚡`,
      icon: 'success',
      duration: 2000
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

    // 重新加载习惯数据以更新奖励进度
    this.loadHabits()
  },

  // 更新奖励进度
  updateRewardProgress(rewardId, energyValue) {
    const allRewards = wx.getStorageSync('userRewards') || []
    const updatedRewards = allRewards.map(reward => {
      if (reward.id === rewardId && !reward.is_redeemed) {
        const newCurrentEnergy = (reward.current_energy || 0) + energyValue
        return {
          ...reward,
          current_energy: Math.min(newCurrentEnergy, reward.energy_cost), // 不超过目标能量
          updated_at: new Date().toISOString()
        }
      }
      return reward
    })
    
    wx.setStorageSync('userRewards', updatedRewards)
    
    // 检查是否达到兑换条件
    const updatedReward = updatedRewards.find(r => r.id === rewardId)
    if (updatedReward && updatedReward.current_energy >= updatedReward.energy_cost && !updatedReward.is_redeemed) {
      setTimeout(() => {
        wx.showModal({
          title: '🎁 奖励可兑换！',
          content: `恭喜！"${updatedReward.name}"已经可以兑换了！`,
          confirmText: '去兑换',
          cancelText: '稍后',
          confirmColor: '#F59E0B',
          success: (res) => {
            if (res.confirm) {
              wx.switchTab({
                url: '/pages/rewards/rewards'
              })
            }
          }
        })
      }, 1500)
    }
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

  // 跳转到习惯管理页面
  goToHabitsPage() {
    wx.switchTab({
      url: '/pages/habits/habits'
    })
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

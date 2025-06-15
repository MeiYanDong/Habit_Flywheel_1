
// index.js
Page({
  data: {
    habits: [],
    totalEnergy: 0,
    streakDays: 0,
    showStats: true
  },

  onLoad() {
    this.loadHabits()
    this.loadStats()
  },

  onShow() {
    this.loadHabits()
    this.loadStats()
  },

  loadHabits() {
    // 模拟数据，实际应该从服务器获取
    const habits = [
      { id: 1, name: '晨间阅读', energy_value: 10 },
      { id: 2, name: '健身锻炼', energy_value: 15 },
      { id: 3, name: '冥想练习', energy_value: 8 }
    ]
    
    this.setData({ habits })
  },

  loadStats() {
    // 模拟统计数据
    const totalEnergy = wx.getStorageSync('totalEnergy') || 0
    const streakDays = wx.getStorageSync('streakDays') || 0
    
    this.setData({ 
      totalEnergy,
      streakDays 
    })
  },

  checkInHabit(e) {
    const habitId = e.currentTarget.dataset.id
    const habit = this.data.habits.find(h => h.id === habitId)
    
    if (habit) {
      // 更新能量值
      const newTotalEnergy = this.data.totalEnergy + habit.energy_value
      wx.setStorageSync('totalEnergy', newTotalEnergy)
      
      // 显示成功提示
      wx.showToast({
        title: `+${habit.energy_value}⚡ 打卡成功!`,
        icon: 'success',
        duration: 2000
      })
      
      // 更新页面数据
      this.setData({
        totalEnergy: newTotalEnergy
      })
    }
  }
})

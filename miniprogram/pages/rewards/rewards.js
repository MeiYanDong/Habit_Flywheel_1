
// rewards.js - 奖励管理页面逻辑
Page({
  data: {
    rewards: [],
    filteredRewards: [],
    totalEnergy: 0,
    todayEnergy: 0,
    filterType: 'all',
    showRewardForm: false,
    showHabitsModal: false,
    isEditing: false,
    editingId: null,
    selectedRewardHabits: [],
    
    // 表单数据
    formData: {
      name: '',
      description: '',
      energy_cost: 100
    }
  },

  onLoad() {
    this.loadRewards()
    this.loadEnergyData()
  },

  onShow() {
    this.loadRewards()
    this.loadEnergyData()
  },

  // 加载奖励数据
  loadRewards() {
    const rewards = wx.getStorageSync('userRewards') || []
    const habits = wx.getStorageSync('userHabits') || []
    
    // 增强奖励数据
    const enhancedRewards = rewards.map(reward => {
      const progressPercentage = Math.min(100, Math.round((reward.current_energy / reward.energy_cost) * 100))
      
      // 获取绑定的习惯
      const boundHabits = habits.filter(habit => habit.binding_reward_id === reward.id)
      
      // 确定状态
      let status = 'progress'
      if (reward.is_redeemed) {
        status = 'redeemed'
      } else if (progressPercentage >= 100) {
        status = 'available'
      }
      
      return {
        ...reward,
        progressPercentage,
        boundHabits,
        status,
        redeemed_date: reward.redeemed_at ? new Date(reward.redeemed_at).toLocaleDateString() : null
      }
    })
    
    this.setData({
      rewards: enhancedRewards
    })
    
    this.applyFilter()
  },

  // 加载能量数据
  loadEnergyData() {
    const totalEnergy = wx.getStorageSync('totalEnergy') || 0
    
    // 计算今日获得的能量
    const today = new Date().toISOString().split('T')[0]
    const todayKey = `completed_${today}`
    const todayCompleted = wx.getStorageSync(todayKey) || []
    const habits = wx.getStorageSync('userHabits') || []
    
    const todayEnergy = todayCompleted.reduce((total, habitId) => {
      const habit = habits.find(h => h.id === habitId)
      return total + (habit ? habit.energy_value : 0)
    }, 0)
    
    this.setData({
      totalEnergy,
      todayEnergy
    })
  },

  // 切换筛选
  switchFilter(e) {
    const filterType = e.currentTarget.dataset.type
    this.setData({ filterType })
    this.applyFilter()
  },

  // 应用筛选
  applyFilter() {
    const { rewards, filterType } = this.data
    let filteredRewards = []
    
    switch (filterType) {
      case 'all':
        filteredRewards = rewards
        break
      case 'available':
        filteredRewards = rewards.filter(r => r.status === 'available')
        break
      case 'progress':
        filteredRewards = rewards.filter(r => r.status === 'progress')
        break
      case 'redeemed':
        filteredRewards = rewards.filter(r => r.status === 'redeemed')
        break
    }
    
    this.setData({ filteredRewards })
  },

  // 显示添加奖励表单
  showAddRewardForm() {
    this.setData({
      showRewardForm: true,
      isEditing: false,
      editingId: null,
      formData: {
        name: '',
        description: '',
        energy_cost: 100
      }
    })
  },

  // 隐藏表单
  hideRewardForm() {
    this.setData({
      showRewardForm: false
    })
  },

  // 阻止冒泡
  preventClose() {
    // 阻止点击模态框内容时关闭
  },

  // 编辑奖励
  editReward(e) {
    const rewardId = e.currentTarget.dataset.id
    const reward = this.data.rewards.find(r => r.id === rewardId)
    
    if (reward) {
      this.setData({
        showRewardForm: true,
        isEditing: true,
        editingId: rewardId,
        formData: {
          name: reward.name,
          description: reward.description || '',
          energy_cost: reward.energy_cost
        }
      })
    }
  },

  // 删除奖励
  deleteReward(e) {
    const rewardId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '删除后将无法恢复，确定要删除这个奖励吗？',
      confirmText: '删除',
      cancelText: '取消',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          this.performDeleteReward(rewardId)
        }
      }
    })
  },

  // 执行删除操作
  performDeleteReward(rewardId) {
    const allRewards = wx.getStorageSync('userRewards') || []
    const updatedRewards = allRewards.filter(reward => reward.id !== rewardId)
    
    // 解除相关习惯的绑定
    const allHabits = wx.getStorageSync('userHabits') || []
    const updatedHabits = allHabits.map(habit => {
      if (habit.binding_reward_id === rewardId) {
        return { ...habit, binding_reward_id: null }
      }
      return habit
    })
    
    wx.setStorageSync('userRewards', updatedRewards)
    wx.setStorageSync('userHabits', updatedHabits)
    
    this.loadRewards()
    
    wx.showToast({
      title: '奖励已删除',
      icon: 'success',
      duration: 2000
    })
  },

  // 兑换奖励
  redeemReward(e) {
    const rewardId = e.currentTarget.dataset.id
    const reward = this.data.rewards.find(r => r.id === rewardId)
    
    if (!reward) return
    
    if (this.data.totalEnergy < reward.energy_cost) {
      wx.showModal({
        title: '能量不足',
        content: `需要 ${reward.energy_cost}⚡，当前只有 ${this.data.totalEnergy}⚡`,
        showCancel: false,
        confirmText: '继续努力',
        confirmColor: '#8B5CF6'
      })
      return
    }
    
    wx.showModal({
      title: '确认兑换',
      content: `确定要花费 ${reward.energy_cost}⚡ 兑换"${reward.name}"吗？`,
      confirmText: '确认兑换',
      cancelText: '再想想',
      confirmColor: '#10B981',
      success: (res) => {
        if (res.confirm) {
          this.performRedeemReward(rewardId)
        }
      }
    })
  },

  // 执行兑换操作
  performRedeemReward(rewardId) {
    const allRewards = wx.getStorageSync('userRewards') || []
    const reward = allRewards.find(r => r.id === rewardId)
    
    if (!reward) return
    
    // 更新奖励状态
    const updatedRewards = allRewards.map(r => {
      if (r.id === rewardId) {
        return {
          ...r,
          is_redeemed: true,
          redeemed_at: new Date().toISOString()
        }
      }
      return r
    })
    
    // 扣除能量
    const newTotalEnergy = this.data.totalEnergy - reward.energy_cost
    
    wx.setStorageSync('userRewards', updatedRewards)
    wx.setStorageSync('totalEnergy', newTotalEnergy)
    
    this.loadRewards()
    this.loadEnergyData()
    
    // 触觉反馈
    wx.vibrateShort({
      type: 'heavy'
    })
    
    wx.showModal({
      title: '🎉 兑换成功！',
      content: `恭喜您成功兑换"${reward.name}"！继续保持好习惯吧！`,
      showCancel: false,
      confirmText: '太棒了',
      confirmColor: '#10B981'
    })
  },

  // 显示绑定习惯
  showBoundHabits(e) {
    const rewardId = e.currentTarget.dataset.id
    const reward = this.data.rewards.find(r => r.id === rewardId)
    
    if (reward && reward.boundHabits.length > 0) {
      this.setData({
        selectedRewardHabits: reward.boundHabits,
        showHabitsModal: true
      })
    } else {
      wx.showModal({
        title: '没有绑定习惯',
        content: '此奖励还没有绑定任何习惯。请在绑定管理页面设置习惯绑定。',
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#8B5CF6'
      })
    }
  },

  // 隐藏习惯模态框
  hideHabitsModal() {
    this.setData({
      showHabitsModal: false,
      selectedRewardHabits: []
    })
  },

  // 去今日习惯页面
  goToTodayHabits() {
    this.hideHabitsModal()
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 表单输入处理
  onFormInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [`formData.${field}`]: field === 'energy_cost' ? parseInt(value) || 1 : value
    })
  },

  // 提交表单
  submitRewardForm(e) {
    const { formData, isEditing, editingId } = this.data
    
    // 验证必填字段
    if (!formData.name || !formData.energy_cost) {
      wx.showToast({
        title: '请填写必填字段',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    // 验证能量成本范围
    if (formData.energy_cost < 1 || formData.energy_cost > 10000) {
      wx.showToast({
        title: '能量成本应在1-10000之间',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    const allRewards = wx.getStorageSync('userRewards') || []
    
    if (isEditing) {
      // 更新现有奖励
      const updatedRewards = allRewards.map(reward => {
        if (reward.id === editingId) {
          return {
            ...reward,
            ...formData,
            updated_at: new Date().toISOString()
          }
        }
        return reward
      })
      
      wx.setStorageSync('userRewards', updatedRewards)
      
      wx.showToast({
        title: '奖励已更新',
        icon: 'success',
        duration: 2000
      })
    } else {
      // 创建新奖励
      const newReward = {
        id: Date.now(),
        ...formData,
        current_energy: 0,
        is_redeemed: false,
        redeemed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const updatedRewards = [newReward, ...allRewards]
      wx.setStorageSync('userRewards', updatedRewards)
      
      wx.showToast({
        title: '奖励创建成功',
        icon: 'success',
        duration: 2000
      })
    }
    
    this.hideRewardForm()
    this.loadRewards()
  },

  // 获取空状态标题
  getEmptyTitle(filterType) {
    const titles = {
      all: '还没有添加奖励',
      available: '暂无可兑换奖励',
      progress: '暂无进行中奖励',
      redeemed: '还没有兑换过奖励'
    }
    return titles[filterType] || '暂无数据'
  },

  // 获取空状态描述
  getEmptyDescription(filterType) {
    const descriptions = {
      all: '开始添加您的第一个奖励，设定目标吧！',
      available: '继续完成习惯，积累能量来兑换奖励！',
      progress: '所有奖励都已兑换或还未开始',
      redeemed: '完成更多习惯，兑换心仪的奖励！'
    }
    return descriptions[filterType] || ''
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: `我在习惯飞轮设置了${this.data.rewards.length}个奖励目标！`,
      path: '/pages/rewards/rewards',
      imageUrl: '/images/share-rewards.png'
    }
  }
})

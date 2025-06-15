
// habits.js - 习惯管理页面逻辑
Page({
  data: {
    activeHabits: [],
    archivedHabits: [],
    showStats: true,
    showArchived: false,
    showHabitForm: false,
    showBindingModal: false,
    isEditing: false,
    editingId: null,
    totalEnergy: 0,
    selectedHabitId: null,
    availableRewards: [],
    
    // 筛选选项
    filterOptions: ['全部习惯', '活跃习惯', '已归档'],
    filterIndex: 1,
    
    // 颜色选项
    colorOptions: [
      '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', 
      '#3B82F6', '#EC4899', '#14B8A6', '#F97316'
    ],
    
    // 表单数据
    formData: {
      name: '',
      description: '',
      energy_value: 10,
      color: '#8B5CF6'
    }
  },

  onLoad() {
    this.loadHabits()
    this.loadStats()
  },

  onShow() {
    this.loadHabits()
    this.loadStats()
  },

  // 加载习惯数据
  loadHabits() {
    const allHabits = wx.getStorageSync('userHabits') || []
    
    const activeHabits = allHabits.filter(habit => !habit.is_archived)
    const archivedHabits = allHabits.filter(habit => habit.is_archived)
    
    // 加载绑定的奖励信息
    const rewards = wx.getStorageSync('userRewards') || []
    const enhancedActiveHabits = activeHabits.map(habit => {
      if (habit.binding_reward_id) {
        const reward = rewards.find(r => r.id === habit.binding_reward_id)
        if (reward) {
          return {
            ...habit,
            reward_name: reward.name,
            reward_cost: reward.energy_cost,
            progress: reward.current_energy,
            progress_percentage: Math.min(100, Math.round((reward.current_energy / reward.energy_cost) * 100))
          }
        }
      }
      return habit
    })
    
    this.setData({
      activeHabits: enhancedActiveHabits,
      archivedHabits
    })
  },

  // 加载统计数据
  loadStats() {
    const totalEnergy = wx.getStorageSync('totalEnergy') || 0
    this.setData({ totalEnergy })
  },

  // 筛选变化
  onFilterChange(e) {
    const filterIndex = parseInt(e.detail.value)
    this.setData({ filterIndex })
    this.applyFilter(filterIndex)
  },

  // 应用筛选
  applyFilter(filterIndex) {
    const allHabits = wx.getStorageSync('userHabits') || []
    
    switch (filterIndex) {
      case 0: // 全部习惯
        this.setData({
          activeHabits: allHabits.filter(h => !h.is_archived),
          archivedHabits: allHabits.filter(h => h.is_archived),
          showArchived: true
        })
        break
      case 1: // 活跃习惯
        this.setData({
          activeHabits: allHabits.filter(h => !h.is_archived),
          showArchived: false
        })
        break
      case 2: // 已归档
        this.setData({
          archivedHabits: allHabits.filter(h => h.is_archived),
          showArchived: true
        })
        break
    }
  },

  // 切换归档区域显示
  toggleArchivedSection() {
    this.setData({
      showArchived: !this.data.showArchived
    })
  },

  // 显示添加习惯表单
  showAddHabitForm() {
    this.setData({
      showHabitForm: true,
      isEditing: false,
      editingId: null,
      formData: {
        name: '',
        description: '',
        energy_value: 10,
        color: '#8B5CF6'
      }
    })
  },

  // 隐藏表单
  hideHabitForm() {
    this.setData({
      showHabitForm: false
    })
  },

  // 阻止冒泡
  preventClose() {
    // 阻止点击模态框内容时关闭
  },

  // 编辑习惯
  editHabit(e) {
    const habitId = e.currentTarget.dataset.id
    const habit = this.data.activeHabits.find(h => h.id === habitId)
    
    if (habit) {
      this.setData({
        showHabitForm: true,
        isEditing: true,
        editingId: habitId,
        formData: {
          name: habit.name,
          description: habit.description || '',
          energy_value: habit.energy_value,
          color: habit.color || '#8B5CF6'
        }
      })
    }
  },

  // 管理绑定
  manageBinding(e) {
    const habitId = e.currentTarget.dataset.id
    const rewards = wx.getStorageSync('userRewards') || []
    const availableRewards = rewards.filter(r => !r.is_redeemed)
    
    this.setData({
      showBindingModal: true,
      selectedHabitId: habitId,
      availableRewards
    })
  },

  // 隐藏绑定模态框
  hideBindingModal() {
    this.setData({
      showBindingModal: false,
      selectedHabitId: null,
      availableRewards: []
    })
  },

  // 绑定奖励
  bindToReward(e) {
    const rewardId = e.currentTarget.dataset.id
    const habitId = this.data.selectedHabitId
    
    if (!habitId) return
    
    const allHabits = wx.getStorageSync('userHabits') || []
    const updatedHabits = allHabits.map(habit => {
      if (habit.id === habitId) {
        return {
          ...habit,
          binding_reward_id: rewardId,
          updated_at: new Date().toISOString()
        }
      }
      return habit
    })
    
    wx.setStorageSync('userHabits', updatedHabits)
    
    const reward = this.data.availableRewards.find(r => r.id === rewardId)
    const habit = allHabits.find(h => h.id === habitId)
    
    wx.showToast({
      title: `绑定成功！`,
      icon: 'success',
      duration: 2000
    })
    
    this.hideBindingModal()
    this.loadHabits()
  },

  // 解除绑定
  unbindReward(e) {
    const habitId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认解绑',
      content: '确定要解除此习惯与奖励的绑定关系吗？',
      confirmText: '解绑',
      cancelText: '取消',
      confirmColor: '#F59E0B',
      success: (res) => {
        if (res.confirm) {
          this.performUnbindReward(habitId)
        }
      }
    })
  },

  // 执行解绑操作
  performUnbindReward(habitId) {
    const allHabits = wx.getStorageSync('userHabits') || []
    const updatedHabits = allHabits.map(habit => {
      if (habit.id === habitId) {
        return {
          ...habit,
          binding_reward_id: null,
          updated_at: new Date().toISOString()
        }
      }
      return habit
    })
    
    wx.setStorageSync('userHabits', updatedHabits)
    
    wx.showToast({
      title: '绑定已解除',
      icon: 'success',
      duration: 2000
    })
    
    this.loadHabits()
  },

  // 归档习惯
  archiveHabit(e) {
    const habitId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认归档',
      content: '归档后的习惯将不会出现在今日习惯中，确定要归档吗？',
      confirmText: '归档',
      cancelText: '取消',
      confirmColor: '#F59E0B',
      success: (res) => {
        if (res.confirm) {
          this.performArchiveHabit(habitId)
        }
      }
    })
  },

  // 执行归档操作
  performArchiveHabit(habitId) {
    const allHabits = wx.getStorageSync('userHabits') || []
    const updatedHabits = allHabits.map(habit => {
      if (habit.id === habitId) {
        return {
          ...habit,
          is_archived: true,
          archived_date: new Date().toLocaleDateString()
        }
      }
      return habit
    })
    
    wx.setStorageSync('userHabits', updatedHabits)
    this.loadHabits()
    
    wx.showToast({
      title: '习惯已归档',
      icon: 'success',
      duration: 2000
    })
  },

  // 恢复习惯
  restoreHabit(e) {
    const habitId = e.currentTarget.dataset.id
    const allHabits = wx.getStorageSync('userHabits') || []
    const updatedHabits = allHabits.map(habit => {
      if (habit.id === habitId) {
        return {
          ...habit,
          is_archived: false,
          archived_date: null
        }
      }
      return habit
    })
    
    wx.setStorageSync('userHabits', updatedHabits)
    this.loadHabits()
    
    wx.showToast({
      title: '习惯已恢复',
      icon: 'success',
      duration: 2000
    })
  },

  // 删除习惯
  deleteHabit(e) {
    const habitId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '删除后将无法恢复，确定要删除这个习惯吗？',
      confirmText: '删除',
      cancelText: '取消',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          this.performDeleteHabit(habitId)
        }
      }
    })
  },

  // 执行删除操作
  performDeleteHabit(habitId) {
    const allHabits = wx.getStorageSync('userHabits') || []
    const updatedHabits = allHabits.filter(habit => habit.id !== habitId)
    
    wx.setStorageSync('userHabits', updatedHabits)
    this.loadHabits()
    
    wx.showToast({
      title: '习惯已删除',
      icon: 'success',
      duration: 2000
    })
  },

  // 表单输入处理
  onFormInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [`formData.${field}`]: field === 'energy_value' ? parseInt(value) || 1 : value
    })
  },

  // 选择颜色
  selectColor(e) {
    const color = e.currentTarget.dataset.color
    this.setData({
      'formData.color': color
    })
  },

  // 提交表单
  submitHabitForm(e) {
    const { formData, isEditing, editingId } = this.data
    
    // 验证必填字段
    if (!formData.name || !formData.energy_value) {
      wx.showToast({
        title: '请填写必填字段',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    // 验证能量值范围
    if (formData.energy_value < 1 || formData.energy_value > 50) {
      wx.showToast({
        title: '能量值应在1-50之间',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    const allHabits = wx.getStorageSync('userHabits') || []
    
    if (isEditing) {
      // 更新现有习惯
      const updatedHabits = allHabits.map(habit => {
        if (habit.id === editingId) {
          return {
            ...habit,
            ...formData,
            updated_at: new Date().toISOString()
          }
        }
        return habit
      })
      
      wx.setStorageSync('userHabits', updatedHabits)
      
      wx.showToast({
        title: '习惯已更新',
        icon: 'success',
        duration: 2000
      })
    } else {
      // 创建新习惯
      const newHabit = {
        id: Date.now(),
        ...formData,
        is_archived: false,
        binding_reward_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const updatedHabits = [newHabit, ...allHabits]
      wx.setStorageSync('userHabits', updatedHabits)
      
      wx.showToast({
        title: '习惯创建成功',
        icon: 'success',
        duration: 2000
      })
    }
    
    this.hideHabitForm()
    this.loadHabits()
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: `我在习惯飞轮管理了${this.data.activeHabits.length}个习惯！`,
      path: '/pages/habits/habits',
      imageUrl: '/images/share-habits.png'
    }
  }
})

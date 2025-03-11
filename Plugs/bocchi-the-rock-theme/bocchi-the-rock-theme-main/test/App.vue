<template>
  <div class="app-container">
    <header class="header">
      <h1>{{ title }}</h1>
      <nav>
        <router-link 
          v-for="item in menuItems"
          :key="item.id"
          :to="item.path"
          :class="{ active: currentPath === item.path }"
        >
          {{ item.name }}
        </router-link>
      </nav>
    </header>

    <main class="main-content">
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>
    </main>

    <data-table
      :data="tableData"
      :columns="columns"
      @row-click="handleRowClick"
    >
      <template #header="{ column }">
        <span :class="column.className">{{ column.label }}</span>
      </template>
      
      <template #cell-action="{ row }">
        <button @click.stop="editItem(row)">编辑</button>
        <button @click.stop="deleteItem(row)">删除</button>
      </template>
    </data-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from './components/DataTable.vue'
import { useStore } from './store'
import type { MenuItem, TableColumn } from './types'

export default defineComponent({
  name: 'App',
  
  components: {
    DataTable
  },
  
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const title = ref('测试应用')
    const menuItems = ref<MenuItem[]>([
      { id: 1, name: '首页', path: '/' },
      { id: 2, name: '关于', path: '/about' }
    ])
    
    const currentPath = computed(() => router.currentRoute.value.path)
    
    const tableData = ref([
      { id: 1, name: '测试1', status: 'active' },
      { id: 2, name: '测试2', status: 'inactive' }
    ])
    
    const columns: TableColumn[] = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: '名称' },
      { key: 'status', label: '状态' },
      { key: 'action', label: '操作' }
    ]
    
    const handleRowClick = (row: any) => {
      console.log('点击行:', row)
    }
    
    const editItem = (row: any) => {
      store.dispatch('editItem', row)
    }
    
    const deleteItem = async (row: any) => {
      try {
        await store.dispatch('deleteItem', row.id)
        tableData.value = tableData.value.filter(item => item.id !== row.id)
      } catch (error) {
        console.error('删除失败:', error)
      }
    }
    
    return {
      title,
      menuItems,
      currentPath,
      tableData,
      columns,
      handleRowClick,
      editItem,
      deleteItem
    }
  }
})
</script>

<style lang="scss">
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h1 {
      font-size: 24px;
      color: var(--primary-color);
    }
    
    nav {
      .router-link {
        margin-left: 15px;
        
        &.active {
          color: var(--primary-color);
          font-weight: bold;
        }
      }
    }
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
}
</style> 
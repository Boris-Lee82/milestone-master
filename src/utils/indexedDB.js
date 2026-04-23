/**
 * IndexedDB 数据库工具类
 * 用于持久化存储项目里程碑管理系统数据
 */

class IndexedDBHelper {
  constructor(dbName = 'MilestoneMasterDB', version = 1) {
    this.dbName = dbName
    this.version = version
    this.db = null
  }

  /**
   * 初始化数据库
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        reject(new Error('无法打开数据库'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // 创建各个对象存储空间
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' })
          projectStore.createIndex('name', 'name', { unique: true })
        }

        if (!db.objectStoreNames.contains('owners')) {
          const ownerStore = db.createObjectStore('owners', { keyPath: 'id' })
          ownerStore.createIndex('name', 'name', { unique: true })
        }

        if (!db.objectStoreNames.contains('milestones')) {
          const milestoneStore = db.createObjectStore('milestones', { keyPath: 'id' })
          milestoneStore.createIndex('projectId', 'projectId', { unique: true })
        }

        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' })
          taskStore.createIndex('projectId', 'projectId', { unique: false })
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
        }
      }
    })
  }

  /**
   * 获取所有数据
   */
  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error(`获取${storeName}数据失败`))
    })
  }

  /**
   * 获取单个数据
   */
  async get(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error(`获取${storeName}数据失败`))
    })
  }

  /**
   * 添加数据
   */
  async add(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.add(data)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => {
        console.error(`添加${storeName}数据失败:`, data)
        console.error('错误详情:', request.error)
        reject(new Error(`添加${storeName}数据失败: ${request.error?.message || '未知错误'}`))
      }
    })
  }

  /**
   * 批量添加数据
   */
  async addBatch(storeName, dataArray) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)

      dataArray.forEach(data => {
        store.add(data)
      })

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(new Error(`批量添加${storeName}数据失败`))
    })
  }

  /**
   * 更新数据
   */
  async put(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => {
        console.error(`更新${storeName}数据失败:`, data)
        console.error('错误详情:', request.error)
        reject(new Error(`更新${storeName}数据失败: ${request.error?.message || '未知错误'}`))
      }
    })
  }

  /**
   * 删除数据
   */
  async delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error(`删除${storeName}数据失败`))
    })
  }

  /**
   * 清空存储空间
   */
  async clear(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error(`清空${storeName}数据失败`))
    })
  }

  /**
   * 通过索引查询
   */
  async getByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.get(value)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error(`通过索引查询${storeName}数据失败`))
    })
  }

  /**
   * 通过索引查询所有匹配项
   */
  async getAllByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll(value)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error(`通过索引查询${storeName}数据失败`))
    })
  }

  /**
   * 保存设置
   */
  async saveSetting(key, value) {
    return this.put('settings', { key, value })
  }

  /**
   * 获取设置
   */
  async getSetting(key) {
    const result = await this.get('settings', key)
    return result ? result.value : null
  }

  /**
   * 关闭数据库连接
   */
  close() {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  /**
   * 删除数据库
   */
  async deleteDatabase() {
    return new Promise((resolve, reject) => {
      this.close()
      const request = indexedDB.deleteDatabase(this.dbName)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('删除数据库失败'))
    })
  }
}

// 创建单例实例
const dbHelper = new IndexedDBHelper()

export default dbHelper

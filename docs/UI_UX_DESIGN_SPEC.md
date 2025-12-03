# 鹤山薪酬管理系统 - UI/UX 设计规范

## 🎨 设计系统概览

基于 **Tailwind CSS** 构建的现代企业管理系统界面，风格简洁专业，注重数据可读性。

---

## 1. 色彩系统

### 主色调
- **品牌色**: Indigo (`indigo-600`, `indigo-500`)
- **强调色**: Sky Blue (`sky-500`, `sky-600`) 
- **成功色**: Emerald (`emerald-500`, `emerald-600`)
- **警告色**: Amber (`amber-500`, `amber-600`)
- **组织色**: Purple (`purple-500`, `purple-600`)

### 中性色
- **深色文本**: `slate-800` (标题), `slate-700` (正文)
- **浅色文本**: `slate-500` (说明), `slate-400` (辅助)
- **边框**: `slate-200`, `slate-300`
- **背景**: `slate-50`, `slate-100`, `white`

### 状态色
```typescript
状态徽章配色：
- active (正式在职): emerald-100/emerald-800
- probation (试用期): amber-100/amber-800  
- leave (休假中): blue-100/blue-800
- terminated (已离职): slate-100/slate-500
```

### 数据可视化配色
- 基础工资: `slate-400` (#94a3b8)
- 奖金/修正： `sky-500` (#0ea5e9)
- 工时权重: `amber-500`
- 基础分权重: `purple-500`

---

## 2. 布局规范

### 容器间距
```css
页面整体: space-y-6 (24px 垂直间距)
卡片内部: p-6 (24px padding)
小组件: p-4 (16px padding)
```

### 网格系统
```tsx
// 响应式网格 - 指标卡片
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6

// 两列布局
grid grid-cols-1 lg:grid-cols-2 gap-6

// 表单双列
grid grid-cols-2 gap-4
```

### 卡片样式
```tsx
标准卡片:
className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"

带动画卡片:
className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
```

---

## 3. 字体排版

### 标题层级
```tsx
H1 (页面标题): text-2xl font-bold text-slate-800
H2 (区块标题): text-xl font-bold text-slate-800
H3 (卡片标题): text-lg font-bold text-slate-800
H4 (小标题): text-sm font-bold text-slate-500 uppercase
```

### 正文文本
```tsx
普通文本: text-slate-700
说明文字: text-slate-500
辅助信息: text-xs text-slate-400
```

### 数值显示
```tsx
大数字: text-2xl font-bold
小数字: font-semibold
单位: text-sm text-slate-400
```

---

## 4. 组件模式

### 指标卡片 (MetricCard)
```tsx
<MetricCard 
  label="标签" 
  value="数值" 
  icon={IconComponent} 
  color="indigo|emerald|blue|amber"
/>

特征：
- 渐变背景图标
- 大号数值显示
- 圆角 rounded-xl
- 边框 border-slate-200
```

### 按钮样式
```tsx
主按钮:
"px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg"

次要按钮:
"px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"

危险按钮:
"px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"

图标按钮:
"p-2 hover:bg-slate-100 rounded transition-colors"
```

### 输入框
```tsx
标准输入:
"w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"

数字输入:
"w-full text-lg font-bold border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-blue-600"
```

### 状态徽章
```tsx
<StatusBadge status="active|probation|leave|terminated" />

样式: px-2.5 py-0.5 rounded-full text-xs font-medium border
```

### 数据卡片
```tsx
员工卡片：
- 背景: bg-white
- 边框: border border-slate-200
- 圆角: rounded-lg
- 阴影: shadow-sm
- 悬停: hover:shadow-md transition-shadow
- 内边距: p-4
```

---

## 5. 图表样式

### Recharts 配置
```tsx
<CartesianGrid 
  strokeDasharray="3 3" 
  vertical={false} 
  stroke="#e2e8f0" 
/>

<XAxis 
  stroke="#64748b" 
  fontSize={12} 
  tickLine={false} 
  axisLine={false} 
/>

<YAxis 
  stroke="#64748b" 
  fontSize={12} 
  tickLine={false} 
  axisLine={false} 
/>

<Tooltip 
  cursor={{fill: '#f1f5f9'}}
  contentStyle={{ 
    borderRadius: '8px', 
    border: 'none', 
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
  }}
/>

<Bar 
  fill="#0ea5e9" 
  radius={[4, 4, 0, 0]} 
  isAnimationActive={false} 
/>
```

---

## 6. 交互动画

### 过渡效果
```tsx
页面淡入: animate-fade-in
按钮悬停: transition-colors
卡片悬停: hover:shadow-md transition-shadow
```

### 进度条
```tsx
<div className="w-full bg-slate-100 rounded-full h-3">
  <div 
    className="bg-amber-500 h-3 rounded-full" 
    style={{ width: `${percentage}%` }}
  />
</div>
```

---

## 7. 图标使用

### Lucid-React 图标库
```tsx
常用图标：
- Coins: 薪酬相关
- Users: 人员相关
- TrendingUp: 趋势/增长
- Package: 生产/库存
- HardHat: 工段/生产
- Activity: 活动/统计
- Calendar: 日期
- Phone: 联系方式
- CreditCard: 分数/积分
- Edit3: 编辑
- Trash2: 删除
- Plus: 添加
- Search: 搜索
- Filter: 筛选
```

图标尺寸：
- 小号: size={16}
- 中号: size={20}
- 大号: size={24}
- 超大: size={48}

---

## 8. 表单设计

### 表单布局
```tsx
<form className="p-6 space-y-6">
  {/* 分组标题 */}
  <h3 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
    <Icon size={16} /> 基本信息
  </h3>
  
  {/* 双列网格 */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        字段名 <span className="text-red-500">*</span>
      </label>
      <input className="..." />
    </div>
  </div>
</form>
```

### 模态框
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in flex flex-col">
    {/* 标题栏 */}
    <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
      <h2 className="text-xl font-bold text-slate-800">标题</h2>
      <button>关闭</button>
    </div>
    {/* 内容 */}
    <div className="p-6">...</div>
  </div>
</div>
```

---

## 9. 响应式设计

### 断点系统 (Tailwind 默认)
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

### 常用模式
```tsx
// 移动优先
<div className="flex flex-col sm:flex-row">

// 网格响应
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// 间距响应
<div className="gap-4 lg:gap-6">
```

---

## 10. 滚动条样式

### 自定义滚动条
```css
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
```

---

## 11. 页面模板

### 标准页面结构
```tsx
<div className="space-y-6 animate-fade-in">
  {/* 页面头部 */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold text-slate-800">页面标题</h1>
      <p className="text-slate-500">副标题或说明</p>
    </div>
    <button>操作按钮</button>
  </div>

  {/* 指标卡片区 */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <MetricCard ... />
  </div>

  {/* 主要内容区 */}
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    ...
  </div>

  {/* 次要内容区 */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      ...
    </div>
  </div>
</div>
```

---

## 12. 设计原则

### 一致性
- 所有页面使用相同的间距系统
- 统一的卡片样式和圆角半径
- 一致的颜色语义

### 层次感
- 使用阴影区分层级 (shadow-sm → shadow-md)
- 通过字体大小建立视觉层次
- 用颜色深浅区分重要性

### 可读性
- 主要文本使用 slate-700/800
- 保持足够的对比度
- 数据可视化使用易区分的颜色

### 响应式
- 移动优先设计
- 网格自动适配
- 合理的断点使用

---

## 🎯 使用指南

当您需要新页面时，只需告诉我：
1. 页面的功能（如"员工考勤录入"）
2. 需要展示的数据
3. 需要的交互功能

我会根据这套设计规范，生成：
- ✅ 风格统一的界面
- ✅ 复用现有组件
- ✅ 符合响应式要求
- ✅ 保持交互一致性
- ✅ 开箱即用的代码

---

**下次您只需要说："添加一个 XX 页面"，我就能完美匹配您的设计风格！** 🎨

# 鹤山薪酬管理系统 - UI/UX 设计规范 V2.0

> 🎨 基于 **Material Design 3**、**Radix UI** 和 **Tailwind CSS** 最佳实践重新设计

---

## 1. 设计理念

### 核心原则
| 原则 | 说明 |
|------|------|
| **语义化色彩** | 颜色具有明确的功能含义，而非装饰 |
| **层次分明** | 通过 Surface 层级系统建立视觉深度 |
| **一致性** | 相同功能使用相同的视觉语言 |
| **无障碍优先** | 所有配色满足 WCAG 2.1 AA 对比度标准 (≥4.5:1) |
| **暗色模式就绪** | 色彩系统支持明暗主题无缝切换 |

---

## 2. 色彩系统 (Color Roles)

### 2.1 主题色 (Accent Colors)

采用 **12 级色阶** 系统，每个颜色有明确的用途：

```
级别 1-2:  背景色 (Backgrounds)
级别 3-5:  交互组件状态 (Interactive states)
级别 6-8:  边框和分隔线 (Borders)
级别 9-10: 实色填充 (Solid fills)
级别 11-12: 文本色 (Text)
```

### 主色调 - Indigo (品牌色)
```css
/* 推荐使用 Tailwind 类名 */
--primary-bg:       indigo-50   /* 极浅背景 */
--primary-bg-hover: indigo-100  /* 悬停背景 */
--primary-border:   indigo-200  /* 边框 */
--primary-solid:    indigo-600  /* 主按钮填充 */
--primary-solid-hover: indigo-700  /* 主按钮悬停 */
--primary-text:     indigo-600  /* 链接/强调文本 */
```

### 功能色 (Semantic Colors)
```typescript
const semanticColors = {
  // 成功状态 - Emerald
  success: {
    bg: 'emerald-50',
    border: 'emerald-200', 
    text: 'emerald-700',
    solid: 'emerald-600',
  },
  
  // 警告状态 - Amber  
  warning: {
    bg: 'amber-50',
    border: 'amber-200',
    text: 'amber-700', 
    solid: 'amber-500',
  },
  
  // 错误状态 - Rose (比 red 更柔和)
  error: {
    bg: 'rose-50',
    border: 'rose-200',
    text: 'rose-700',
    solid: 'rose-600',
  },
  
  // 信息状态 - Sky
  info: {
    bg: 'sky-50',
    border: 'sky-200',
    text: 'sky-700',
    solid: 'sky-500',
  },
}
```

### 2.2 中性色系统 (Neutral/Gray Scale)

**推荐使用 Slate** (带蓝色调的灰色，更现代):

| 用途 | 色值 | Tailwind |
|------|------|----------|
| 页面背景 | `#f8fafc` | `slate-50` |
| 卡片背景 | `#ffffff` | `white` |
| 次级背景 | `#f1f5f9` | `slate-100` |
| 边框色 | `#e2e8f0` | `slate-200` |
| 分隔线 | `#cbd5e1` | `slate-300` |
| 占位符 | `#94a3b8` | `slate-400` |
| 次要文本 | `#64748b` | `slate-500` |
| 正文文本 | `#475569` | `slate-600` |
| 标题文本 | `#334155` | `slate-700` |
| 强调文本 | `#1e293b` | `slate-800` |

### 2.3 Surface 层级系统

```tsx
// 5 级 Surface 深度 (参考 Material Design 3)
const surfaceLevels = {
  lowest:  'bg-white',           // 最底层
  low:     'bg-slate-50',        // 页面背景
  base:    'bg-white',           // 卡片默认
  high:    'bg-slate-50',        // 强调区域
  highest: 'bg-slate-100',       // 最高层级
}

// 阴影与层级配合
const elevations = {
  0: 'shadow-none',
  1: 'shadow-sm',      // 卡片默认
  2: 'shadow',         // 悬停状态
  3: 'shadow-md',      // 下拉菜单
  4: 'shadow-lg',      // 模态框
  5: 'shadow-xl',      // Toast/Popover
}
```

---

## 3. 间距系统 (Spacing)

### 基于 4px 网格
```
4px  = 1   (gap-1, p-1)
8px  = 2   (gap-2, p-2)
12px = 3   (gap-3, p-3)
16px = 4   (gap-4, p-4)   ← 组件内部标准间距
20px = 5   (gap-5, p-5)
24px = 6   (gap-6, p-6)   ← 卡片内边距
32px = 8   (gap-8, p-8)   ← 区块间距
```

### 页面布局间距
```tsx
// 页面容器
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  
  // 区块垂直间距
  <div className="space-y-8">
    
    // 卡片内部
    <div className="p-6 space-y-4">
      ...
    </div>
  </div>
</div>
```

---

## 4. 字体排版 (Typography)

### 字体栈
```css
font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 
             'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### 标题层级
```tsx
// Display - 超大标题 (仪表盘数字)
<span className="text-4xl font-bold tracking-tight text-slate-900">
  
// H1 - 页面标题
<h1 className="text-2xl font-bold text-slate-800">

// H2 - 区块标题
<h2 className="text-xl font-semibold text-slate-800">

// H3 - 卡片标题  
<h3 className="text-lg font-semibold text-slate-800">

// H4 - 小标题/标签
<h4 className="text-sm font-medium text-slate-600 uppercase tracking-wide">
```

### 正文文本
```tsx
// 正文大
<p className="text-base text-slate-600">

// 正文默认
<p className="text-sm text-slate-600">

// 辅助文本
<p className="text-sm text-slate-500">

// 小字/注释
<p className="text-xs text-slate-400">
```

### 数值显示
```tsx
// 大数字 (指标卡片)
<span className="text-3xl font-bold tabular-nums text-slate-900">

// 中等数字 (表格)
<span className="text-base font-semibold tabular-nums">

// 小数字 (标签)
<span className="text-sm font-medium tabular-nums">
```

> 💡 **提示**: 使用 `tabular-nums` 让数字等宽对齐

---

## 5. 组件设计规范

### 5.1 按钮 (Buttons)

#### 变体类型
```tsx
// Primary - 主要操作
<button className="
  px-4 py-2 rounded-lg font-medium
  bg-indigo-600 text-white
  hover:bg-indigo-700 
  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-colors
">

// Secondary/Outline - 次要操作
<button className="
  px-4 py-2 rounded-lg font-medium
  bg-white text-slate-700 
  border border-slate-300
  hover:bg-slate-50 hover:border-slate-400
  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
  transition-colors
">

// Ghost - 低强调操作
<button className="
  px-4 py-2 rounded-lg font-medium
  text-slate-600
  hover:bg-slate-100
  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
  transition-colors
">

// Destructive - 危险操作
<button className="
  px-4 py-2 rounded-lg font-medium
  bg-rose-600 text-white
  hover:bg-rose-700
  focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2
  transition-colors
">
```

#### 尺寸规范
```tsx
// Small
className="px-3 py-1.5 text-sm"

// Medium (default)
className="px-4 py-2 text-sm"

// Large
className="px-6 py-3 text-base"

// Icon Button
className="p-2 rounded-lg hover:bg-slate-100"
```

### 5.2 输入框 (Inputs)

```tsx
// 标准输入框
<input className="
  w-full px-3 py-2 rounded-lg
  bg-white text-slate-900 placeholder:text-slate-400
  border border-slate-300
  hover:border-slate-400
  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
  disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
  transition-colors
"/>

// 带标签的完整表单项
<div className="space-y-1.5">
  <label className="block text-sm font-medium text-slate-700">
    字段名 <span className="text-rose-500">*</span>
  </label>
  <input className="..." />
  <p className="text-xs text-slate-500">帮助文本</p>
</div>
```

### 5.3 卡片 (Cards)

```tsx
// 基础卡片
<div className="
  bg-white rounded-xl 
  border border-slate-200 
  shadow-sm
">
  <div className="p-6">
    {/* 内容 */}
  </div>
</div>

// 可交互卡片 (悬停效果)
<div className="
  bg-white rounded-xl 
  border border-slate-200 
  shadow-sm
  hover:shadow-md hover:border-slate-300
  transition-all duration-200
  cursor-pointer
">

// 分区卡片 (带头部)
<div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
    <h3 className="font-semibold text-slate-800">卡片标题</h3>
  </div>
  <div className="p-6">
    {/* 内容 */}
  </div>
</div>
```

### 5.4 指标卡片 (Metric Card)

```tsx
interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType;
  trend?: { value: number; isPositive: boolean };
  color?: 'indigo' | 'emerald' | 'amber' | 'sky' | 'rose';
}

// 推荐实现
<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
  <div className="flex items-start justify-between">
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-3xl font-bold tabular-nums text-slate-900">{value}</p>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-medium ${
          trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
        }`}>
          {trend.isPositive ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
          {Math.abs(trend.value)}%
        </div>
      )}
    </div>
    <div className={`p-3 rounded-xl bg-${color}-50`}>
      <Icon className={`text-${color}-600`} size={24} />
    </div>
  </div>
</div>
```

### 5.5 状态徽章 (Status Badge)

```tsx
const statusStyles = {
  // 员工状态
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  probation: 'bg-amber-50 text-amber-700 border-amber-200',
  leave: 'bg-sky-50 text-sky-700 border-sky-200',
  terminated: 'bg-slate-100 text-slate-500 border-slate-200',
  
  // 通用状态
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
}

<span className={`
  inline-flex items-center gap-1.5
  px-2.5 py-1 rounded-full
  text-xs font-medium
  border
  ${statusStyles[status]}
`}>
  <span className="w-1.5 h-1.5 rounded-full bg-current" />
  {label}
</span>
```

### 5.6 表格 (Tables)

```tsx
<div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-slate-50 border-b border-slate-200">
          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
            列标题
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        <tr className="hover:bg-slate-50 transition-colors">
          <td className="px-6 py-4 text-sm text-slate-600">
            内容
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### 5.7 模态框 (Modal/Dialog)

```tsx
// 遮罩层
<div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm" />

// 模态框容器
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="
    bg-white rounded-2xl shadow-xl 
    w-full max-w-lg max-h-[90vh] 
    flex flex-col
    animate-in fade-in zoom-in-95 duration-200
  ">
    {/* 头部 */}
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
      <h2 className="text-lg font-semibold text-slate-800">标题</h2>
      <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
        <X size={20} className="text-slate-500" />
      </button>
    </div>
    
    {/* 内容 */}
    <div className="flex-1 overflow-y-auto px-6 py-4">
      {/* ... */}
    </div>
    
    {/* 底部操作 */}
    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
      <button className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100">
        取消
      </button>
      <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
        确认
      </button>
    </div>
  </div>
</div>
```

---

## 6. 图表样式 (Charts)

### Recharts 配置
```tsx
const chartConfig = {
  // 网格线
  grid: {
    strokeDasharray: '3 3',
    vertical: false,
    stroke: '#e2e8f0', // slate-200
  },
  
  // 坐标轴
  axis: {
    stroke: '#94a3b8', // slate-400
    fontSize: 12,
    tickLine: false,
    axisLine: false,
  },
  
  // 提示框
  tooltip: {
    cursor: { fill: '#f1f5f9' }, // slate-100
    contentStyle: {
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      padding: '12px',
    },
  },
  
  // 图例
  legend: {
    fontSize: 12,
    iconType: 'circle',
  },
}

// 推荐配色方案 (最多6色)
const chartColors = [
  '#6366f1', // indigo-500
  '#0ea5e9', // sky-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#8b5cf6', // violet-500
];
```

---

## 7. 动画与过渡

### 过渡时长
```css
/* 快速 - 按钮、开关 */
transition-duration: 150ms;

/* 默认 - 卡片悬停、展开 */
transition-duration: 200ms;

/* 慢速 - 页面切换、模态框 */
transition-duration: 300ms;
```

### 常用动画
```tsx
// 淡入
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

// 淡入上移
@keyframes fadeInUp {
  from { 
    opacity: 0; 
    transform: translateY(8px);
  }
  to { 
    opacity: 1; 
    transform: translateY(0);
  }
}

// 缩放淡入 (模态框)
@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

// Tailwind 类名
className="animate-fade-in"
className="animate-[fadeInUp_0.3s_ease-out]"
```

---

## 8. 响应式设计

### 断点系统
```
sm:  640px   - 大手机/小平板
md:  768px   - 平板
lg:  1024px  - 小桌面
xl:  1280px  - 标准桌面
2xl: 1536px  - 大桌面
```

### 网格布局模式
```tsx
// 指标卡片网格
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

// 两栏布局
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

// 侧边栏 + 主内容
<div className="flex flex-col lg:flex-row gap-6">
  <aside className="w-full lg:w-64 flex-shrink-0">
  <main className="flex-1 min-w-0">
</div>

// 表单双列
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

---

## 9. 图标规范

### 推荐图标库: Lucide React
```bash
npm install lucide-react
```

### 尺寸规范
```tsx
// 小图标 (按钮、表格)
<Icon size={16} />

// 默认 (导航、列表)
<Icon size={20} />

// 大图标 (卡片图标)
<Icon size={24} />

// 超大 (空状态)
<Icon size={48} />
```

### 常用图标映射
```tsx
const iconMap = {
  // 业务图标
  employee: Users,
  salary: Coins,
  workshop: Factory,
  attendance: CalendarCheck,
  production: Package,
  
  // 操作图标
  add: Plus,
  edit: Pencil,
  delete: Trash2,
  search: Search,
  filter: Filter,
  export: Download,
  import: Upload,
  refresh: RefreshCw,
  
  // 状态图标
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
  
  // 导航图标
  dashboard: LayoutDashboard,
  settings: Settings,
  logout: LogOut,
}
```

---

## 10. 无障碍 (Accessibility)

### 颜色对比度
- 正文文本: ≥ 4.5:1
- 大文本 (≥18px): ≥ 3:1
- 图标和边框: ≥ 3:1

### 焦点状态
```tsx
// 所有可交互元素必须有明显的焦点样式
className="focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"

// 跳过链接 (键盘导航)
<a href="#main" className="sr-only focus:not-sr-only">
  跳转到主内容
</a>
```

### ARIA 标签
```tsx
// 图标按钮必须有 aria-label
<button aria-label="删除员工">
  <Trash2 size={16} />
</button>

// 表单错误关联
<input id="email" aria-describedby="email-error" aria-invalid="true" />
<p id="email-error" className="text-rose-600">邮箱格式不正确</p>
```

---

## 11. 暗色模式 (可选扩展)

### Tailwind 配置
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ...
}
```

### 暗色主题色彩
```tsx
// 使用 dark: 前缀
<div className="
  bg-white dark:bg-slate-900
  text-slate-800 dark:text-slate-100
  border-slate-200 dark:border-slate-700
">
```

### 关键颜色映射
| Light Mode | Dark Mode |
|------------|-----------|
| `bg-white` | `bg-slate-900` |
| `bg-slate-50` | `bg-slate-800` |
| `text-slate-800` | `text-slate-100` |
| `text-slate-600` | `text-slate-300` |
| `border-slate-200` | `border-slate-700` |

---

## 12. 代码示例：完整页面模板

```tsx
export function ExamplePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">页面标题</h1>
          <p className="text-slate-500 mt-1">页面描述信息</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors">
            次要操作
          </button>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
            <Plus size={16} className="inline mr-1.5" />
            主要操作
          </button>
        </div>
      </div>

      {/* 指标卡片区 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="总员工数" 
          value="128" 
          icon={Users}
          color="indigo"
          trend={{ value: 12, isPositive: true }}
        />
        {/* ... 更多卡片 */}
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要内容 - 占 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">主要内容</h2>
          </div>
          <div className="p-6">
            {/* 内容 */}
          </div>
        </div>

        {/* 侧边内容 - 占 1/3 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 mb-4">侧边信息</h2>
          {/* 内容 */}
        </div>
      </div>
    </div>
  );
}
```

---

## 📝 更新日志

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v2.0 | 2024-12 | 采用 12 级色阶系统；引入 Surface 层级；增强无障碍规范；新增动画指南 |
| v1.0 | 2024-11 | 初始版本 |

---

## 🔗 参考资源

- [Tailwind CSS 官方文档](https://tailwindcss.com/docs)
- [Material Design 3 - Color Roles](https://m3.material.io/styles/color/roles)
- [Radix UI Themes - Color](https://www.radix-ui.com/themes/docs/theme/color)
- [shadcn/ui 组件库](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev/icons)

---

**🎨 这套设计规范旨在创建一致、专业、无障碍的企业级界面。如有疑问，请参考上述资源或联系前端团队。**

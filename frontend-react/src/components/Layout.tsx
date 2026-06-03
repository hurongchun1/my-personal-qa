import { type ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

/**
 * 弥散光星云背景 + 悬浮岛屿全局布局
 * 
 * 四层径向渐变叠加：
 * - Layer 1：左上紫色雾气 (#4c1d95)
 * - Layer 2：右下青色雾气 (#0891b2)
 * - Layer 3：中上靛蓝微光
 * - Layer 4：左下点缀紫光
 * 
 * 所有层具备极缓慢的位移动画（30-42s周期）和呼吸效果
 */
export function Layout({ children }: LayoutProps) {
  return (
    <main className="relative h-screen w-screen overflow-hidden text-slate-100">
      {/* 星云背景层 */}
      <div className="nebula-base" />
      <div className="nebula-layer-1" aria-hidden="true" />
      <div className="nebula-layer-2" aria-hidden="true" />
      <div className="nebula-layer-3" aria-hidden="true" />
      <div className="nebula-layer-4" aria-hidden="true" />
      <div className="nebula-dust" aria-hidden="true" />

      {/* 内容层：z-10 确保在背景之上 */}
      <div className="relative z-10 h-full w-full p-6 md:p-8 xl:p-10">
        {children}
      </div>
    </main>
  )
}

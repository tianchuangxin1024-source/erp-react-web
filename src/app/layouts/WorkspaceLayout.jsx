import { useState } from 'react'
import Icon from '../../shared/ui/Icon.jsx'
import Sidebar from './Sidebar.jsx'
import './WorkspaceLayout.css'

export default function WorkspaceLayout({ route, current, logout, children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="workspace">
    <Sidebar key={current?.module.id ?? 'home'} route={route} activeModule={current?.module} open={menuOpen} onNavigate={() => setMenuOpen(false)} />
    {menuOpen && <button className="sidebar-overlay" aria-label="关闭导航" type="button" onClick={() => setMenuOpen(false)} />}
    <div className="workspace-main">
      <header className="topbar">
        <div className="breadcrumbs"><button className="icon-button mobile-menu" type="button" aria-label="打开导航" aria-controls="sidebar" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Icon name="menu" /></button><a href="#/">工作台</a><Icon name="chevron" size={13} />{current && <><span>{current.module.title}</span><Icon name="chevron" size={13} /></>}<strong>{current?.page.title ?? '财务总览'}</strong></div>
        <div className="topbar-right"><span className="demo-tag"><i /> 演示环境</span><span className="topbar-divider" /><span className="avatar">财</span><span className="account-name"><strong>财务管理员</strong><small>系统管理员</small></span><button className="icon-button logout-button" type="button" aria-label="退出登录" title="退出登录" onClick={logout}><Icon name="logout" size={18} /></button></div>
      </header>
      <main className="page-content" key={route}>
        {children}
      </main>
    </div>
  </div>
}

import { useState } from 'react'
import Icon from '../../shared/ui/Icon.jsx'
import Brand from '../../shared/ui/Brand.jsx'
import { modules, routeFor } from '../routing/routes.js'

export default function Sidebar({ route, activeModule, open, onNavigate }) {
  const [expanded, setExpanded] = useState({})
  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`} id="sidebar">
      <Brand />
      <nav aria-label="功能导航">
        <p className="nav-label">财务工作台</p>
        <a href="#/" className={`nav-item ${!activeModule ? 'current' : ''}`} aria-current={!activeModule ? 'page' : undefined} onClick={onNavigate}><Icon name="home" size={18} /> 工作台首页</a>
        <p className="nav-label modules-label">业务模块</p>
        {modules.map((module) => {
          const isActive = activeModule?.id === module.id
          const isExpanded = expanded[module.id] ?? isActive
          return <div className="nav-group" key={module.id}>
            <button className={`nav-item ${isActive ? 'active-module' : ''}`} type="button" aria-expanded={isExpanded} aria-controls={`subnav-${module.id}`} onClick={() => setExpanded({ ...expanded, [module.id]: !isExpanded })}><Icon name={module.icon} size={18} /> {module.title}<span className={isExpanded ? 'nav-chevron expanded' : 'nav-chevron'}><Icon name="chevron" size={15} /></span></button>
            {isExpanded && <div className="subnav" id={`subnav-${module.id}`}>{module.pages.map((page) => {
              const link = routeFor(module, page)
              return <a key={page.id} className={route === link ? 'current' : ''} aria-current={route === link ? 'page' : undefined} href={`#/${link}`} onClick={onNavigate}>{page.title}</a>
            })}</div>}
          </div>
        })}
      </nav>
      <div className="sidebar-footer"><span className="online-dot" /><span>演示工作空间</span><span className="sidebar-version">V1.0</span></div>
    </aside>
  )
}

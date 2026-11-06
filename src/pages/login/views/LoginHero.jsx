import Icon from '../../../shared/ui/Icon.jsx'
import Brand from '../../../shared/ui/Brand.jsx'

export default function LoginHero() {
  return (
    <section className="login-visual">
      <Brand />
      <div className="login-visual-content">
        <div className="login-kicker"><span /> 企业财务工作台</div>
        <h1>每一笔账，<br />都有清晰的脉络<span>。</span></h1>
        <p>从凭证入账到期末结账，在一个工作台管理账务、资金和财务报表。</p>
        <div className="login-diagram" aria-hidden="true">
          <div className="diagram-node"><Icon name="receipt" /><span>业务单据</span></div><i />
          <div className="diagram-node active"><Icon name="book" /><span>会计凭证</span></div><i />
          <div className="diagram-node"><Icon name="chart" /><span>财务报表</span></div>
        </div>
      </div>
      <div className="login-visual-footer"><span>衡账 · 财务管理系统</span><span>FINANCE OPERATIONS / 01</span></div>
    </section>
  )
}

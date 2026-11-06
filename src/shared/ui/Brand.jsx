import Icon from './Icon.jsx'
import './Brand.css'

export default function Brand() {
  return <div className="brand"><span className="brand-icon"><Icon name="logo" size={22} /></span><span><strong>衡账</strong><small>FINANCE SUITE</small></span></div>
}

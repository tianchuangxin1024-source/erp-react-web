export default function CaptchaField({ image, loading, error, value, onChange, onRefresh, disabled }) {
  return (
    <div className="captcha-field">
      <label htmlFor="registration-captcha">图形验证码</label>
      <div className="captcha-row">
        <div className="login-input">
          <input
            id="registration-captcha"
            name="captcha"
            autoComplete="off"
            placeholder="请输入图中字符"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            required
          />
        </div>
        <button
          type="button"
          className="captcha-image"
          aria-label="刷新图形验证码"
          title="点击刷新验证码"
          onClick={onRefresh}
          disabled={disabled || loading}
        >
          {image ? <img src={image} alt="注册图形验证码" width="156" height="52" /> : <span>{loading ? '加载中…' : '点击重试'}</span>}
        </button>
      </div>
      <div className="captcha-help">
        <span>点击图片可刷新，不区分大小写。</span>
        <button className="text-button" type="button" onClick={onRefresh} disabled={disabled || loading}>换一张</button>
      </div>
      {error && <p className="login-error" role="alert">{error}</p>}
    </div>
  )
}

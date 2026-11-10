import { request } from '../../shared/api/client.js'

export function getRegistrationCaptcha(signal) {
  return request('/auth/captcha', { signal })
}

export function registerAccount({ username, password, captcha }) {
  return request('/auth/register', {
    method: 'POST',
    body: { username: username.trim(), password, captcha },
  })
}

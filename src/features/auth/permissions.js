export function canAccess(user, resource, write = false) {
  if (user?.is_admin) return true
  return user?.permissions?.some((permission) => permission.resource === resource && (!write || permission.can_write === true || permission.can_write === 1)) || false
}

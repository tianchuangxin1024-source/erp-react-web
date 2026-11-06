export const page = (id, title, description, filters, columns, query, actions, rows = []) => ({
  id, title, description, filters: filters.split('|'), columns: columns.split('|'), query, actions, rows,
})

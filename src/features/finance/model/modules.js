import { generalLedger } from './modules/generalLedger.js'
import { receivables } from './modules/receivables.js'
import { payables } from './modules/payables.js'
import { funds } from './modules/funds.js'
import { expenses } from './modules/expenses.js'
import { fixedAssets } from './modules/fixedAssets.js'
import { reports } from './modules/reports.js'
import { system } from './modules/system.js'

export const modules = [
  generalLedger,
  receivables,
  payables,
  funds,
  expenses,
  fixedAssets,
  reports,
  system,
]

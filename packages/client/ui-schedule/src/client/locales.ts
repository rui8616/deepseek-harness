/** `schedule.catalog` namespace dictionaries. */

/** Dictionary namespace owned by this plugin. */
export const NS = 'schedule.catalog'

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'trigger.one': '{count} 个提醒',
  'trigger.other': '{count} 个提醒',
  'list.aria': '活动提醒',
  'status.scheduled': '等待中',
  'status.overdue': '已逾期',
  'frequency.once': '单次',
  'frequency.every': '{value}{unit}一次',
  'unit.day.one': '天',
  'unit.day.other': '天',
  'unit.hour.one': '小时',
  'unit.hour.other': '小时',
  'unit.minute.one': '分钟',
  'unit.minute.other': '分钟',
  'unit.second.one': '秒',
  'unit.second.other': '秒',
  'relative.now': '现在到期',
  'relative.future': '{value}{unit}后',
  'relative.overdue': '已逾期 {value}{unit}',
} as const

/** English dictionary, key-identical to the Chinese source of truth. */
export const en: Record<ScheduleCatalogKey, string> = {
  'trigger.one': '{count} reminder',
  'trigger.other': '{count} reminders',
  'list.aria': 'Active reminders',
  'status.scheduled': 'Scheduled',
  'status.overdue': 'Overdue',
  'frequency.once': 'Once',
  'frequency.every': 'Every {value} {unit}',
  'unit.day.one': 'day',
  'unit.day.other': 'days',
  'unit.hour.one': 'hour',
  'unit.hour.other': 'hours',
  'unit.minute.one': 'minute',
  'unit.minute.other': 'minutes',
  'unit.second.one': 'second',
  'unit.second.other': 'seconds',
  'relative.now': 'Due now',
  'relative.future': 'in {value} {unit}',
  'relative.overdue': '{value} {unit} overdue',
}

/** Key domain of the Schedule catalog namespace. */
export type ScheduleCatalogKey = keyof typeof zh

/** Japanese dictionary (same key set). */
export const ja: Record<ScheduleCatalogKey, string> = {
  'trigger.one': '{count} 件のリマインダー',
  'trigger.other': '{count} 件のリマインダー',
  'list.aria': '有効なリマインダー',
  'status.scheduled': '待機中',
  'status.overdue': '期限超過',
  'frequency.once': '1 回のみ',
  'frequency.every': '{value}{unit}ごと',
  'unit.day.one': '日',
  'unit.day.other': '日',
  'unit.hour.one': '時間',
  'unit.hour.other': '時間',
  'unit.minute.one': '分',
  'unit.minute.other': '分',
  'unit.second.one': '秒',
  'unit.second.other': '秒',
  'relative.now': '今が期限',
  'relative.future': '{value}{unit}後',
  'relative.overdue': '{value}{unit}超過',
}

/** Shell chrome and General-nav dictionaries; feature rows own their copy. */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'trigger': '设置',
  'title': '设置',
  'close': '关闭',
  'openDocument': '打开配置文件',
  'openDocument.error': '无法打开配置文件',
  'general.nav': '通用设置',
  'connection.error': '连接异常',
  'connection.retry': '立即重连',
  'connection.connecting': '连接中',
  'connection.connected': '连接成功',
  'connection.reconnect': '连接异常，点击立即重连',
  'connection.restart': '连接中，点击立即重连',
} satisfies Record<string, string>

/** The settings namespace key union. */
export type SettingsKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'trigger': 'Settings',
  'title': 'Settings',
  'close': 'Close',
  'openDocument': 'Open configuration file',
  'openDocument.error': 'Could not open configuration file',
  'general.nav': 'General',
  'connection.error': 'Disconnected',
  'connection.retry': 'Reconnect now',
  'connection.connecting': 'Connecting',
  'connection.connected': 'Connected',
  'connection.reconnect': 'Disconnected, reconnect now',
  'connection.restart': 'Connecting, restart now',
} satisfies Record<SettingsKey, string>

/** Japanese dictionary, checked complete against the zh key set. */
export const ja = {
  'trigger': '設定',
  'title': '設定',
  'close': '閉じる',
  'openDocument': '設定ファイルを開く',
  'openDocument.error': '設定ファイルを開けませんでした',
  'general.nav': '一般',
  'connection.error': '接続エラー',
  'connection.retry': '今すぐ再接続',
  'connection.connecting': '接続中',
  'connection.connected': '接続しました',
  'connection.reconnect': '接続エラー、クリックして今すぐ再接続',
  'connection.restart': '接続中、クリックして今すぐ再接続',
} satisfies Record<SettingsKey, string>

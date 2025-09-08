import dayjs from "dayjs";

/**
 * 格式化日期时间
 * @param date 日期字符串或Date对象
 * @param format 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDateTime(
  date: string | Date,
  format = "YYYY-MM-DD HH:mm:ss"
): string {
  if (!date) return "";
  return dayjs(date).format(format);
}

/**
 * 格式化日期
 * @param date 日期字符串或Date对象
 * @param format 格式化模板，默认为 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: string | Date, format = "YYYY-MM-DD"): string {
  if (!date) return "";
  return dayjs(date).format(format);
}

/**
 * 格式化时间
 * @param date 日期字符串或Date对象
 * @param format 格式化模板，默认为 'HH:mm:ss'
 * @returns 格式化后的时间字符串
 */
export function formatTime(date: string | Date, format = "HH:mm:ss"): string {
  if (!date) return "";
  return dayjs(date).format(format);
}

/**
 * 获取相对时间
 * @param date 日期字符串或Date对象
 * @returns 相对时间字符串，如："2小时前"、"3天前"
 */
export function getRelativeTime(date: string | Date): string {
  if (!date) return "";

  const now = dayjs();
  const target = dayjs(date);
  const diff = now.diff(target, "minute");

  if (diff < 1) {
    return "刚刚";
  } else if (diff < 60) {
    return `${diff}分钟前`;
  } else if (diff < 1440) {
    // 24小时
    return `${Math.floor(diff / 60)}小时前`;
  } else if (diff < 10080) {
    // 7天
    return `${Math.floor(diff / 1440)}天前`;
  } else {
    return formatDate(date);
  }
}

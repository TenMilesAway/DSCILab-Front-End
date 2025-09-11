/**
 * 表单数据处理工具函数
 */

/**
 * 将表单数据中的空字符串和undefined转换为null
 * @param data 表单数据对象
 * @returns 处理后的数据对象
 */
export function convertEmptyToNull<T extends Record<string, any>>(data: T): T {
  const result = { ...data };

  Object.keys(result).forEach(key => {
    if (result[key] === '' || result[key] === undefined) {
      result[key] = null;
    }
  });

  return result;
}

/**
 * 深度处理嵌套对象，将空字符串和undefined转换为null
 * @param data 数据对象
 * @returns 处理后的数据对象
 */
export function deepConvertEmptyToNull<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string' && data === '') {
    return null as T;
  }

  if (Array.isArray(data)) {
    return data.map(item => deepConvertEmptyToNull(item)) as T;
  }

  if (typeof data === 'object') {
    const result = {} as T;
    Object.keys(data).forEach(key => {
      result[key] = deepConvertEmptyToNull(data[key]);
    });
    return result;
  }

  return data;
}

/**
 * 批量处理表单字段，支持指定需要处理的字段
 * @param data 表单数据对象
 * @param fields 需要处理的字段数组，如果不传则处理所有字段
 * @returns 处理后的数据对象
 */
export function convertSpecificFieldsToNull<T extends Record<string, any>>(
  data: T,
  fields?: string[]
): T {
  const result = { ...data };
  const fieldsToProcess = fields || Object.keys(result);

  fieldsToProcess.forEach(field => {
    if (result[field] === '' || result[field] === undefined) {
      result[field] = null;
    }
  });

  return result;
}
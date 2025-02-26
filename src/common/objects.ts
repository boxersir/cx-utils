/**深copy */
export function deepCopy<T>(obj: T, hash = new WeakMap<object, any>()): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj) as any;
  if (obj instanceof RegExp) return new RegExp(obj) as any;
  if (obj instanceof Map)
    return new Map(
      Array.from(obj.entries()).map(([key, value]) => [
        key,
        deepCopy(value, hash),
      ])
    ) as any;
  if (obj instanceof Set)
    return new Set(
      Array.from(obj.values()).map((value) => deepCopy(value, hash))
    ) as unknown as T;

  if (hash.has(obj)) return hash.get(obj) as T;
  const clone = Array.isArray(obj) ? [] : {};
  hash.set(obj, clone); // 防止循环引用
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      (clone as any)[key] = deepCopy(obj[key], hash);
    }
  }
  return clone as T;
}

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

type DateType = string | number | Date | dayjs.Dayjs;
interface FormatOptions {
  showTime?: boolean;
  timeFormat?: string;
  isUtc?: boolean;
}

/**
 * 高级日期处理工具集
 */
export class DateUtils {
  /**
   * 设置默认时区（全局生效）
   * @param timezone - 时区名称 如 'Asia/Shanghai'
   */
  static setDefaultTimezone(timezone: string): void {
    dayjs.tz.setDefault(timezone);
  }

  /**
   * 安全日期转换
   * @param input - 可接受多种日期格式
   * @param timezone - 指定时区
   */
  static parse(input?: DateType, timezone?: string): dayjs.Dayjs {
    if (!input) return dayjs();
    const d = dayjs(input);
    return timezone ? d.tz(timezone) : d;
  }

  /**
   * 智能格式化日期
   * @param input - 日期输入
   * @param format - 格式字符串或选项
   * @example
   * format(new Date()) // "2023-10-08 14:30"
   * format(new Date(), { showTime: false }) // "2023-10-08"
   */
  static format(
    input: DateType,
    format: string | FormatOptions = {
      showTime: true,
      timeFormat: "HH:mm",
      isUtc: false,
    }
  ): string {
    const options =
      typeof format === "string"
        ? { format }
        : {
            format: `YYYY-MM-DD${
              format.showTime ? ` ${format.timeFormat}` : ""
            }`,
            ...format,
          };

    let instance = this.parse(input);
    if (options.isUtc) {
      instance = instance.utc();
    }

    return instance.format(options.format);
  }

  /**
   * 计算相对时间（自动国际化）
   * @param input - 目标日期
   * @param baseDate - 基准日期（默认当前时间）
   * @param locale - 语言代码
   */
  static fromNow(input: DateType, baseDate?: DateType, locale = "en"): string {
    const base = baseDate ? this.parse(baseDate) : dayjs();
    return this.parse(input).locale(locale).from(base);
  }

  /**
   * 日期范围生成器
   * @param start - 开始日期
   * @param end - 结束日期
   * @param interval - 间隔单位（day/week/month/year）
   */
  static *dateRange(
    start: DateType,
    end: DateType,
    interval: dayjs.ManipulateType = "day"
  ) {
    let current = this.parse(start);
    const endDate = this.parse(end);

    while (current.isBefore(endDate)) {
      yield current.format("YYYY-MM-DD");
      current = current.add(1, interval);
    }
  }

  /**
   * 时区转换
   * @param input - 原始日期
   * @param fromZone - 原始时区
   * @param toZone - 目标时区
   */
  static convertTimezone(
    input: DateType,
    fromZone: string,
    toZone: string
  ): string {
    return this.parse(input, fromZone).tz(toZone).format();
  }

  /**
   * 验证日期有效性
   * @param input - 日期输入
   */
  static isValid(input: DateType): boolean {
    return this.parse(input).isValid();
  }
}

// 默认导出实例（快捷方式）
export default new DateUtils();

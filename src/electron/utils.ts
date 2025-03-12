/*
 * @Author: caixin caixin185@163.com
 * @Date: 2025-03-12 10:35:25
 * @LastEditors: caixin
 * @LastEditTime: 2025-03-12 16:58:54
 * @Description: file content
 */
import path from "path";
import fs from "fs";
import { app } from "electron";
import { parse as uuidParse, stringify as uuidStringify } from "uuid";

type DeviceIdInfo = {
  uuid: string;
  timestamp: string | number;
  bufStr: string;
  name?: string;
  type?: string;
  version?: string;
  ip?: string;
};
function getDeviceId(): DeviceIdInfo {
  const uuid = getUidParse(app.getPath("userData"));
  return uuid;
}
// 这里返回路径,如果修改文件位置请修改
const getPath = (dir: string) => {
  return path.join(path.join(__dirname, "../"), dir);
};

const getPerloadPath = () => {
  return app.isPackaged ? getPath("../preload.js") : getPath("../preload.js");
};
function getUidParse(str: string): DeviceIdInfo {
  const devicePath = path.join(str, "device");
  if (fs.existsSync(devicePath)) {
    const deviceInfo = parseDeviceInfo(devicePath);
    if (
      deviceInfo &&
      deviceInfo.timestamp &&
      deviceInfo.uuid &&
      deviceInfo.bufStr
    ) {
      return deviceInfo;
    }
    return randomUUID(devicePath);
  }
  return randomUUID(devicePath);
}
function parseDeviceInfo(filePath: string): DeviceIdInfo | false {
  try {
    const buf = fs.readFileSync(filePath);
    // 复制前20字节buffer
    const bufCopy = Buffer.alloc(20);
    bufCopy.set(buf.subarray(0, 20));
    if (buf.length >= 20) {
      const uuidBytes = buf.subarray(0, 16);
      const uuid = uuidStringify(uuidBytes);
      // 取buffer剩余4字节时间戳
      const installTimeBuffer = buf.subarray(16, 20);
      // 读无符号整型32位
      const timestamp = installTimeBuffer.readUInt32LE(0);
      const bufStr = bufCopy.toString("base64"); // 把比特转换成uuid
      return {
        uuid,
        timestamp,
        bufStr,
      };
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error reading file:", error);
    return false;
  }
}
function randomUUID(path: string): DeviceIdInfo {
  const uuid = crypto.randomUUID();
  const uuidBuffer = uuidParse(uuid);
  const timestamp = Math.floor(Date.now() / 1000);
  const installTimeBuffer = Buffer.alloc(4);
  installTimeBuffer.writeInt32LE(timestamp, 0); // 4位 的秒级 时间戳

  const buf = Buffer.concat([uuidBuffer, installTimeBuffer]);
  const bufStr = buf.toString("base64");
  try {
    fs.writeFileSync(path, buf);
    return {
      uuid,
      timestamp,
      bufStr,
    };
  } catch (error) {
    return {
      uuid,
      timestamp,
      bufStr,
    };
  }
}

export { getDeviceId, getPath, getPerloadPath };

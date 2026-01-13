import request from "@/utils/request";

// 获取验证码
export function getCodeImg() {
  return request({
    url: "/api/v1/captcha",
    method: "get",
  });
}

// 查询系统配置 - 此接口不在验证数据权限
// Platform: /api/v1/configs/frontend
// Business: /api/v1/app-config
export function getSetting() {
  // 根据构建模式选择不同的接口路径
  const url =
    process.env.VUE_APP_MODE === "platform"
      ? "/api/v1/configs/frontend"
      : "/api/v1/app-config";

  return request({
    url: url,
    method: "get",
  });
}

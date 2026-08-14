# 🚀 Serverless Sub-Converter (Mihomo / Stash)

基于 Cloudflare Workers 的轻量级、高性能 Clash Meta (Mihomo) / Stash 订阅转换中心。

本项目旨在通过 Serverless 架构，将杂乱的节点链接（VLESS Reality、TUIC、VMess 等）及机场订阅，转化为带有**顶级 DNS 泄露防护**、**TUN 模式优化**以及**精细化分流规则**的标准 YAML 配置文件。

## ✨ 核心特性

本项目最强大的功能在于**用户隔离**与**智能路由**：

### 👥 1. 多租户管理与多用户鉴权
告别一站式的公开订阅链接，本项目内置了基于 Token 的多租户管理系统，非常适合与家人、朋友合租或分享节点。

*   **Token 独立鉴权**：每个用户拥有独一无二的 Token（如 `https://your-worker.dev/User_Token_1`），防止订阅被恶意盗用。
*   **节点与订阅隔离**：不同用户可以在 `USERS_CONFIG` 中配置完全不同的节点池和机场订阅，实现物理级别的隔离。
*   **流量与过期时间下发**：支持标准的 `Subscription-Userinfo` 头部，用户的客户端（如 Clash Verge, Stash）可直接显示该用户的**总流量、已用流量及订阅到期时间**。

### 🔀 2. 动态规则分发与智能客户端适配
不同的客户端对配置文件的兼容性差异巨大（例如 Stash 不支持某些 Mihomo 独有特性）。本项目独创了**智能云端调度中枢**：

*   **User-Agent 智能识别**：自动读取请求头中的 UA，识别当前是 Clash Verge、Mihomo 还是 Stash。
    *   对于桌面端等高性能设备，下发 `FULL_INI`（完整版分流规则）。
    *   对于移动端或特定客户端，自动降级下发 `SIMPLE_INI`（精简版规则，降低内存占用）。
*   **URL 路径强制重写**：支持在链接尾部添加参数强制切换模式。
    *   访问 `/Token/stash`：强制激活 Stash 兼容模式。
*   **动态节点过滤与 Header 替换**：
    *   当识别为 Stash 模式时，Worker 会**自动剔除不支持的 `xhttp` 节点**，并替换为 Stash 专用的 YAML 头部（剔除不兼容的 DNS/TUN 字段），彻底解决配置文件报错问题。

### 🛠️ 3. 其他特性
*   **纯 Serverless 架构**：部署在 Cloudflare Workers，0 成本，高可用。
*   **全协议解析**：原生支持解析 `vless://`, `tuic://`, `vmess://` 等单节点 URI 以及远程 Base64 订阅。
*   **防雷引擎**：自动清理失效节点和格式错误的 JSON。

---

## 🚀 快速部署指南

1. 登录 [Cloudflare](https://dash.cloudflare.com/) 控制台，进入 **Workers & Pages**。
2. 点击 **Create application** -> **Create Worker**，随意命名并创建。
3. 点击 **Edit code**，将本仓库的 `worker.js` 代码全部复制并粘贴进去。
4. **修改个性化配置**（见下文），点击 **Deploy** 即可上线！

---

## ⚙️ 配置说明

在使用前，请务必修改代码开头的两处核心配置：

### 1. 配置规则订阅源 (INI)
请在你的 GitHub 仓库中准备好 `.ini` 格式的路由规则文件，并将 Raw 链接填入此处：
```
// 替换为你自己的规则库地址
const FULL_INI_URL = "https://raw.githubusercontent.com/your-name/your-repo/main/clash_full.ini";
const SIMPLE_INI_URL = "https://raw.githubusercontent.com/your-name/your-repo/main/clash_simple.ini";
```

### 2. 配置用户与节点 (USERS_CONFIG)
在这里管理你的用户权限及节点：
```
const USERS_CONFIG = {
  // 用户的 Token，作为 URL 的访问路径
  "my_secret_token_1": {                              
    name: "Alice",                 // 用户昵称
    totalGB: 200,                  // 流量额度 (GB)
    expireDate: "2025-12-31",      // 过期时间
    nodes: `
# 支持直接粘贴 VLESS/TUIC 等分享链接
vless://uuid@1.1.1.1:443?encryption=none&security=reality&sni=xxx&pbk=xxx#US-Node
# 支持直接粘贴机场订阅链接 (Worker 会自动去拉取并解析)
https://airport.com/api/v1/client/subscribe?token=xxx
`
  }
};
```

### 🔗 订阅链接使用方法

部署完成后，你的订阅链接格式如下：
*   **默认智能模式**：`https://你的worker域名.workers.dev/my_secret_token_1`
*   **强制 Stash 模式**：`https://你的worker域名.workers.dev/my_secret_token_1/stash`

---

## 📝 TODO / 未来计划
- [ ] 增加按日期的流量自动清零/重置逻辑 (需引入 KV 存储)
- [ ] 支持 Hysteria2 协议解析
- [ ] 支持可视化的 Web Dashboard 管理用户

## ⚠️ 免责声明
本项目仅供编程学习与 Serverless 架构研究使用。请使用者遵守所在地相关法律法规，开发者不对由于滥用本项目造成的任何后果负责。

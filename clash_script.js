// ===================== 节点过滤配置 =====================
// 节点过滤规则：取消注释对应行即可启用过滤
const nodeFilterRules = [
  "港|hk|HK|Hong|HONG|九龙",  // 取消注释：屏蔽所有香港节点
  // "台|tw|TW|Taiwan|TAIWAN",               // 取消注释：屏蔽所有台湾节点
  // "日|jp|JP|Japan|JAPAN",                // 取消注释：屏蔽所有日本节点
  // "新|sg|SG|Singapore|SINGAPORE",            // 取消注释：屏蔽所有新加坡节点
  // "美|us|US|United States|USA",        // 取消注释：屏蔽所有美国节点
  // "韩|kr|KR|Korea|KOREA",                // 取消注释：屏蔽所有韩国节点
];
// ===================== 自动选择节点配置 =====================

// 是否启用自动选择节点（取消注释下面一行即可禁用）
const enableAutoSelect = true;
// const enableAutoSelect = false;  // 取消注释这行来禁用自动选择
// 自动选择节点的测速间隔（秒）
const autoSelectInterval = 300;  // 默认 300 秒（5 分钟），可自定义
// 自动选择节点的测速超时（毫秒）
const autoSelectTimeout = 2000;  // 默认 2000 毫秒（2 秒），可自定义
// 如果当前节点比最快节点慢的差距在 35ms 以内，则不进行切换，防止频繁跳动
const autoSelectTolerance = 35;
// 是否在 Clash 界面中隐藏地区自动选择分组（🇯🇵 日本自动、🇹🇼 台湾自动、🇺🇸 美国自动）
const autoSelectHidden = true;  // true = 隐藏，false = 显示   隐藏/显示自动选择分组
// 自动选择节点的测速 URL
const autoSelectUrl = "https://www.google.com/generate_204";  // 可自定义测速地址
// 构建最终的过滤正则（排除官网/套餐等 + 用户自定义排除）
function buildFilterRegex() {
  const baseExclude = "官网|套餐|流量|异常|剩余";  // 基础排除项
  const userExclude = nodeFilterRules
    .filter(rule => rule && rule.trim() && !rule.trim().startsWith("//"))
    .join("|");
  
  if (userExclude) {
    return `^(?!.*(${baseExclude}|${userExclude})).*$`;
  }
  return `^(?!.*(${baseExclude})).*$`;
}

// ===================== DNS 防泄露 =====================

// 国内DNS服务器
const domesticNameservers = [
  "https://223.5.5.5/dns-query", // 阿里DoH
  "https://doh.pub/dns-query" // 腾讯DoH
];
// 国外DNS服务器
const foreignNameservers = [
  "https://208.67.222.222/dns-query", // OpenDNS
  "https://77.88.8.8/dns-query",      // YandexDNS
  "https://1.1.1.1/dns-query",        // CloudflareDNS
  "https://8.8.4.4/dns-query"         // GoogleDNS
];

// DNS配置
const dnsConfig = {
  enable: true,
  listen: "0.0.0.0:1053",
  ipv6: false,
  "prefer-h3": false,
  "respect-rules": true,
  "use-system-hosts": false,
  "cache-algorithm": "arc",
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.1/16",
  "fake-ip-filter": [
    "+.lan",
    "+.local",
    "+.msftconnecttest.com",
    "+.msftncsi.com",
    "localhost.ptlogin2.qq.com",
    "localhost.sec.qq.com",
    "+.in-addr.arpa",
    "+.ip6.arpa",
    "time.*.com",
    "time.*.gov",
    "pool.ntp.org",
    "localhost.work.weixin.qq.com"
  ],
  "default-nameserver": ["223.5.5.5", "1.2.4.8"],
  nameserver: [...foreignNameservers],
  "proxy-server-nameserver": [...domesticNameservers],
  "direct-nameserver": [...domesticNameservers],
  "nameserver-policy": {
    "geosite:private,cn": domesticNameservers
  }
};

// 规则集通用配置
const ruleProviderCommon = {
  type: "http",
  format: "yaml",
  interval: 86400
};

// ===================== 规则集配置（Loyalsoldier + blackmatrix7） =====================

const ruleProviders = {
  // 基础规则：仍用 Loyalsoldier
  reject: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt",
    path: "./ruleset/loyalsoldier/reject.yaml"
  },
  icloud: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt",
    path: "./ruleset/loyalsoldier/icloud.yaml"
  },
  apple: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt",
    path: "./ruleset/loyalsoldier/apple.yaml"
  },

  // Microsoft：blackmatrix7 规则（包含 Office、OneDrive、Azure 等）
  microsoft: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Microsoft/Microsoft.yaml",
    path: "./ruleset/blackmatrix7/microsoft.yaml"
  },

  // Google：用 blackmatrix7，更全，包含 www.google.com 等
  google: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Google/Google.yaml",
    path: "./ruleset/blackmatrix7/google.yaml"
  },

  // Proxy：常见的国外网站和服务（需要代理访问）
  proxy: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt",
    path: "./ruleset/loyalsoldier/proxy.yaml"
  },
  
  // Direct：常见的国内网站和服务（直连）
  direct: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt",
    path: "./ruleset/loyalsoldier/direct.yaml"
  },
  
  // Private：私有网络地址（局域网、本地回环等）
  private: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt",
    path: "./ruleset/loyalsoldier/private.yaml"
  },
  
  // GFW：被墙的网站列表（需要代理）
  gfw: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt",
    path: "./ruleset/loyalsoldier/gfw.yaml"
  },
  
  // TLD-NOT-CN：非中国顶级域名（如 .com、.org 等，通常需要代理）
  "tld-not-cn": {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/tld-not-cn.txt",
    path: "./ruleset/loyalsoldier/tld-not-cn.yaml"
  },
  
  // Telegram IP 段（Telegram 服务器 IP 地址）
  telegramcidr: {
    ...ruleProviderCommon,
    behavior: "ipcidr",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt",
    path: "./ruleset/loyalsoldier/telegramcidr.yaml"
  },
  
  // CN CIDR：中国大陆 IP 地址段（直连）
  cncidr: {
    ...ruleProviderCommon,
    behavior: "ipcidr",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt",
    path: "./ruleset/loyalsoldier/cncidr.yaml"
  },
  
  // LAN CIDR：局域网 IP 地址段（直连）
  lancidr: {
    ...ruleProviderCommon,
    behavior: "ipcidr",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt",
    path: "./ruleset/loyalsoldier/lancidr.yaml"
  },
  
  // Applications：常见应用程序的进程名规则（Windows/macOS）
  applications: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt",
    path: "./ruleset/loyalsoldier/applications.yaml"
  },
  
  // X / Twitter：blackmatrix7 规则，包含 x.com 等
  Twitter: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Twitter/Twitter.yaml",
    path: "./ruleset/blackmatrix7/Twitter.yaml"
  },

  // Bahamut 动画疯：xiaolin-007 的规则（含 ani.gamer.com.tw）
  bahamut: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/Bahamut.txt",
    path: "./ruleset/xiaolin-007/bahamut.yaml"
  },

  // YouTube：blackmatrix7
  YouTube: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/YouTube/YouTube.yaml",
    path: "./ruleset/blackmatrix7/YouTube.yaml"
  },

  // Netflix：blackmatrix7
  Netflix: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Netflix/Netflix.yaml",
    path: "./ruleset/blackmatrix7/Netflix.yaml"
  },

  // Spotify：blackmatrix7
  Spotify: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Spotify/Spotify.yaml",
    path: "./ruleset/blackmatrix7/Spotify.yaml"
  },
// Bilibili 港澳台限定内容规则（只包含需要代理的域名）
  BilibiliHMT: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/BiliBiliIntl/BiliBiliIntl.yaml",
    path: "./ruleset/blackmatrix7/BiliBiliIntl.yaml"
  },
  // AI：黑矩阵的 OpenAI 规则（ChatGPT 等）
  AI: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/OpenAI/OpenAI.yaml",
    path: "./ruleset/blackmatrix7/OpenAI.yaml"
  },

  // TikTok：blackmatrix7
  TikTok: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/TikTok/TikTok.yaml",
    path: "./ruleset/blackmatrix7/TikTok.yaml"
  }
};

// ===================== 自定义分流入口（在这里加你自己的域名） =====================
// 写域名后缀就行，会自动生成：DOMAIN-SUFFIX,xxx,对应分组

const customDomainSuffix = {
  "谷歌服务": [
    // "scholar.google.com",
    // "accounts.google.com",
    "antigravity-unleash.goog",
  ],
  "流媒体": [
    // "m.youtube.com",
    // "ytimg.com",
    // "netflix.com",
    // "tiktokv.com",
  ],
  "社交媒体": [
    // "t.me",
    // "x.com",
    // "twitter.com",
  ],
  "AI": [
    // "gemini.google.com",
  ],
  "微软服务": [
    // "copilot.microsoft.com",
  ],
  "苹果服务": [
    // "developer.apple.com",
  ],
  "动画疯": [
    // "example.bahamut.com",
  ],
  "哔哩哔哩港澳台": [
    // "bilibili.com",
  ],
  "Spotify": [
    // "open.spotify.com",
  ],
  "节点选择": [
    // 想强制走主节点选择组的自定义域名
  ],
  "全局直连": [
    // 想强制直连的额外域名
  ],
  "漏网之鱼": [
    // 特殊场景：不想被前面规则命中，可以钉在漏网之鱼再手动选分组
  ]
};

// 把 customDomainSuffix 转成 Clash 规则
function buildCustomRules() {
  const res = [];
  Object.entries(customDomainSuffix).forEach(([group, domains]) => {
    if (!Array.isArray(domains)) return;
    domains.forEach(d => {
      const domain = String(d).trim();
      if (!domain) return;
      // 这里统一用 DOMAIN-SUFFIX，如果你只想匹配完整域名，也可以改成 DOMAIN
      res.push(`DOMAIN-SUFFIX,${domain},${group}`);
    });
  });
  return res;
}

// ===================== 基础规则列表 =====================

const baseRules = [
  // 自定义规则（仍然保留）
  "DOMAIN-SUFFIX,googleapis.cn,节点选择",
  "DOMAIN-SUFFIX,gstatic.com,节点选择",
  "DOMAIN-SUFFIX,xn--ngstr-lra8j.com,节点选择",
  "DOMAIN-SUFFIX,github.io,节点选择",
  "DOMAIN,v2rayse.com,节点选择",

  // 规则集
  "RULE-SET,applications,全局直连",
  "RULE-SET,private,全局直连",
  "RULE-SET,reject,广告过滤",
  "RULE-SET,icloud,苹果服务",
  "RULE-SET,apple,苹果服务",
  "RULE-SET,microsoft,微软服务",
  "RULE-SET,YouTube,流媒体",
  "RULE-SET,Netflix,流媒体",
  "RULE-SET,TikTok,流媒体",
  "RULE-SET,bahamut,动画疯",
  "RULE-SET,Spotify,Spotify",
  "RULE-SET,BilibiliHMT,哔哩哔哩港澳台", 
  "RULE-SET,AI,AI",
  "RULE-SET,Twitter,社交媒体",
  "RULE-SET,telegramcidr,社交媒体,no-resolve",
  "RULE-SET,google,谷歌服务",
  "RULE-SET,proxy,节点选择",
  "RULE-SET,gfw,节点选择",
  "RULE-SET,tld-not-cn,节点选择",
  "RULE-SET,direct,全局直连",
  "RULE-SET,lancidr,全局直连,no-resolve",
  "RULE-SET,cncidr,全局直连,no-resolve",

  // 其他
  "GEOSITE,CN,全局直连",
  "GEOIP,LAN,全局直连,no-resolve",
  "GEOIP,CN,全局直连,no-resolve",
  "MATCH,漏网之鱼"
];

// 代理组通用配置
const groupBaseOption = {
  interval: 300,
  timeout: 2000,
  url: "https://www.google.com/generate_204",
  lazy: true,
  "max-failed-times": 2,
  hidden: false
};

// 自动选择节点配置（根据用户设置）
const autoSelectOption = {
  interval: autoSelectInterval,
  timeout: autoSelectTimeout,
  tolerance: autoSelectTolerance,  // 添加容差参数
  url: autoSelectUrl,
  lazy: true,
  "max-failed-times": 1,  // 改为 1 次，一旦失败立即切换
  hidden: autoSelectHidden  // 使用用户配置的 hidden 选项
};

// 创建地区自动选择分组的辅助函数
function createRegionAutoGroups(config, dynamicFilter) {
  if (!enableAutoSelect) {
    return [];  // 如果禁用自动选择，返回空数组
  }

  // 从 dynamicFilter 中提取排除规则
  const excludePattern = dynamicFilter.match(/\(\.\*\(([^)]+)\)\)/)?.[1] || "官网|套餐|流量|异常|剩余";

  return [
    {
      ...autoSelectOption,
      name: "🇯🇵 日本自动",
      type: "url-test",
      "include-all": true,
      filter: "日本|霓虹|jp|JP|Japan|JAPAN|🇯🇵",
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg",
    },
    {
      ...autoSelectOption,
      name: "🇹🇼 台湾自动",
      type: "url-test",
      "include-all": true,
      filter: "台湾|日月潭|TW|tw|Taiwan",
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg",
    },
    {
      ...autoSelectOption,
      name: "🇺🇸 美国自动",
      type: "url-test",
      "include-all": true,
      filter: "美国|US|us|美利坚|🇺🇸",
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/us.svg",
    }
  ];
}

// ===================== 主入口 =====================

function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount =
    typeof config?.["proxy-providers"] === "object"
      ? Object.keys(config["proxy-providers"]).length
      : 0;

  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  // 覆盖 DNS
  config.dns = dnsConfig;

  // 获取动态过滤规则
  const dynamicFilter = buildFilterRegex();

  // 创建地区自动选择分组
  const regionAutoGroups = createRegionAutoGroups(config, dynamicFilter);
  
  // 构建自动选择节点列表（如果启用）
  const autoSelectProxies = enableAutoSelect 
    ? ["🇯🇵 日本自动", "🇹🇼 台湾自动", "🇺🇸 美国自动"]
    : [];

  // 先定义各策略组（这里直接把 socks5 写进各分组）
  config["proxy-groups"] = [
    {
      ...groupBaseOption,
      name: "节点选择",
      type: "select", 
      proxies: [...autoSelectProxies, "socks5"],
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg"
    },
    {
      ...groupBaseOption,
      name: "谷歌服务",
      type: "select",
      proxies: ["节点选择", ...autoSelectProxies, "socks5", "全局直连"],
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/google.svg"
    },
    {
      ...groupBaseOption,
      name: "流媒体",
      type: "select",
      proxies: ["节点选择", ...autoSelectProxies, "socks5", "全局直连"],
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/youtube.svg"
    },
    {
      ...groupBaseOption,
      name: "社交媒体",
      type: "select",
      proxies: ["节点选择", ...autoSelectProxies, "socks5", "全局直连"],
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/telegram.svg"
    },
    {
      ...groupBaseOption,
      name: "AI",
      type: "select",
      proxies: ["节点选择", ...autoSelectProxies, "socks5"],
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/chatgpt.svg"
    },
    {
      ...groupBaseOption,
      name: "微软服务",
      type: "select",
      proxies: ["全局直连", "节点选择", ...autoSelectProxies, "socks5"],
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/microsoft.svg"
    },
    {
      ...groupBaseOption,
      name: "苹果服务",
      type: "select",
      proxies: ["节点选择", ...autoSelectProxies, "socks5", "全局直连"],
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Apple_logo_white.svg/960px-Apple_logo_white.svg.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail"
    },
    {
      ...groupBaseOption,
      name: "动画疯",
      type: "select",
      proxies: ["节点选择", ...autoSelectProxies, "socks5"],
      "include-all": true,
      filter: "台|tw|TW|日月潭",  // 动画疯只保留台湾节点
      icon: "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/Bahamut.svg"
    },
    {
      ...groupBaseOption,
      name: "哔哩哔哩港澳台",
      type: "select",
      proxies: ["全局直连", "节点选择", ...autoSelectProxies, "socks5"],
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/bilibili.svg"
    },
    {
      ...groupBaseOption,
      name: "Spotify",
      type: "select",
      proxies: ["节点选择", ...autoSelectProxies, "socks5", "全局直连"],
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/spotify.svg"
    },
    {
      ...groupBaseOption,
      name: "广告过滤",
      type: "select",
      proxies: ["REJECT", "DIRECT"],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/bug.svg"
    },
    {
      ...groupBaseOption,
      name: "全局直连",
      type: "select",
      proxies: ["DIRECT", "节点选择"],
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/link.svg"
    },
    {
      ...groupBaseOption,
      name: "全局拦截",
      type: "select",
      proxies: ["REJECT", "DIRECT"],
      icon: "https://raw.githubusercontent.com/mariuszostrowski/subway/refs/heads/master/SVG/error.svg"
    },
    {
      ...groupBaseOption,
      name: "漏网之鱼",
      type: "select",
      proxies: ["节点选择", ...autoSelectProxies, "socks5", "全局直连"],
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/fish.svg"
    }
  ];

  // 将地区自动选择分组添加到配置中（如果启用）
  if (enableAutoSelect) {
    config["proxy-groups"].push(...regionAutoGroups);
  }

  // 设置规则集 + 规则：自定义规则优先，其后是基础规则
  const finalRules = [...buildCustomRules(), ...baseRules];
  config["rule-providers"] = ruleProviders;
  config["rules"] = finalRules;

  // 保证 proxies 存在
  if (!Array.isArray(config.proxies)) {
    config.proxies = [];
  }

  // 创建前置机场选择器 all，给 ISP 做 dialer-proxy
  const dialerGroupName = "all";
  const allProxies = config.proxies.map(x => x.name);
  config["proxy-groups"].push({
    ...groupBaseOption,
    name: dialerGroupName,
    type: "select",
    proxies: allProxies,
    "include-all": true,
    filter: dynamicFilter  // all 分组也应用过滤规则
  });

  // 添加家宽 ISP 节点
  config.proxies.push({
    name: "ISP",
    server: "*",
    port: 443,
    username: "*",
    password: "*",
    type: "socks5",
    "dialer-proxy": dialerGroupName,
    udp: true
  });

  // socks5 分组：只包含 ISP
  config["proxy-groups"].push({
    ...groupBaseOption,
    name: "socks5",
    type: "select",
    proxies: ["ISP"]
  });

  // 兜底：确保“节点选择”里也有 socks5
  config["proxy-groups"].forEach(g => {
    if (g.name === "节点选择") {
      if (!Array.isArray(g.proxies)) g.proxies = [];
      if (!g.proxies.includes("socks5")) {
        g.proxies.push("socks5");
      }
    }
  });

  // 所有节点统一开启 UDP
  if (Array.isArray(config.proxies)) {
    config.proxies.forEach(p => {
      p.udp = true;
    });
  }

  return config;
}

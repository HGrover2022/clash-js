// ===================== FIClash / FlClash 适配脚本 =====================
// 说明：
// 1. 入口仍然是 main(config)
// 2. 保留原 clash_script.js 的 DNS、规则集、策略组和节点过滤逻辑
// 3. 兼容写法尽量保守，减少在不同脚本引擎下的语法风险

// ===================== 节点过滤配置 =====================
// 节点过滤规则：取消注释对应行即可启用过滤
const nodeFilterRules = [
  "港|hk|HK|Hong|HONG|九龙", // 取消注释：屏蔽所有香港节点
  // "台|tw|TW|Taiwan|TAIWAN",          // 取消注释：屏蔽所有台湾节点
  // "日|jp|JP|Japan|JAPAN",           // 取消注释：屏蔽所有日本节点
  // "新|sg|SG|Singapore|SINGAPORE",   // 取消注释：屏蔽所有新加坡节点
  // "美|us|US|United States|USA",     // 取消注释：屏蔽所有美国节点
  // "韩|kr|KR|Korea|KOREA",           // 取消注释：屏蔽所有韩国节点
];

// ===================== 自动选择节点配置 =====================
const enableAutoSelect = true;
// const enableAutoSelect = false; // 取消注释这行来禁用自动选择
const autoSelectInterval = 300;
const autoSelectTimeout = 2000;
const autoSelectTolerance = 35;
const autoSelectHidden = true;
const autoSelectUrl = "https://www.google.com/generate_204";

// 低倍率节点匹配关键词，可按你的机场命名习惯自行增删
const lowRatioKeywords = "[⁰¹²³⁴⁵⁶⁷⁸⁹˙.]+ˣ";
const japanKeywords = "日本|Japan|JP|JAPAN|🇯🇵";

// 构建最终的过滤正则（排除官网/套餐等 + 用户自定义排除）
function buildFilterRegex() {
  const baseExclude = "官网|套餐|流量|异常|剩余";
  const userExclude = nodeFilterRules
    .filter(function(rule) {
      return rule && rule.trim() && !rule.trim().startsWith("//");
    })
    .join("|");

  if (userExclude) {
    return "^(?!.*(" + baseExclude + "|" + userExclude + ")).*$";
  }

  return "^(?!.*(" + baseExclude + ")).*$";
}

// ===================== DNS 防泄露 =====================
const domesticNameservers = [
  "https://223.5.5.5/dns-query",
  "https://doh.pub/dns-query",
];

const foreignNameservers = [
  "https://208.67.222.222/dns-query",
  "https://77.88.8.8/dns-query",
  "https://1.1.1.1/dns-query",
  "https://8.8.4.4/dns-query",
];

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
    "localhost.work.weixin.qq.com",
  ],
  "default-nameserver": ["223.5.5.5", "1.2.4.8"],
  nameserver: foreignNameservers.slice(),
  "proxy-server-nameserver": domesticNameservers.slice(),
  "direct-nameserver": domesticNameservers.slice(),
  "nameserver-policy": {
    "geosite:private,cn": domesticNameservers,
  },
};

// ===================== 规则集通用配置 =====================
const ruleProviderCommon = {
  type: "http",
  format: "yaml",
  interval: 86400,
};

// ===================== 规则集配置（Loyalsoldier + blackmatrix7） =====================
const ruleProviders = {
  reject: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt",
    path: "./ruleset/loyalsoldier/reject.yaml",
  },
  icloud: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt",
    path: "./ruleset/loyalsoldier/icloud.yaml",
  },
  apple: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt",
    path: "./ruleset/loyalsoldier/apple.yaml",
  },
  microsoft: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Microsoft/Microsoft.yaml",
    path: "./ruleset/blackmatrix7/microsoft.yaml",
  },
  google: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Google/Google.yaml",
    path: "./ruleset/blackmatrix7/google.yaml",
  },
  proxy: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt",
    path: "./ruleset/loyalsoldier/proxy.yaml",
  },
  direct: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt",
    path: "./ruleset/loyalsoldier/direct.yaml",
  },
  private: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt",
    path: "./ruleset/loyalsoldier/private.yaml",
  },
  gfw: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt",
    path: "./ruleset/loyalsoldier/gfw.yaml",
  },
  "tld-not-cn": {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/tld-not-cn.txt",
    path: "./ruleset/loyalsoldier/tld-not-cn.yaml",
  },
  telegramcidr: {
    ...ruleProviderCommon,
    behavior: "ipcidr",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt",
    path: "./ruleset/loyalsoldier/telegramcidr.yaml",
  },
  cncidr: {
    ...ruleProviderCommon,
    behavior: "ipcidr",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt",
    path: "./ruleset/loyalsoldier/cncidr.yaml",
  },
  lancidr: {
    ...ruleProviderCommon,
    behavior: "ipcidr",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt",
    path: "./ruleset/loyalsoldier/lancidr.yaml",
  },
  applications: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt",
    path: "./ruleset/loyalsoldier/applications.yaml",
  },
  Twitter: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Twitter/Twitter.yaml",
    path: "./ruleset/blackmatrix7/Twitter.yaml",
  },
  bahamut: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/Bahamut.txt",
    path: "./ruleset/xiaolin-007/bahamut.yaml",
  },
  YouTube: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/YouTube/YouTube.yaml",
    path: "./ruleset/blackmatrix7/YouTube.yaml",
  },
  Netflix: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Netflix/Netflix.yaml",
    path: "./ruleset/blackmatrix7/Netflix.yaml",
  },
  Spotify: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Spotify/Spotify.yaml",
    path: "./ruleset/blackmatrix7/Spotify.yaml",
  },
  SteamCN: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/SteamCN/SteamCN.yaml",
    path: "./ruleset/blackmatrix7/SteamCN.yaml",
  },
  Steam: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Steam/Steam.yaml",
    path: "./ruleset/blackmatrix7/Steam.yaml",
  },
  BilibiliHMT: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/BiliBiliIntl/BiliBiliIntl.yaml",
    path: "./ruleset/blackmatrix7/BiliBiliIntl.yaml",
  },
  AI: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/OpenAI/OpenAI.yaml",
    path: "./ruleset/blackmatrix7/OpenAI.yaml",
  },
  TikTok: {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/TikTok/TikTok.yaml",
    path: "./ruleset/blackmatrix7/TikTok.yaml",
  },
};

// ===================== 自定义分流入口 =====================
const customDomainSuffix = {
  "谷歌服务": [
    "antigravity-unleash.goog",
    "tenor.com",
    "media.tenor.com",
    "tenor.googleapis.com",
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
  "节点选择": [],
  "全局直连": [
    // 想强制直连的额外域名
  ],
  "漏网之鱼": [
    // 特殊场景：不想被前面规则命中，可以钉在漏网之鱼再手动选分组
  ],
};

function buildCustomRules() {
  const res = [];

  Object.entries(customDomainSuffix).forEach(function(entry) {
    const group = entry[0];
    const domains = entry[1];

    if (!Array.isArray(domains)) {
      return;
    }

    domains.forEach(function(d) {
      const domain = String(d).trim();
      if (!domain) {
        return;
      }
      res.push("DOMAIN-SUFFIX," + domain + "," + group);
    });
  });

  return res;
}

// ===================== 基础规则列表 =====================
const baseRules = [
  "IP-CIDR,152.69.184.104/32,全局直连,no-resolve",
  "DOMAIN-SUFFIX,googleapis.cn,全局直连",
  "DOMAIN-SUFFIX,gstatic.com,谷歌服务",
  "DOMAIN-SUFFIX,googlevideo.com,谷歌服务",
  "DOMAIN-SUFFIX,ytimg.com,谷歌服务",
  "DOMAIN-SUFFIX,ggpht.com,谷歌服务",
  "DOMAIN-SUFFIX,gvt1.com,谷歌服务",
  "DOMAIN-SUFFIX,gvt2.com,谷歌服务",
  "DOMAIN-SUFFIX,gvt3.com,谷歌服务",
  "DOMAIN-SUFFIX,xn--ngstr-lra8j.com,谷歌服务",
  "DOMAIN-SUFFIX,github.io,节点选择",
  "DOMAIN,v2rayse.com,节点选择",
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
  "RULE-SET,SteamCN,全局直连",
  "RULE-SET,Steam,Steam",
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
  "GEOSITE,CN,全局直连",
  "GEOIP,LAN,全局直连,no-resolve",
  "GEOIP,CN,全局直连,no-resolve",
  "MATCH,漏网之鱼",
];

const groupBaseOption = {
  interval: 300,
  timeout: 2000,
  url: "https://www.google.com/generate_204",
  lazy: true,
  "max-failed-times": 2,
  hidden: false,
};

const autoSelectOption = {
  interval: autoSelectInterval,
  timeout: autoSelectTimeout,
  tolerance: autoSelectTolerance,
  url: autoSelectUrl,
  lazy: true,
  "max-failed-times": 1,
  hidden: autoSelectHidden,
};

function createRegionAutoGroups() {
  if (!enableAutoSelect) {
    return [];
  }

  return [
    {
      ...autoSelectOption,
      name: "🇯🇵 日本自动",
      type: "url-test",
      "include-all": true,
      filter: japanKeywords,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg",
    },
    {
      ...autoSelectOption,
      name: "🎃 低倍率自动",
      type: "url-test",
      "include-all": true,
      filter: lowRatioKeywords,
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
    },
  ];
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function getProxyProviderCount(config) {
  const providers = config["proxy-providers"];
  if (!providers || typeof providers !== "object") {
    return 0;
  }
  return Object.keys(providers).length;
}

function main(config) {
  if (!config || typeof config !== "object") {
    throw new Error("配置对象无效");
  }

  config.proxies = ensureArray(config.proxies);

  const proxyCount = config.proxies.length;
  const proxyProviderCount = getProxyProviderCount(config);

  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  config.dns = dnsConfig;

  const dynamicFilter = buildFilterRegex();
  const regionAutoGroups = createRegionAutoGroups();
  const autoSelectProxies = enableAutoSelect
    ? ["🇯🇵 日本自动", "🇹🇼 台湾自动", "🇺🇸 美国自动", "🎃 低倍率自动"]
    : [];

  config["proxy-groups"] = [
    {
      ...groupBaseOption,
      name: "节点选择",
      type: "select",
      proxies: ["🇹🇼 台湾自动", "🇯🇵 日本自动", "🇺🇸 美国自动", "🎃 低倍率自动", "socks5"],
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg",
    },
    {
      ...groupBaseOption,
      name: "谷歌服务",
      type: "select",
      proxies: ["节点选择"].concat(autoSelectProxies, ["socks5", "全局直连"]),
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/google.svg",
    },
    {
      ...groupBaseOption,
      name: "流媒体",
      type: "select",
      proxies: ["🎃 低倍率自动", "节点选择", "🇯🇵 日本自动", "🇹🇼 台湾自动", "🇺🇸 美国自动", "socks5", "全局直连"],
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/youtube.svg",
    },
    {
      ...groupBaseOption,
      name: "社交媒体",
      type: "select",
      proxies: ["🇯🇵 日本自动", "节点选择", "🇹🇼 台湾自动", "🇺🇸 美国自动", "🎃 低倍率自动", "socks5", "全局直连"],
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/telegram.svg",
    },
    {
      ...groupBaseOption,
      name: "AI",
      type: "select",
      proxies: ["节点选择"].concat(autoSelectProxies, ["socks5"]),
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/chatgpt.svg",
    },
    {
      ...groupBaseOption,
      name: "微软服务",
      type: "select",
      proxies: ["全局直连", "节点选择"].concat(autoSelectProxies, ["socks5"]),
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/microsoft.svg",
    },
    {
      ...groupBaseOption,
      name: "苹果服务",
      type: "select",
      proxies: ["节点选择"].concat(autoSelectProxies, ["socks5", "全局直连"]),
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Apple_logo_white.svg/960px-Apple_logo_white.svg.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    },
    {
      ...groupBaseOption,
      name: "动画疯",
      type: "select",
      proxies: ["🎃 低倍率自动", "节点选择", "🇹🇼 台湾自动", "🇯🇵 日本自动", "🇺🇸 美国自动", "socks5"],
      "include-all": true,
      filter: "台|tw|TW|日月潭",
      icon: "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/Bahamut.svg",
    },
    {
      ...groupBaseOption,
      name: "哔哩哔哩港澳台",
      type: "select",
      proxies: ["🎃 低倍率自动", "全局直连", "节点选择", "🇯🇵 日本自动", "🇹🇼 台湾自动", "🇺🇸 美国自动", "socks5"],
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/bilibili.svg",
    },
    {
      ...groupBaseOption,
      name: "Spotify",
      type: "select",
      proxies: ["🇯🇵 日本自动", "节点选择", "🇹🇼 台湾自动", "🇺🇸 美国自动", "🎃 低倍率自动", "socks5", "全局直连"],
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/spotify.svg",
    },
    {
      ...groupBaseOption,
      name: "Steam",
      type: "select",
      proxies: ["🎃 低倍率自动", "全局直连", "节点选择", "🇯🇵 日本自动", "🇹🇼 台湾自动", "🇺🇸 美国自动", "socks5"],
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Steam.png",
    },
    {
      ...groupBaseOption,
      name: "广告过滤",
      type: "select",
      proxies: ["REJECT", "DIRECT"],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/bug.svg",
    },
    {
      ...groupBaseOption,
      name: "全局直连",
      type: "select",
      proxies: ["DIRECT", "节点选择"],
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/link.svg",
    },
    {
      ...groupBaseOption,
      name: "全局拦截",
      type: "select",
      proxies: ["REJECT", "DIRECT"],
      icon: "https://raw.githubusercontent.com/mariuszostrowski/subway/refs/heads/master/SVG/error.svg",
    },
    {
      ...groupBaseOption,
      name: "漏网之鱼",
      type: "select",
      proxies: ["节点选择"].concat(autoSelectProxies, ["socks5", "全局直连"]),
      "include-all": true,
      filter: dynamicFilter,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/fish.svg",
    },
  ];

  if (enableAutoSelect) {
    config["proxy-groups"] = config["proxy-groups"].concat(regionAutoGroups);
  }

  const finalRules = buildCustomRules().concat(baseRules);
  config["rule-providers"] = ruleProviders;
  config.rules = finalRules;

  const dialerGroupName = "all";
  const allProxies = config.proxies.map(function(item) {
    return item.name;
  });

  config["proxy-groups"].push({
    ...groupBaseOption,
    name: dialerGroupName,
    type: "select",
    proxies: allProxies,
    "include-all": true,
    filter: dynamicFilter,
  });

  config.proxies.push({
    name: "ISP",
    server: "*",
    port: 443,
    username: "*",
    password: "*",
    type: "socks5",
    "dialer-proxy": dialerGroupName,
    udp: true,
  });

  config["proxy-groups"].push({
    ...groupBaseOption,
    name: "socks5",
    type: "select",
    proxies: ["ISP"],
  });

  config["proxy-groups"].forEach(function(group) {
    if (group.name !== "节点选择") {
      return;
    }
    if (!Array.isArray(group.proxies)) {
      group.proxies = [];
    }
    if (group.proxies.indexOf("socks5") === -1) {
      group.proxies.push("socks5");
    }
  });

  config.proxies.forEach(function(proxy) {
    proxy.udp = true;
  });

  return config;
}

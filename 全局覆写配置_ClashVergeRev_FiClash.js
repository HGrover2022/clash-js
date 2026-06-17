function main(config) {
  // 在这里随时可以添加自定义节点，没有则保持为空数组 []
  const customProxies = [];

  config["allow-lan"] = true;
  config["find-process-mode"] = "always";

  config.dns = {
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
    "default-nameserver": [
      "223.5.5.5",
      "1.2.4.8"
    ],
    nameserver: [
      "https://208.67.222.222/dns-query",
      "https://77.88.8.8/dns-query",
      "https://1.1.1.1/dns-query",
      "https://8.8.4.4/dns-query"
    ],
    "proxy-server-nameserver": [
      "https://223.5.5.5/dns-query",
      "https://doh.pub/dns-query"
    ],
    "direct-nameserver": [
      "https://223.5.5.5/dns-query",
      "https://doh.pub/dns-query"
    ],
    "nameserver-policy": {
      "geosite:private,cn": [
        "https://223.5.5.5/dns-query",
        "https://doh.pub/dns-query"
      ],
      "geosite:google,youtube,telegram,gfw,geolocation-!cn": [
        "https://208.67.222.222/dns-query",
        "https://77.88.8.8/dns-query",
        "https://1.1.1.1/dns-query",
        "https://8.8.4.4/dns-query"
      ],
      "trae.com.cn": [
        "https://208.67.222.222/dns-query",
        "https://77.88.8.8/dns-query",
        "https://1.1.1.1/dns-query",
        "https://8.8.4.4/dns-query"
      ]
    }
  };

  config.tun = {
    ...(config.tun || {}),
    enable: true,
    stack: "mixed",
    "auto-route": true,
    "auto-detect-interface": true,
    "dns-hijack": [
      "any:53"
    ]
  };

  config.proxies = Array.isArray(config.proxies) ? config.proxies : [];
  const customProxyNames = customProxies.map((proxy) => proxy.name);
  config.proxies = config.proxies.filter((proxy) => !customProxyNames.includes(proxy.name));
  config.proxies.push(...customProxies);

  if (Array.isArray(config["proxy-groups"])) {
    for (const group of config["proxy-groups"]) {
      if (!Array.isArray(group.proxies) || group.type === "relay") {
        continue;
      }

      for (const proxyName of customProxyNames) {
        if (!group.proxies.includes(proxyName)) {
          group.proxies.push(proxyName);
        }
      }
    }
  }

  return config;
}

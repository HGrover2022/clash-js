/**
 * ====================================================================
 * 🚀 Clash Meta (Mihomo) 终极订阅转换中心 - By Serverless Worker
 * 核心特性：多用户鉴权 / 节点自动解析 / 顶级 DNS 与 TUN 优化 / 动态规则分发
 * ====================================================================
 */
// 👇 定义两个不同的规则订阅源 (请替换为你自己的 GitHub raw 链接)
const FULL_INI_URL = "https://raw.githubusercontent.com/your-github-username/your-repo/main/clash_full.ini";
const SIMPLE_INI_URL = "https://raw.githubusercontent.com/your-github-username/your-repo/main/clash_simple.ini";

// 👥 多租户管理：通过 URL 中的 Token 来识别不同用户，实现节点和流量的隔离
const USERS_CONFIG = {
  // 用户1：Token为 "user_token_1" (访问链接示例: https://your-worker.your-subdomain.workers.dev/user_token_1)
  "user_token_1": {                              
    name: "User1",                
    totalGB: 200,                         
    expireDate: "2027-12-31",             
    nodes: `
# 填入你的 VLESS Reality 节点示例
vless://uuid-placeholder-0000-000000000001@198.51.100.1:443?encryption=none&security=reality&flow=xtls-rprx-vision&type=tcp&sni=sni.example.com&pbk=public-key-placeholder_xxxxxx&fp=chrome#🇺🇸-US-PS-1
vless://uuid-placeholder-0000-000000000002@198.51.100.2:443?encryption=none&security=reality&flow=xtls-rprx-vision&type=tcp&sni=sni.example.com&pbk=public-key-placeholder_xxxxxx&fp=chrome#🇺🇸-US-PS-2

# 填入你的 TUIC 节点示例
tuic://uuid-placeholder:password-placeholder@198.51.100.3:8443?alpn=h3&insecure=1&allowInsecure=1&congestion_control=bbr#🇺🇸-US-TUIC-1
tuic://uuid-placeholder:password-placeholder@198.51.100.4:8443?alpn=h3&insecure=1&allowInsecure=1&congestion_control=bbr#🇭🇰-HK-TUIC-1

# 填入你的其他机场订阅链接示例
https://your-airport-domain.com/api/v1/client/subscribe?token=your_airport_token_xxx
`
  },
  
  // 用户2：Token为 "user_token_2"
  "user_token_2": {                    
    name: "User2",
    totalGB: 10,
    expireDate: "2026-10-01",
    nodes: `
# 用户2的节点示例
vless://uuid-placeholder-0000-000000000001@198.51.100.1:443?encryption=none&security=reality&flow=xtls-rprx-vision&type=tcp&sni=sni.example.com&pbk=public-key-placeholder_xxxxxx&fp=chrome#🇺🇸-US-PS-1
tuic://uuid-placeholder:password-placeholder@198.51.100.4:8443?alpn=h3&insecure=1&allowInsecure=1&congestion_control=bbr#🇭🇰-HK-TUIC-1
    `
  }
};

// ==================== 🧠 模块二：多端适配优化头 ====================
// 1. Mihomo/ClashMeta 专属复杂头部 (支持 TUN, Sniffer 等高级特性)
const MIHOMO_YAML_HEADER = `
port: 7890
socks-port: 7891
mixed-port: 7892
allow-lan: true
find-process-mode: always
mode: rule
log-level: info
ipv6: false
unified-delay: true
tcp-concurrent: true
profile: {store-selected: true, store-fake-ip: true}
geodata-mode: true
geox-url: {geoip: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip.dat", geosite: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat", mmdb: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/country.mmdb"}
sniffer: {enable: true, parse-pure-ip: true, override-destination: true, sniff: {HTTP: {ports: [80, 8080-8880]}, TLS: {ports: [443, 8443]}, QUIC: {ports: [443, 8443]}}, skip-domain: ['Mijia Cloud', 'dlg.io.mi.com', '+.apple.com']}
tun: {enable: true, stack: mixed, dns-hijack: [any:53, tcp://any:53], auto-route: true, auto-detect-interface: true, device: mihomo, strict-route: true, endpoint-independent-nat: true}
hosts: {'dns.alidns.com': [223.5.5.5, 223.6.6.6, 2400:3200::1, 2400:3200:baba::1], 'doh.pub': [1.12.12.12, 120.53.53.53]}
dns: {enable: true, listen: 0.0.0.0:1053, ipv6: false, prefer-h3: true, enhanced-mode: fake-ip, fake-ip-range: 198.18.0.0/15, fake-ip-filter-mode: rule, fake-ip-filter: ['GEOSITE,private,real-ip', 'GEOSITE,cn,real-ip', 'GEOSITE,google-cn,real-ip', 'GEOSITE,category-games@cn,real-ip', 'GEOSITE,category-game-platforms-download,real-ip', 'GEOSITE,category-public-tracker,real-ip', 'RULE-SET,direct,real-ip', 'RULE-SET,custom_direct_domain,real-ip', 'MATCH,fake-ip'], nameserver: ['quic://dns.alidns.com:853', 'https://doh.pub/dns-query'], nameserver-policy: {'geosite:private': [system]}}
`.trim();

// 2. Stash 专属头部
const STASH_YAML_HEADER = `
port: 7890
socks-port: 7891
mixed-port: 7892
allow-lan: true
mode: rule
log-level: info
ipv6: false
unified-delay: true
tcp-concurrent: true
geodata-mode: true
geox-url: {geoip: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip.dat", geosite: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat", mmdb: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/country.mmdb"}
sniffer: {enable: true, parse-pure-ip: true, override-destination: true, sniff: {HTTP: {ports: [80, 8080-8880]}, TLS: {ports: [443, 8443]}, QUIC: {ports: [443, 8443]}}, skip-domain: ['Mijia Cloud', 'dlg.io.mi.com', '+.apple.com', '+.icloud.com']}
tun: {enable: true, stack: mixed, dns-hijack: [any:53, tcp://any:53], auto-route: true, auto-detect-interface: true, strict-route: true, endpoint-independent-nat: true}
hosts: {'dns.alidns.com': [223.5.5.5, 223.6.6.6, 2400:3200::1, 2400:3200:baba::1], 'doh.pub': [1.12.12.12, 120.53.53.53]}
dns: {enable: true, listen: 0.0.0.0:1053, ipv6: false, prefer-h3: true, enhanced-mode: fake-ip, fake-ip-range: 198.18.0.0/15, fake-ip-filter: ['*.lan', '*.localdomain', '*.example', '*.invalid', '*.localhost', '*.test', '*.local', 'home.arpa', 'localhost.ptlogin2.qq.com', 'captive.apple.com', '+.apple.com', '+.pool.ntp.org', 'time.*.com', 'time.*.gov', '+.srv.nintendo.net', '+.stun.playstation.net', '+.msftconnecttest.com', '+.msftncsi.com', '+.xboxlive.com', 'msftconnecttest.com', 'xbox.*.microsoft.com'], nameserver: ['quic://dns.alidns.com:853', 'https://doh.pub/dns-query'], nameserver-policy: {'geosite:private': [system], 'geosite:cn': ['https://doh.pub/dns-query', 223.5.5.5]}}
`.trim();

// ==================== 🔄 模块三：分流规则转换引擎 ====================
function parseSubconverterINI(iniString) {
  const providers = {}, groups = [], rules = [];

  iniString.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith(';')).forEach(line => {
    if (line.startsWith('ruleset=')) {
      const match = line.match(/^ruleset=([^,]+),(.*)$/);
      if (!match) return;
      const groupName = match[1];
      let ruleStr = match[2];

      if (ruleStr.startsWith('[]')) {
        const ruleArr = ruleStr.slice(2).split(',');
        if (ruleArr[0] === 'FINAL') rules.push(`  - MATCH,${groupName}`);
        else { ruleArr.splice(2, 0, groupName); rules.push(`  - ${ruleArr.join(',')}`); }
      } else {
        const lastComma = ruleStr.lastIndexOf(',');
        if (lastComma !== -1 && !isNaN(ruleStr.substring(lastComma + 1))) ruleStr = ruleStr.substring(0, lastComma); 
        let behavior = 'classical', url = ruleStr;
        if (url.startsWith('clash-domain:')) { behavior = 'domain'; url = url.slice(13); }
        else if (url.startsWith('clash-classic:')) { behavior = 'classical'; url = url.slice(14); }
        
        const fileNameMatch = url.match(/\/([^/]+)\.(list|yaml|txt)$/i);
        let baseName = fileNameMatch ? fileNameMatch[1].toLowerCase().replace(/[^a-z0-9_]/g, '_') : 'provider';
        if (fileNameMatch && fileNameMatch[2].toLowerCase() === 'list') baseName += '_list';
        
        let pName = baseName;
        let counter = 1;
        while (providers[pName] && providers[pName].url !== url) pName = `${baseName}_${counter++}`;
        
        providers[pName] = { type: 'http', behavior, url, interval: 86400 };
        rules.push(`  - RULE-SET,${pName},${groupName}`);
      }
    } 
    else if (line.startsWith('custom_proxy_group=')) {
      const parts = line.replace('custom_proxy_group=', '').split('`');
      const g = { name: parts[0], type: parts[1] };
      const proxiesList = [];
      
      for (let i = 2; i < parts.length; i++) {
        const p = parts[i];
        if (p.startsWith('[]')) proxiesList.push(p.slice(2));
        else if (p === '.*') g['include-all'] = true;
        else if (p.startsWith('http')) g.url = p;
        else if (/^\d+(,,\d+)?$/.test(p)) { 
          const nums = p.split(',,');
          if (nums[0]) g.interval = Number(nums[0]);
          if (nums[1]) g.tolerance = Number(nums[1]);
        } else if (p) {
          g.filter = `(?i)${p}`;
          g['include-all'] = true; 
        }
      }
      if (proxiesList.length > 0) g.proxies = proxiesList;
      groups.push(g);
    }
  });

  let yamlProviders = "rule-providers:\n" + Object.entries(providers).map(([k, v]) => `  ${k}: {type: http, behavior: ${v.behavior}, url: "${v.url}", interval: 86400}`).join('\n');
  let yamlGroups = "proxy-groups:\n" + groups.map(g => {
    let parts = [`name: "${g.name}"`, `type: ${g.type}`];
    if (g.filter) parts.push(`filter: '${g.filter.replace(/'/g, "''")}'`);
    if (g['include-all']) parts.push(`include-all: true`);
    if (g.url) parts.push(`url: "${g.url}"`, `timeout: 3000`);
    if (g.interval) parts.push(`interval: ${g.interval}`);
    if (g.tolerance) parts.push(`tolerance: ${g.tolerance}`);
    if (g.proxies) parts.push(`proxies: [${g.proxies.map(p => `"${p}"`).join(', ')}]`);
    return `  - {${parts.join(', ')}}`;
  }).join('\n');
  
  return { yamlProviders, yamlGroups, yamlRules: "rules:\n" + rules.join('\n') };
}

// ==================== 🌐 模块四：节点抓取与防雷引擎 ====================
async function fetchAllNodes(raw) {
  const tasks = raw.split("\n").map(l => l.trim()).filter(Boolean).map(async line => {
    if (!line.startsWith("http")) return [line]; 
    try {
      const txt = await (await fetch(line, { headers: { "User-Agent": "Mozilla/5.0" } })).text();
      const dec = (!txt.includes("://") && /^[A-Za-z0-9+/=\s]+$/.test(txt)) ? atob(txt.replace(/\s/g, "")) : txt;
      return dec.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    } catch { return []; }
  });
  return (await Promise.all(tasks)).flat();
}

function repairVmessJson(jsonStr) {
  return jsonStr.replace(/"([a-zA-Z0-9_]+):"\s*(?=")/g, '"$1": ').replace(/"\s+"([a-zA-Z0-9_]+)"\s*:/g, '", "$1":');
}

// ==================== 🛠️ 模块五：节点协议解析器 (终极防雷版) ====================
function parseToClashProxy(link) {
  try {
    if (!link.includes("://") && /^[A-Za-z0-9+/=\s]+$/.test(link)) link = atob(link.replace(/\s/g, ""));
    const hashIdx = link.lastIndexOf("#");
    const name = hashIdx !== -1 ? decodeURIComponent(link.substring(hashIdx + 1).trim()) : "Unnamed";
    const urlStr = hashIdx !== -1 ? link.substring(0, hashIdx) : link;

    // 预处理：URL对象解析，并去除 IPv6 地址自带的 [] 括号
    const url = new URL(urlStr);
    const p = url.searchParams;
    const cleanServer = url.hostname.replace(/[\[\]]/g, ""); 

    // 1. VLESS 解析
    if (urlStr.startsWith("vless://")) {
      let proxy = { name, type: "vless", server: cleanServer, port: +url.port || 443, uuid: url.username, udp: true, tls: ["tls", "reality"].includes(p.get("security")), network: p.get("type") || "tcp", servername: p.get("sni") || cleanServer };
      if (p.get("flow")) proxy.flow = p.get("flow");
      if (p.get("security") === "reality") { proxy["client-fingerprint"] = p.get("fp") || "chrome"; proxy["reality-opts"] = { "public-key": p.get("pbk") || "", "short-id": p.get("sid") || "" }; }
      if (proxy.network === "ws") { proxy["ws-opts"] = { path: p.get("path") || "/", headers: {} }; if (p.get("host")) proxy["ws-opts"].headers["Host"] = p.get("host"); }
      return proxy;
    } 
    
    // 2. Trojan 解析
    if (urlStr.startsWith("trojan://")) {
      let proxy = { name, type: "trojan", server: cleanServer, port: +url.port || 443, password: url.username, udp: true, sni: p.get("sni") || p.get("peer") || cleanServer, "skip-cert-verify": p.get("allowInsecure") === "1" || p.get("insecure") === "1", network: p.get("type") || "tcp" };
      if (proxy.network === "ws") { proxy["ws-opts"] = { path: p.get("path") || "/", headers: {} }; if (p.get("host")) proxy["ws-opts"].headers["Host"] = p.get("host"); }
      return proxy;
    }

    // 3. Hysteria2 解析
    if (urlStr.startsWith("hysteria2://") || urlStr.startsWith("hy2://")) {
      let proxy = { name, type: "hysteria2", server: cleanServer, port: +url.port || 443, password: url.username, sni: p.get("sni") || cleanServer, "skip-cert-verify": p.get("insecure") === "1", up: p.get("up") || "100 Mbps", down: p.get("down") || "100 Mbps" };
      let mport = p.get("mport"); 
      if (mport) {
        if (mport.includes("-") || mport.includes(",")) {
          proxy.ports = mport; 
          proxy.port = parseInt(mport.split(/[-,]/)[0]); 
        } else {
          proxy.port = parseInt(mport);
        }
      }
      return proxy;
    }
    
    // 4. TUIC 解析
    if (urlStr.startsWith("tuic://")) {
      const [uuid, password] = url.password ? [url.username, url.password] : url.username.split(":");
      return { name, type: "tuic", server: cleanServer, port: +url.port, uuid, password: password || uuid, alpn: [p.get("alpn") || "h3"], "skip-cert-verify": p.get("insecure") === "1" || p.get("allowInsecure") === "1", "congestion-controller": p.get("congestion_control") || "bbr", udp: true };
    }
    
    // 5. VMess 解析
    if (urlStr.startsWith("vmess://")) {
      let v; try { v = JSON.parse(decodeURIComponent(escape(atob(urlStr.replace("vmess://", ""))))); } catch (e) { v = JSON.parse(repairVmessJson(decodeURIComponent(escape(atob(urlStr.replace("vmess://", "")))))); }
      let proxy = { name: hashIdx !== -1 ? name : (v.ps || "Unnamed VMESS"), type: "vmess", server: v.add.replace(/[\[\]]/g, ""), port: parseInt(v.port) || 443, uuid: v.id, alterId: parseInt(v.aid) || 0, cipher: v.scy || "auto", udp: true, tls: v.tls === "tls", network: v.net || "tcp" };
      if (v.sni) proxy.servername = v.sni;
      if (v.net === "ws") { proxy["ws-opts"] = { path: v.path || "/", headers: {} }; if (v.host) proxy["ws-opts"].headers["Host"] = v.host; }
      return proxy;
    }
    
    return null;
  } catch (e) { return null; }
}
// ==================== 🚀 模块六：云端调度中枢 ====================
export default {
  async fetch(req) {
    const url = new URL(req.url);
    
    // 1. 提取 URL 路径参数：支持 /TOKEN 或 /TOKEN/stash
    const pathParts = url.pathname.slice(1).split('/');
    let token = pathParts[0] || url.searchParams.get("token");
    let pathOverride = pathParts[1] ? pathParts[1].toLowerCase() : "";
    try { token = decodeURIComponent(token); } catch (e) {}

    if (url.pathname === "/favicon.ico") return new Response(null, { status: 204 });

    const clientIP = req.headers.get('cf-connecting-ip') || '未知 IP';
    const userAgent = req.headers.get('user-agent') || '未知客户端';
    const uaLower = userAgent.toLowerCase();
    const time = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

    // 2. 校验鉴权
    const user = USERS_CONFIG[token];
    if (!user) {
      console.log(`[${time}] 🚫 拒绝访问 | IP: ${clientIP} | Token: [${token}]`);
      return new Response(`403 Forbidden - Invalid Token`, { status: 403 });
    }

    try {
      // ==========================================
      // 🌟 动态分流与客户端适配逻辑
      // ==========================================
      let finalIniUrl = FULL_INI_URL;
      let finalHeader = MIHOMO_YAML_HEADER;
      let ruleTypeLog = "默认 FULL 规则";

      const simplePaths = ['stash', 'clashmi']; 
      const forceSimpleByPath = simplePaths.includes(pathOverride);
      
      const isSimpleClient = uaLower.includes('stash') || 
                             uaLower.includes('clashmi') || 
                             uaLower.includes('clashverge') ||
                             uaLower.includes('mihomo');

      // 判断是否需要下发 SIMPLE 规则
      if (forceSimpleByPath) {
        finalIniUrl = SIMPLE_INI_URL;
        ruleTypeLog = `强制 SIMPLE 规则 (URL后缀匹配: /${pathOverride})`;
      } else if (isSimpleClient) {
        finalIniUrl = SIMPLE_INI_URL;
        ruleTypeLog = "智能识别 SIMPLE 规则 (User-Agent匹配)";
      }

      // ⚠️ 核心修改：专属 Stash 模式判断 (需要剔除节点并简化头部)
      const isStashMode = pathOverride === 'stash' || uaLower.includes('stash');
      if (isStashMode) {
        finalHeader = STASH_YAML_HEADER; // 使用简化的 YAML 头部
        ruleTypeLog += " + [Stash兼容模式激活：剔除 xhttp、启用简易头部]";
      }

      console.log(`[${time}] ✅ 订阅拉取 | 用户: ${user.name} | 规则: ${ruleTypeLog} | 客户端: ${userAgent}`);
      
      // 3. 并发拉取节点与配置
      const [nodesData, iniString] = await Promise.all([ 
        fetchAllNodes(user.nodes), 
        fetch(finalIniUrl, { headers: { "User-Agent": "Mozilla/5.0" } }).then(res => res.text()) 
      ]);
      
      // 4. 节点解析与 Stash xhttp 过滤
      let proxies = nodesData.map(parseToClashProxy).filter(Boolean);
      
      if (isStashMode) {
        // 如果是 Stash 模式，剔除 network 为 xhttp 的节点
        proxies = proxies.filter(p => p.network !== "xhttp");
      }
      
      const proxiesYaml = `proxies:\n${proxies.map(p => `  - ${JSON.stringify(p)}`).join("\n")}`;
      
      const { yamlProviders, yamlGroups, yamlRules } = parseSubconverterINI(iniString);
      
      // 5. 拼装返回
      return new Response(`${finalHeader}\n\n${yamlProviders}\n\n${proxiesYaml}\n\n${yamlGroups}\n\n${yamlRules}`, {
        headers: {
          "Content-Type": "text/yaml; charset=utf-8",
          "Subscription-Userinfo": `upload=0; download=0; total=${(user.totalGB || 100) * 1073741824}; expire=${new Date(user.expireDate || "2099-12-31").getTime() / 1000 | 0}`
        }
      });
    } catch (err) {
      console.log(`[${time}] ❌ 代码报错 | 用户: ${user.name} | 错误: ${err.message}`);
      return new Response(`Worker Error: ${err.message}`, { status: 500 });
    }
  }
};

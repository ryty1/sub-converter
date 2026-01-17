/**
 * A4ss.ini 规则配置模块
 * 基于 ACL4SSR 规则，使用 gh-proxy.com 加速
 */

// 规则集基础 URL
const GH_PROXY = 'https://gh-proxy.com';
const ACL4SSR_BASE = `${GH_PROXY}/https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash`;
const CMLIU_BASE = `${GH_PROXY}/https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash`;
const RYTY1_BASE = `${GH_PROXY}/https://raw.githubusercontent.com/ryty1/ACL4SSR/master/Clash`;
const JUEWUY_BASE = `${GH_PROXY}/https://raw.githubusercontent.com/juewuy/ShellClash/master/rules`;

/**
 * A4ss.ini 规则集定义
 * 格式: { group: '策略组名称', url: '规则URL' }
 */
export const A4SS_RULESETS = [
    // 全球直连
    { group: '🎯 全球直连', url: `${CMLIU_BASE}/CFnat.list` },
    { group: '🎯 全球直连', url: `${ACL4SSR_BASE}/LocalAreaNetwork.list` },
    { group: '🎯 全球直连', url: `${ACL4SSR_BASE}/UnBan.list` },
    // 广告拦截
    { group: '🛑 全球拦截', url: `${ACL4SSR_BASE}/BanAD.list` },
    // 应用净化
    { group: '🍃 应用净化', url: `${ACL4SSR_BASE}/BanProgramAD.list` },
    { group: '🍃 应用净化', url: `${CMLIU_BASE}/adobe.list` },
    { group: '🍃 应用净化', url: `${CMLIU_BASE}/IDM.list` },
    // 谷歌 FCM
    { group: '📢 谷歌FCM', url: `${ACL4SSR_BASE}/Ruleset/GoogleFCM.list` },
    // 直连规则
    { group: '🎯 全球直连', url: `${ACL4SSR_BASE}/GoogleCN.list` },
    { group: '🎯 全球直连', url: `${ACL4SSR_BASE}/Ruleset/SteamCN.list` },
    // 微软和苹果
    { group: 'Ⓜ️ 微软服务', url: `${ACL4SSR_BASE}/Microsoft.list` },
    { group: '🍎 苹果服务', url: `${ACL4SSR_BASE}/Apple.list` },
    // 电报
    { group: '📲 电报信息', url: `${ACL4SSR_BASE}/Telegram.list` },
    // OpenAI
    { group: '🤖 OpenAi', url: `${ACL4SSR_BASE}/Ruleset/OpenAi.list` },
    { group: '🤖 OpenAi', url: `${JUEWUY_BASE}/ai.list` },
    { group: '🤖 OpenAi', url: `${CMLIU_BASE}/Copilot.list` },
    { group: '🤖 OpenAi', url: `${CMLIU_BASE}/GithubCopilot.list` },
    { group: '🤖 OpenAi', url: `${CMLIU_BASE}/Claude.list` },
    // Antigravity
    { group: '🛸 Antigravity', url: `${RYTY1_BASE}/antigravity.list` },
    // 流媒体
    { group: '📹 油管视频', url: `${ACL4SSR_BASE}/Ruleset/YouTube.list` },
    { group: '🎥 奈飞视频', url: `${ACL4SSR_BASE}/Ruleset/Netflix.list` },
    { group: '🌍 国外媒体', url: `${ACL4SSR_BASE}/ProxyMedia.list` },
    { group: '🌍 国外媒体', url: `${CMLIU_BASE}/Emby.list` },
    // 代理规则
    { group: '🚀 节点选择', url: `${ACL4SSR_BASE}/ProxyLite.list` },
    { group: '🚀 节点选择', url: `${CMLIU_BASE}/CMBlog.list` },
    // 中国直连
    { group: '🎯 全球直连', url: `${ACL4SSR_BASE}/ChinaDomain.list` },
    { group: '🎯 全球直连', url: `${ACL4SSR_BASE}/ChinaCompanyIp.list` },
    { group: '🎯 全球直连', url: `${CMLIU_BASE}/ChinaCompanyDomain.list` },
    { group: '🎯 全球直连', url: `${RYTY1_BASE}/zdy.list` },
];

/**
 * A4ss.ini 特殊规则（非 URL 规则）
 */
export const A4SS_SPECIAL_RULES = [
    { type: 'GEOIP', value: 'CN', group: '🎯 全球直连' },
    { type: 'MATCH', value: '', group: '🐟 漏网之鱼' },
];

/**
 * A4ss.ini 策略组定义
 * 格式遵循 custom_proxy_group 的定义方式
 */
export const A4SS_PROXY_GROUPS = [
    {
        name: '🚀 节点选择',
        type: 'select',
        proxies: ['♻️ 自动选择', '☑️ 手动切换'],
        includeCountries: true, // 包含所有国家分组
        appendDirect: true,
    },
    {
        name: '☑️ 手动切换',
        type: 'select',
        filter: '.*', // 所有节点
    },
    {
        name: '♻️ 自动选择',
        type: 'url-test',
        filter: '.*',
        url: 'http://www.gstatic.com/generate_204',
        interval: 300,
        tolerance: 50,
    },
    {
        name: '📹 油管视频',
        type: 'select',
        proxies: ['🚀 节点选择', '♻️ 自动选择', '☑️ 手动切换', '🇭🇰 香港节点', '🇹🇼 台湾节点', '🇯🇵 日本节点', '🇸🇬 狮城节点', '🇺🇸 美国节点', '🇰🇷 韩国节点', '🇬🇧 英国节点', '🇩🇪 德国节点', '🇫🇷 法国节点', '🇮🇳 印度节点', '🇦🇺 澳洲节点', 'DIRECT'],
    },
    {
        name: '🎥 奈飞视频',
        type: 'select',
        proxies: ['🚀 节点选择', '♻️ 自动选择', '☑️ 手动切换', '🇭🇰 香港节点', '🇹🇼 台湾节点', '🇯🇵 日本节点', '🇸🇬 狮城节点', '🇺🇸 美国节点', '🇰🇷 韩国节点', '🇬🇧 英国节点', '🇩🇪 德国节点', '🇫🇷 法国节点', '🇮🇳 印度节点', '🇦🇺 澳洲节点', '🇨🇦 加拿大节点', 'DIRECT'],
    },
    {
        name: '🌍 国外媒体',
        type: 'select',
        proxies: ['🚀 节点选择', '♻️ 自动选择', '☑️ 手动切换', '🇭🇰 香港节点', '🇹🇼 台湾节点', '🇯🇵 日本节点', '🇸🇬 狮城节点', '🇺🇸 美国节点', '🇰🇷 韩国节点', '🇬🇧 英国节点', '🇩🇪 德国节点', '🇫🇷 法国节点', '🇮🇳 印度节点', '🇦🇺 澳洲节点', 'DIRECT'],
    },
    {
        name: '📲 电报信息',
        type: 'select',
        proxies: ['🚀 节点选择', '🇭🇰 香港节点', '🇹🇼 台湾节点', '🇯🇵 日本节点', '🇸🇬 狮城节点', '🇺🇸 美国节点', '🇰🇷 韩国节点', '🇬🇧 英国节点', '🇩🇪 德国节点', '🇳🇱 荷兰节点', '🇮🇳 印度节点', '🇹🇷 土耳其节点', 'DIRECT'],
    },
    {
        name: '🤖 OpenAi',
        type: 'select',
        proxies: ['🚀 节点选择', '♻️ 自动选择', '☑️ 手动切换', '🇺🇸 美国节点', '🇯🇵 日本节点', '🇸🇬 狮城节点', '🇬🇧 英国节点', '🇩🇪 德国节点', '🇫🇷 法国节点', '🇮🇳 印度节点', '🇨🇦 加拿大节点', '🇦🇺 澳洲节点', '🇳🇱 荷兰节点', '🇮🇪 爱尔兰节点', '🇫🇮 芬兰节点', '🇸🇪 瑞典节点', 'DIRECT'],
    },
    {
        name: '🛸 Antigravity',
        type: 'select',
        proxies: ['♻️ 自动选择', '☑️ 手动切换', '🇭🇰 香港节点', '🇹🇼 台湾节点', '🇯🇵 日本节点', '🇸🇬 狮城节点', '🇺🇸 美国节点', '🇰🇷 韩国节点', '🇬🇧 英国节点', '🇩🇪 德国节点', '🇫🇷 法国节点', '🇳🇱 荷兰节点', '🇷🇺 俄罗斯节点', '🇮🇳 印度节点', '🇹🇷 土耳其节点', '🇨🇦 加拿大节点', '🇦🇺 澳洲节点', '🇫🇮 芬兰节点', '🇸🇪 瑞典节点', '🇨🇭 瑞士节点', 'DIRECT'],
    },
    {
        name: 'Ⓜ️ 微软服务',
        type: 'select',
        proxies: ['🎯 全球直连', '🚀 节点选择', '🇭🇰 香港节点', '🇹🇼 台湾节点', '🇯🇵 日本节点', '🇸🇬 狮城节点', '🇺🇸 美国节点', '🇰🇷 韩国节点', '🇬🇧 英国节点', '🇩🇪 德国节点', '🇫🇷 法国节点', '🇮🇳 印度节点', '🇳🇱 荷兰节点', '🇮🇪 爱尔兰节点', 'DIRECT'],
    },
    {
        name: '🍎 苹果服务',
        type: 'select',
        proxies: ['🚀 节点选择', '🎯 全球直连', '🇭🇰 香港节点', '🇹🇼 台湾节点', '🇯🇵 日本节点', '🇸🇬 狮城节点', '🇺🇸 美国节点', '🇰🇷 韩国节点', '🇬🇧 英国节点', '🇮🇳 印度节点', '🇦🇺 澳洲节点', 'DIRECT'],
    },
    {
        name: '📢 谷歌FCM',
        type: 'select',
        proxies: ['🚀 节点选择', '🎯 全球直连', '♻️ 自动选择', '☑️ 手动切换', '🇭🇰 香港节点', '🇹🇼 台湾节点', '🇯🇵 日本节点', '🇸🇬 狮城节点', '🇺🇸 美国节点', '🇰🇷 韩国节点', '🇬🇧 英国节点', '🇩🇪 德国节点', '🇮🇳 印度节点', 'DIRECT'],
    },
    {
        name: '🎯 全球直连',
        type: 'select',
        proxies: ['DIRECT', '🚀 节点选择', '♻️ 自动选择', '☑️ 手动切换'],
    },
    {
        name: '🛑 全球拦截',
        type: 'select',
        proxies: ['REJECT', 'DIRECT'],
    },
    {
        name: '🍃 应用净化',
        type: 'select',
        proxies: ['REJECT', 'DIRECT'],
    },
    {
        name: '🐟 漏网之鱼',
        type: 'select',
        proxies: ['🚀 节点选择', '🎯 全球直连', '♻️ 自动选择', '☑️ 手动切换', '🇭🇰 香港节点', '🇹🇼 台湾节点', '🇯🇵 日本节点', '🇸🇬 狮城节点', '🇺🇸 美国节点', '🇰🇷 韩国节点', '🇬🇧 英国节点', '🇩🇪 德国节点', '🇫🇷 法国节点', '🇳🇱 荷兰节点', '🇮🇳 印度节点', '🇫🇮 芬兰节点', 'DIRECT'],
    },
];

/**
 * 国家/地区节点匹配正则表达式
 * 来自 A4ss.ini 的 custom_proxy_group 定义
 */
export const A4SS_COUNTRY_PATTERNS = {
    // 东亚
    '🇭🇰 香港节点': /(港|HK|hk|Hong Kong|HongKong|hongkong|HKG)/i,
    '🇲🇴 澳门节点': /(澳门|MO|Macau|macao)/i,
    '🇹🇼 台湾节点': /(台|新北|彰化|TW|Taiwan|taipei)/i,
    '🇯🇵 日本节点': /(日本|川日|东京|大阪|泉日|埼玉|沪日|深日|JP|Japan|tokyo|osaka)/i,
    '🇰🇷 韩国节点': /(韩国|韩|KR|Korea|KOR|首尔|seoul|春川)/i,
    '🇲🇳 蒙古节点': /(蒙古|Mongolia|乌兰巴托)/i,
    // 东南亚
    '🇸🇬 狮城节点': /(新加坡|坡|狮城|SG|Singapore)/i,
    '🇲🇾 马来节点': /(马来西亚|马来|MY|Malaysia|吉隆坡)/i,
    '🇹🇭 泰国节点': /(泰国|TH|Thailand|曼谷)/i,
    '🇻🇳 越南节点': /(越南|VN|Vietnam|胡志明|河内)/i,
    '🇵🇭 菲律宾节点': /(菲律宾|PH|Philippines|马尼拉)/i,
    '🇮🇩 印尼节点': /(印度尼西亚|印尼|ID|Indonesia|雅加达)/i,
    '🇰🇭 柬埔寨节点': /(柬埔寨|Cambodia|金边)/i,
    '🇲🇲 缅甸节点': /(缅甸|Myanmar|仰光)/i,
    '🇱🇦 老挝节点': /(老挝|Laos|万象)/i,
    // 南亚
    '🇮🇳 印度节点': /(印度|India|孟买|新德里|Mumbai|Delhi)/i,
    '🇵🇰 巴基斯坦节点': /(巴基斯坦|Pakistan|卡拉奇|伊斯兰堡)/i,
    '🇧🇩 孟加拉节点': /(孟加拉|Bangladesh|达卡)/i,
    // 中亚
    '🇰🇿 哈萨克节点': /(哈萨克斯坦|哈萨克|Kazakhstan|阿拉木图)/i,
    // 中东
    '🇦🇪 阿联酋节点': /(阿联酋|United Arab Emirates|迪拜|Dubai|阿布扎比)/i,
    '🇸🇦 沙特节点': /(沙特|Saudi Arabia|沙特阿拉伯|利雅得)/i,
    '🇮🇱 以色列节点': /(以色列|Israel|特拉维夫)/i,
    '🇹🇷 土耳其节点': /(土耳其|Turkey|伊斯坦布尔|安卡拉)/i,
    '🇮🇷 伊朗节点': /(伊朗|Iran|德黑兰)/i,
    '🇮🇶 伊拉克节点': /(伊拉克|Iraq|巴格达)/i,
    '🇶🇦 卡塔尔节点': /(卡塔尔|Qatar|多哈)/i,
    // 北美
    '🇺🇸 美国节点': /(美国|美|波特兰|达拉斯|俄勒冈|凤凰城|费利蒙|硅谷|拉斯维加斯|洛杉矶|圣何塞|圣克拉拉|西雅图|芝加哥|US|USA|United States|ATL|BUF|DFW|EWR|IAD|LAX|MCI|MIA|ORD|PHX|PDX|SEA|SJC)/i,
    '🇨🇦 加拿大节点': /(加拿大|CA|Canada|多伦多|温哥华|蒙特利尔)/i,
    '🇲🇽 墨西哥节点': /(墨西哥|Mexico|墨城)/i,
    // 中美
    '🇵🇦 巴拿马节点': /(巴拿马|Panama)/i,
    // 南美
    '🇧🇷 巴西节点': /(巴西|Brazil|圣保罗|里约)/i,
    '🇦🇷 阿根廷节点': /(阿根廷|Argentina|布宜诺斯艾利斯)/i,
    '🇨🇱 智利节点': /(智利|Chile|圣地亚哥)/i,
    '🇨🇴 哥伦比亚节点': /(哥伦比亚|Colombia|波哥大)/i,
    '🇵🇪 秘鲁节点': /(秘鲁|Peru|利马)/i,
    '🇻🇪 委内瑞拉节点': /(委内瑞拉|Venezuela|加拉加斯)/i,
    '🇪🇨 厄瓜多尔节点': /(厄瓜多尔|Ecuador|基多)/i,
    '🇺🇾 乌拉圭节点': /(乌拉圭|Uruguay|蒙得维的亚)/i,
    // 西欧
    '🇬🇧 英国节点': /(英国|UK|GB|United Kingdom|Britain|伦敦|London|曼彻斯特)/i,
    '🇩🇪 德国节点': /(德国|DE|Germany|法兰克福|柏林|慕尼黑|Frankfurt)/i,
    '🇫🇷 法国节点': /(法国|FR|France|巴黎|Paris|马赛)/i,
    '🇳🇱 荷兰节点': /(荷兰|NL|Netherlands|阿姆斯特丹|Amsterdam)/i,
    '🇧🇪 比利时节点': /(比利时|Belgium|布鲁塞尔)/i,
    '🇨🇭 瑞士节点': /(瑞士|Switzerland|苏黎世|日内瓦)/i,
    '🇦🇹 奥地利节点': /(奥地利|Austria|维也纳)/i,
    '🇮🇪 爱尔兰节点': /(爱尔兰|Ireland|都柏林)/i,
    '🇱🇺 卢森堡节点': /(卢森堡|Luxembourg)/i,
    // 北欧
    '🇸🇪 瑞典节点': /(瑞典|Sweden|斯德哥尔摩)/i,
    '🇳🇴 挪威节点': /(挪威|Norway|奥斯陆)/i,
    '🇫🇮 芬兰节点': /(芬兰|Finland|赫尔辛基)/i,
    '🇩🇰 丹麦节点': /(丹麦|Denmark|哥本哈根)/i,
    '🇮🇸 冰岛节点': /(冰岛|Iceland|雷克雅未克)/i,
    // 南欧
    '🇮🇹 意大利节点': /(意大利|Italy|米兰|罗马|都灵)/i,
    '🇪🇸 西班牙节点': /(西班牙|Spain|马德里|巴塞罗那)/i,
    '🇵🇹 葡萄牙节点': /(葡萄牙|Portugal|里斯本)/i,
    '🇬🇷 希腊节点': /(希腊|Greece|雅典)/i,
    // 东欧
    '🇷🇺 俄罗斯节点': /(俄罗斯|俄|RU|Russia|莫斯科|圣彼得堡|Moscow)/i,
    '🇺🇦 乌克兰节点': /(乌克兰|Ukraine|基辅)/i,
    '🇧🇾 白俄罗斯节点': /(白俄罗斯|Belarus|明斯克)/i,
    '🇵🇱 波兰节点': /(波兰|Poland|华沙)/i,
    '🇨🇿 捷克节点': /(捷克|Czech|布拉格)/i,
    '🇸🇰 斯洛伐克节点': /(斯洛伐克|Slovakia|布拉迪斯拉发)/i,
    '🇭🇺 匈牙利节点': /(匈牙利|Hungary|布达佩斯)/i,
    '🇷🇴 罗马尼亚节点': /(罗马尼亚|Romania|布加勒斯特)/i,
    '🇧🇬 保加利亚节点': /(保加利亚|Bulgaria|索非亚)/i,
    '🇲🇩 摩尔多瓦节点': /(摩尔多瓦|Moldova|基希讷乌)/i,
    // 波罗的海
    '🇱🇻 拉脱维亚节点': /(拉脱维亚|Latvia|里加)/i,
    '🇱🇹 立陶宛节点': /(立陶宛|Lithuania|维尔纽斯)/i,
    '🇪🇪 爱沙尼亚节点': /(爱沙尼亚|Estonia|塔林)/i,
    // 巴尔干
    '🇸🇮 斯洛文尼亚节点': /(斯洛文尼亚|Slovenia|卢布尔雅那)/i,
    '🇭🇷 克罗地亚节点': /(克罗地亚|Croatia|萨格勒布)/i,
    '🇷🇸 塞尔维亚节点': /(塞尔维亚|Serbia|贝尔格莱德)/i,
    // 大洋洲
    '🇦🇺 澳洲节点': /(澳洲|澳大利亚|AU|Australia|悉尼|墨尔本|Sydney|Melbourne)/i,
    '🇳🇿 新西兰节点': /(新西兰|New Zealand|奥克兰)/i,
    // 非洲
    '🇿🇦 南非节点': /(南非|South Africa|约翰内斯堡|开普敦)/i,
    '🇪🇬 埃及节点': /(埃及|Egypt|开罗)/i,
    '🇳🇬 尼日利亚节点': /(尼日利亚|Nigeria|拉各斯)/i,
    '🇰🇪 肯尼亚节点': /(肯尼亚|Kenya|内罗毕)/i,
};

/**
 * 获取策略组所需引用的所有国家分组名称
 */
export function getRequiredCountryGroups() {
    const countryGroups = new Set();
    A4SS_PROXY_GROUPS.forEach(group => {
        if (group.proxies) {
            group.proxies.forEach(proxy => {
                if (proxy.includes('节点') && !['☑️ 手动切换', '♻️ 自动选择', '🚀 节点选择'].includes(proxy)) {
                    countryGroups.add(proxy);
                }
            });
        }
    });
    return Array.from(countryGroups);
}

/**
 * 根据节点名称匹配国家分组
 * @param {string} nodeName 节点名称
 * @returns {string|null} 匹配的国家分组名称，未匹配返回 null
 */
export function matchCountryGroup(nodeName) {
    for (const [groupName, pattern] of Object.entries(A4SS_COUNTRY_PATTERNS)) {
        if (pattern.test(nodeName)) {
            return groupName;
        }
    }
    return null;
}

/**
 * 获取所有国家分组名称
 */
export function getAllCountryGroupNames() {
    return Object.keys(A4SS_COUNTRY_PATTERNS);
}

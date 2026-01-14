/**
 * ACL4SSR 配置解析器
 * 本地嵌入 A4ss.ini 配置，无需远程获取
 */

// 本地嵌入的 A4ss.ini 配置内容
const EMBEDDED_ACL4SSR_CONFIG = `
[custom]
ruleset=🎯 全球直连,https://gh-proxy.com/https://raw.githubusercontent.com/cmliu/ACL4SSR/refs/heads/main/Clash/CFnat.list
ruleset=🎯 全球直连,https://gh-proxy.com/https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/LocalAreaNetwork.list
ruleset=🎯 全球直连,https://gh-proxy.com/https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/UnBan.list
ruleset=🛑 全球拦截,https://gh-proxy.com/https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanAD.list
ruleset=🍃 应用净化,https://gh-proxy.com/https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanProgramAD.list
ruleset=🍃 应用净化,https://gh-proxy.com/https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/adobe.list
ruleset=🍃 应用净化,https://gh-proxy.com/https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/IDM.list
ruleset=📢 谷歌FCM,https://gh-proxy.com/https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/GoogleFCM.list
ruleset=🎯 全球直连,https://gh-proxy.com/https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/GoogleCN.list
ruleset=🎯 全球直连,https://gh-proxy.com/https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/SteamCN.list
ruleset=Ⓜ️ 微软服务,https://gh-proxy.com/https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Microsoft.list
ruleset=🍎 苹果服务,https://gh-proxy.com/https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Apple.list
ruleset=📲 电报信息,https://gh-proxy.com/https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Telegram.list
ruleset=🤖 OpenAi,https://gh-proxy.com/https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/OpenAi.list
ruleset=🤖 OpenAi,https://gh-proxy.com/https://raw.githubusercontent.com/juewuy/ShellClash/master/rules/ai.list
ruleset=🤖 OpenAi,https://gh-proxy.com/https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/Copilot.list
ruleset=🤖 OpenAi,https://gh-proxy.com/https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/GithubCopilot.list
ruleset=🤖 OpenAi,https://gh-proxy.com/https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/Claude.list
ruleset=🛸 Antigravity,https://gh-proxy.com/https://raw.githubusercontent.com/ryty1/ACL4SSR/master/Clash/antigravity.list
ruleset=📹 油管视频,https://gh-proxy.com/https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/YouTube.list
ruleset=🎥 奈飞视频,https://gh-proxy.com/https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Netflix.list
ruleset=🌍 国外媒体,https://gh-proxy.com/https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyMedia.list
ruleset=🌍 国外媒体,https://gh-proxy.com/https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/Emby.list
ruleset=🚀 节点选择,https://gh-proxy.com/https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyLite.list
ruleset=🚀 节点选择,https://gh-proxy.com/https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/CMBlog.list
ruleset=🎯 全球直连,https://gh-proxy.com/https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaDomain.list
ruleset=🎯 全球直连,https://gh-proxy.com/https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaCompanyIp.list
ruleset=🎯 全球直连,https://gh-proxy.com/https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/ChinaCompanyDomain.list
ruleset=🎯 全球直连,https://gh-proxy.com/https://raw.githubusercontent.com/ryty1/ACL4SSR/master/Clash/zdy.list
ruleset=🎯 全球直连,[]GEOIP,CN
ruleset=🐟 漏网之鱼,[]FINAL

custom_proxy_group=🚀 节点选择\`select\`[]♻️ 自动选择\`[]☑️ 手动切换\`[]🇭🇰 香港节点\`[]🇲🇴 澳门节点\`[]🇹🇼 台湾节点\`[]🇯🇵 日本节点\`[]🇸🇬 狮城节点\`[]🇰🇷 韩国节点\`[]🇺🇸 美国节点\`[]🇬🇧 英国节点\`[]🇩🇪 德国节点\`[]🇫🇷 法国节点\`[]🇳🇱 荷兰节点\`[]🇷🇺 俄罗斯节点\`[]🇮🇳 印度节点\`[]🇹🇷 土耳其节点\`[]🇨🇦 加拿大节点\`[]🇦🇺 澳洲节点\`[]🇫🇮 芬兰节点\`[]DIRECT
custom_proxy_group=☑️ 手动切换\`select\`.*
custom_proxy_group=♻️ 自动选择\`url-test\`.*\`http://www.gstatic.com/generate_204\`300,,50
custom_proxy_group=📹 油管视频\`select\`[]🚀 节点选择\`[]♻️ 自动选择\`[]☑️ 手动切换\`[]🇭🇰 香港节点\`[]🇹🇼 台湾节点\`[]🇯🇵 日本节点\`[]🇸🇬 狮城节点\`[]🇺🇸 美国节点\`[]🇰🇷 韩国节点\`[]🇬🇧 英国节点\`[]🇩🇪 德国节点\`[]🇫🇷 法国节点\`[]🇮🇳 印度节点\`[]🇦🇺 澳洲节点\`[]DIRECT
custom_proxy_group=🎥 奈飞视频\`select\`[]🚀 节点选择\`[]♻️ 自动选择\`[]☑️ 手动切换\`[]🇭🇰 香港节点\`[]🇹🇼 台湾节点\`[]🇯🇵 日本节点\`[]🇸🇬 狮城节点\`[]🇺🇸 美国节点\`[]🇰🇷 韩国节点\`[]🇬🇧 英国节点\`[]🇩🇪 德国节点\`[]🇫🇷 法国节点\`[]🇮🇳 印度节点\`[]🇦🇺 澳洲节点\`[]🇨🇦 加拿大节点\`[]DIRECT
custom_proxy_group=🌍 国外媒体\`select\`[]🚀 节点选择\`[]♻️ 自动选择\`[]☑️ 手动切换\`[]🇭🇰 香港节点\`[]🇹🇼 台湾节点\`[]🇯🇵 日本节点\`[]🇸🇬 狮城节点\`[]🇺🇸 美国节点\`[]🇰🇷 韩国节点\`[]🇬🇧 英国节点\`[]🇩🇪 德国节点\`[]🇫🇷 法国节点\`[]🇮🇳 印度节点\`[]🇦🇺 澳洲节点\`[]DIRECT
custom_proxy_group=📲 电报信息\`select\`[]🚀 节点选择\`[]🇭🇰 香港节点\`[]🇹🇼 台湾节点\`[]🇯🇵 日本节点\`[]🇸🇬 狮城节点\`[]🇺🇸 美国节点\`[]🇰🇷 韩国节点\`[]🇬🇧 英国节点\`[]🇩🇪 德国节点\`[]🇳🇱 荷兰节点\`[]🇮🇳 印度节点\`[]🇹🇷 土耳其节点\`[]DIRECT
custom_proxy_group=🤖 OpenAi\`select\`[]🚀 节点选择\`[]♻️ 自动选择\`[]☑️ 手动切换\`[]🇺🇸 美国节点\`[]🇯🇵 日本节点\`[]🇸🇬 狮城节点\`[]🇬🇧 英国节点\`[]🇩🇪 德国节点\`[]🇫🇷 法国节点\`[]🇮🇳 印度节点\`[]🇨🇦 加拿大节点\`[]🇦🇺 澳洲节点\`[]🇳🇱 荷兰节点\`[]🇮🇪 爱尔兰节点\`[]🇫🇮 芬兰节点\`[]🇸🇪 瑞典节点\`[]DIRECT
custom_proxy_group=🛸 Antigravity\`select\`[]♻️ 自动选择\`[]☑️ 手动切换\`[]🇭🇰 香港节点\`[]🇹🇼 台湾节点\`[]🇯🇵 日本节点\`[]🇸🇬 狮城节点\`[]🇺🇸 美国节点\`[]🇰🇷 韩国节点\`[]🇬🇧 英国节点\`[]🇩🇪 德国节点\`[]🇫🇷 法国节点\`[]🇳🇱 荷兰节点\`[]🇷🇺 俄罗斯节点\`[]🇮🇳 印度节点\`[]🇹🇷 土耳其节点\`[]🇨🇦 加拿大节点\`[]🇦🇺 澳洲节点\`[]🇫🇮 芬兰节点\`[]🇸🇪 瑞典节点\`[]🇨🇭 瑞士节点\`[]DIRECT
custom_proxy_group=Ⓜ️ 微软服务\`select\`[]🎯 全球直连\`[]🚀 节点选择\`[]🇭🇰 香港节点\`[]🇹🇼 台湾节点\`[]🇯🇵 日本节点\`[]🇸🇬 狮城节点\`[]🇺🇸 美国节点\`[]🇰🇷 韩国节点\`[]🇬🇧 英国节点\`[]🇩🇪 德国节点\`[]🇫🇷 法国节点\`[]🇮🇳 印度节点\`[]🇳🇱 荷兰节点\`[]🇮🇪 爱尔兰节点\`[]DIRECT
custom_proxy_group=🍎 苹果服务\`select\`[]🚀 节点选择\`[]🎯 全球直连\`[]🇭🇰 香港节点\`[]🇹🇼 台湾节点\`[]🇯🇵 日本节点\`[]🇸🇬 狮城节点\`[]🇺🇸 美国节点\`[]🇰🇷 韩国节点\`[]🇬🇧 英国节点\`[]🇮🇳 印度节点\`[]🇦🇺 澳洲节点\`[]DIRECT
custom_proxy_group=📢 谷歌FCM\`select\`[]🚀 节点选择\`[]🎯 全球直连\`[]♻️ 自动选择\`[]☑️ 手动切换\`[]🇭🇰 香港节点\`[]🇹🇼 台湾节点\`[]🇯🇵 日本节点\`[]🇸🇬 狮城节点\`[]🇺🇸 美国节点\`[]🇰🇷 韩国节点\`[]🇬🇧 英国节点\`[]🇩🇪 德国节点\`[]🇮🇳 印度节点\`[]DIRECT
custom_proxy_group=🎯 全球直连\`select\`[]DIRECT\`[]🚀 节点选择\`[]♻️ 自动选择\`[]☑️ 手动切换
custom_proxy_group=🛑 全球拦截\`select\`[]REJECT\`[]DIRECT
custom_proxy_group=🍃 应用净化\`select\`[]REJECT\`[]DIRECT
custom_proxy_group=🐟 漏网之鱼\`select\`[]🚀 节点选择\`[]🎯 全球直连\`[]♻️ 自动选择\`[]☑️ 手动切换\`[]🇭🇰 香港节点\`[]🇹🇼 台湾节点\`[]🇯🇵 日本节点\`[]🇸🇬 狮城节点\`[]🇺🇸 美国节点\`[]🇰🇷 韩国节点\`[]🇬🇧 英国节点\`[]🇩🇪 德国节点\`[]🇫🇷 法国节点\`[]🇳🇱 荷兰节点\`[]🇮🇳 印度节点\`[]🇫🇮 芬兰节点\`[]DIRECT

custom_proxy_group=🇭🇰 香港节点\`select\`(港|HK|hk|Hong Kong|HongKong|hongkong|HKG)
custom_proxy_group=🇲🇴 澳门节点\`select\`(澳门|MO|Macau|macao)
custom_proxy_group=🇹🇼 台湾节点\`select\`(台|新北|彰化|TW|Taiwan|taipei)
custom_proxy_group=🇯🇵 日本节点\`select\`(日本|川日|东京|大阪|泉日|埼玉|沪日|深日|[^-]日|JP|Japan|tokyo|osaka)
custom_proxy_group=🇰🇷 韩国节点\`select\`(韩国|韩|KR|Korea|KOR|首尔|seoul|春川)
custom_proxy_group=🇸🇬 狮城节点\`select\`(新加坡|坡|狮城|SG|Singapore)
custom_proxy_group=🇺🇸 美国节点\`select\`(美国|美|波特兰|达拉斯|俄勒冈|凤凰城|费利蒙|硅谷|拉斯维加斯|洛杉矶|圣何塞|圣克拉拉|西雅图|芝加哥|US|USA|United States|ATL|BUF|DFW|EWR|IAD|LAX|MCI|MIA|ORD|PHX|PDX|SEA|SJC)
custom_proxy_group=🇬🇧 英国节点\`select\`(英国|UK|GB|United Kingdom|Britain|伦敦|London|曼彻斯特)
custom_proxy_group=🇩🇪 德国节点\`select\`(德国|DE|Germany|法兰克福|柏林|慕尼黑|Frankfurt)
custom_proxy_group=🇫🇷 法国节点\`select\`(法国|FR|France|巴黎|Paris|马赛)
custom_proxy_group=🇳🇱 荷兰节点\`select\`(荷兰|NL|Netherlands|阿姆斯特丹|Amsterdam)
custom_proxy_group=🇷🇺 俄罗斯节点\`select\`(俄罗斯|俄|RU|Russia|莫斯科|圣彼得堡|Moscow)
custom_proxy_group=🇮🇳 印度节点\`select\`(印度|India|孟买|新德里|Mumbai|Delhi)
custom_proxy_group=🇹🇷 土耳其节点\`select\`(土耳其|Turkey|伊斯坦布尔|安卡拉)
custom_proxy_group=🇨🇦 加拿大节点\`select\`(加拿大|CA|Canada|多伦多|温哥华|蒙特利尔)
custom_proxy_group=🇦🇺 澳洲节点\`select\`(澳洲|澳大利亚|AU|Australia|悉尼|墨尔本|Sydney|Melbourne)
custom_proxy_group=🇫🇮 芬兰节点\`select\`(芬兰|Finland|赫尔辛基)
custom_proxy_group=🇸🇪 瑞典节点\`select\`(瑞典|Sweden|斯德哥尔摩)
custom_proxy_group=🇨🇭 瑞士节点\`select\`(瑞士|Switzerland|苏黎世|日内瓦)
custom_proxy_group=🇮🇪 爱尔兰节点\`select\`(爱尔兰|Ireland|都柏林)

enable_rule_generator=true
overwrite_original_rules=true
`;

/**
 * 获取嵌入的 ACL4SSR 配置（无需网络请求）
 * @returns {string} 配置内容
 */
export function getEmbeddedACL4SSRConfig() {
    return EMBEDDED_ACL4SSR_CONFIG;
}

/**
 * 解析 ACL4SSR .ini 配置文件
 * @param {string} iniContent - .ini 文件内容
 * @returns {Object} 解析后的配置对象
 */
export function parseACL4SSRConfig(iniContent) {
    const rulesets = [];
    const proxyGroups = [];

    const lines = iniContent.split('\n');

    for (const line of lines) {
        const trimmedLine = line.trim();

        // 跳过注释和空行
        if (!trimmedLine || trimmedLine.startsWith(';') || trimmedLine.startsWith('#')) {
            continue;
        }

        // 解析 ruleset
        if (trimmedLine.startsWith('ruleset=')) {
            const rulesetContent = trimmedLine.substring('ruleset='.length);
            const [group, ...urlParts] = rulesetContent.split(',');
            const url = urlParts.join(',').trim();

            rulesets.push({
                group: group.trim(),
                url: url
            });
        }

        // 解析 custom_proxy_group
        if (trimmedLine.startsWith('custom_proxy_group=')) {
            const groupContent = trimmedLine.substring('custom_proxy_group='.length);
            const parts = groupContent.split('`');

            if (parts.length >= 2) {
                const name = parts[0];
                const type = parts[1];
                const members = [];
                let urlTestConfig = null;
                let filter = null;

                for (let i = 2; i < parts.length; i++) {
                    const part = parts[i];
                    if (part.startsWith('[]')) {
                        // 引用其他分组
                        members.push(part.substring(2));
                    } else if (part.startsWith('http')) {
                        // URL 测试配置
                        urlTestConfig = { url: part };
                    } else if (part.match(/^\d+/)) {
                        // 间隔时间等数字配置
                        if (urlTestConfig) {
                            urlTestConfig.interval = parseInt(part);
                        }
                    } else if (part.startsWith('(') || part.includes('|')) {
                        // 节点筛选正则
                        filter = part;
                    } else if (part === 'DIRECT' || part === 'REJECT') {
                        members.push(part);
                    } else if (part === '.*') {
                        // 匹配所有节点
                        filter = '.*';
                    } else if (part) {
                        // 其他情况可能是筛选条件
                        if (!filter) {
                            filter = part;
                        }
                    }
                }

                proxyGroups.push({
                    name,
                    type,
                    members,
                    urlTestConfig,
                    filter
                });
            }
        }
    }

    return { rulesets, proxyGroups };
}

/**
 * 根据节点名称匹配分组筛选条件
 * @param {string} nodeName - 节点名称
 * @param {string} filter - 筛选正则表达式
 * @returns {boolean} 是否匹配
 */
export function matchNodeFilter(nodeName, filter) {
    if (!filter) return false;
    if (filter === '.*') return true;

    try {
        // 移除括号如果存在
        let pattern = filter;
        if (pattern.startsWith('(') && pattern.endsWith(')')) {
            pattern = pattern.slice(1, -1);
        }
        const regex = new RegExp(pattern, 'i');
        return regex.test(nodeName);
    } catch (e) {
        return false;
    }
}

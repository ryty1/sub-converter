/**
 * ACL4SSR 配置解析器
 * 解析 ACL4SSR 格式的 .ini 配置文件并生成 Clash 配置
 */

// 默认的 ACL4SSR 配置 URL
export const DEFAULT_ACL4SSR_CONFIG_URL = 'https://raw.githubusercontent.com/ryty1/ACL4SSR/master/Clash/config/ACL4SSR_ZDY.ini';

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

/**
 * 获取远程 ACL4SSR 配置
 * @param {string} url - 配置 URL
 * @returns {Promise<string>} 配置内容
 */
export async function fetchACL4SSRConfig(url = DEFAULT_ACL4SSR_CONFIG_URL) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch config: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Error fetching ACL4SSR config:', error);
        throw error;
    }
}

/**
 * 根据 ACL4SSR 配置生成 Clash proxy-groups
 * @param {Array} parsedGroups - 解析后的分组配置
 * @param {Array} proxyNames - 所有代理节点名称列表
 * @returns {Array} Clash 格式的 proxy-groups
 */
export function generateClashProxyGroups(parsedGroups, proxyNames) {
    const clashGroups = [];

    for (const group of parsedGroups) {
        const clashGroup = {
            name: group.name,
            type: group.type === 'url-test' ? 'url-test' : 'select'
        };

        const proxies = [];

        // 添加引用的分组
        for (const member of group.members) {
            proxies.push(member);
        }

        // 如果有筛选条件，添加匹配的节点
        if (group.filter) {
            for (const proxyName of proxyNames) {
                if (matchNodeFilter(proxyName, group.filter)) {
                    proxies.push(proxyName);
                }
            }
        }

        clashGroup.proxies = proxies;

        // URL 测试分组的额外配置
        if (group.type === 'url-test' && group.urlTestConfig) {
            clashGroup.url = group.urlTestConfig.url || 'http://www.gstatic.com/generate_204';
            clashGroup.interval = group.urlTestConfig.interval || 300;
            clashGroup.lazy = false;
        }

        clashGroups.push(clashGroup);
    }

    return clashGroups;
}

/**
 * 根据 ACL4SSR 配置生成 Clash rules
 * @param {Array} rulesets - 解析后的规则集
 * @returns {Promise<Array>} Clash 格式的规则
 */
export async function generateClashRulesFromACL4SSR(rulesets) {
    const rules = [];

    for (const ruleset of rulesets) {
        const { group, url } = ruleset;

        // 处理内联规则 (如 []GEOIP,CN)
        if (url.startsWith('[]')) {
            const inlineRule = url.substring(2);
            if (inlineRule === 'FINAL') {
                rules.push(`MATCH,${group}`);
            } else {
                rules.push(`${inlineRule},${group}`);
            }
            continue;
        }

        // 远程规则集需要下载解析
        try {
            const response = await fetch(url);
            if (response.ok) {
                const content = await response.text();
                const ruleLines = content.split('\n');

                for (const ruleLine of ruleLines) {
                    const trimmed = ruleLine.trim();
                    // 跳过注释和空行
                    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) {
                        continue;
                    }
                    // 添加规则并指定分组
                    if (trimmed.includes(',')) {
                        // 规则已包含类型，直接添加分组
                        rules.push(`${trimmed},${group}`);
                    } else {
                        // 纯域名，假设为 DOMAIN-SUFFIX
                        rules.push(`DOMAIN-SUFFIX,${trimmed},${group}`);
                    }
                }
            }
        } catch (error) {
            console.warn(`Failed to fetch ruleset from ${url}:`, error);
        }
    }

    return rules;
}

/**
 * 生成 Clash rule-providers 配置
 * @param {Array} rulesets - 解析后的规则集
 * @returns {Object} Clash 格式的 rule-providers
 */
export function generateClashRuleProviders(rulesets) {
    const ruleProviders = {};
    let index = 0;

    for (const ruleset of rulesets) {
        const { group, url } = ruleset;

        // 跳过内联规则
        if (url.startsWith('[]')) {
            continue;
        }

        // 从 URL 提取规则集名称
        const urlParts = url.split('/');
        let name = urlParts[urlParts.length - 1].replace('.list', '').replace('.txt', '');

        // 确保名称唯一
        if (ruleProviders[name]) {
            name = `${name}_${index}`;
        }

        ruleProviders[name] = {
            type: 'http',
            behavior: 'classical',
            url: url,
            path: `./ruleset/${name}.yaml`,
            interval: 86400
        };

        index++;
    }

    return ruleProviders;
}

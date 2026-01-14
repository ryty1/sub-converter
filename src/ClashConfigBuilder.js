import yaml from 'js-yaml';
import { CLASH_CONFIG, generateRules, generateClashRuleSets, getOutbounds, PREDEFINED_RULE_SETS } from './config.js';
import { BaseConfigBuilder } from './BaseConfigBuilder.js';
import { DeepCopy, parseCountryFromNodeName } from './utils.js';
import { t } from './i18n/index.js';
import { parseACL4SSRConfig, matchNodeFilter, DEFAULT_ACL4SSR_CONFIG_URL } from './ACL4SSRParser.js';

export class ClashConfigBuilder extends BaseConfigBuilder {
    constructor(inputString, selectedRules, customRules, baseConfig, lang, userAgent, groupByCountry) {
        if (!baseConfig) {
            baseConfig = CLASH_CONFIG;
        }
        super(inputString, baseConfig, lang, userAgent, groupByCountry);
        this.selectedRules = selectedRules;
        this.customRules = customRules;
        this.countryGroupNames = [];
        this.manualGroupName = null;
        this.acl4ssrConfig = null;
        // 使用 ACL4SSR 远程配置
        this.useACL4SSR = true;
    }

    getProxies() {
        return this.config.proxies || [];
    }

    getProxyName(proxy) {
        return proxy.name;
    }

    convertProxy(proxy) {
        switch (proxy.type) {
            case 'shadowsocks':
                const ssConfig = {
                    name: proxy.tag,
                    type: 'ss',
                    server: proxy.server,
                    port: proxy.server_port,
                    cipher: proxy.method,
                    password: proxy.password
                };

                // 处理插件配置
                if (proxy.plugin) {
                    ssConfig.plugin = proxy.plugin;
                    ssConfig['plugin-opts'] = {};

                    // 处理插件选项
                    if (proxy.plugin_opts) {
                        const opts = proxy.plugin_opts;

                        // 确保处理所有可能的参数
                        if (opts.mode !== undefined) {
                            ssConfig['plugin-opts'].mode = opts.mode;
                        }

                        if (opts.host !== undefined) {
                            ssConfig['plugin-opts'].host = opts.host;
                        }

                        if (opts.path !== undefined) {
                            ssConfig['plugin-opts'].path = opts.path;
                        }

                        if (opts.tls !== undefined) {
                            ssConfig['plugin-opts'].tls = opts.tls;
                        }

                        if (opts.peer !== undefined) {
                            ssConfig['plugin-opts'].peer = opts.peer;
                        }

                        if (opts.mux !== undefined) {
                            ssConfig['plugin-opts'].mux = opts.mux;
                        }

                        if (opts.skip_cert_verify !== undefined) {
                            ssConfig['plugin-opts'].allowInsecure = opts.skip_cert_verify;
                        }
                    }
                }

                // 添加客户端指纹
                if (proxy.tls?.utls?.fingerprint) {
                    ssConfig['client-fingerprint'] = proxy.tls.utls.fingerprint;
                } else if (proxy.transport?.type === 'ws' || proxy.plugin) {
                    // 对于WebSocket或插件配置，添加默认的firefox指纹
                    ssConfig['client-fingerprint'] = 'firefox';
                }

                // 为plugin-opts添加特殊标记，以便在YAML转储时以内联方式显示
                if (ssConfig['plugin-opts']) {
                    Object.defineProperty(ssConfig['plugin-opts'], '__inline', {
                        value: true,
                        enumerable: false,
                        writable: false
                    });
                }

                return ssConfig;
            case 'vmess':
                return {
                    name: proxy.tag,
                    type: proxy.type,
                    server: proxy.server,
                    port: proxy.server_port,
                    uuid: proxy.uuid,
                    alterId: proxy.alter_id,
                    cipher: proxy.security,
                    tls: proxy.tls?.enabled || false,
                    servername: proxy.tls?.server_name || '',
                    'skip-cert-verify': !!proxy.tls?.insecure,
                    network: proxy.transport?.type || proxy.network || 'tcp',
                    'ws-opts': proxy.transport?.type === 'ws'
                        ? {
                            path: proxy.transport.path,
                            headers: proxy.transport.headers
                        }
                        : undefined,
                    'http-opts': proxy.transport?.type === 'http'
                        ? (() => {
                            const opts = {
                                method: proxy.transport.method || 'GET',
                                path: Array.isArray(proxy.transport.path) ? proxy.transport.path : [proxy.transport.path || '/'],
                            };
                            if (proxy.transport.headers && Object.keys(proxy.transport.headers).length > 0) {
                                opts.headers = proxy.transport.headers;
                            }
                            return opts;
                        })()
                        : undefined,
                    'grpc-opts': proxy.transport?.type === 'grpc'
                        ? {
                            'grpc-service-name': proxy.transport.service_name
                        }
                        : undefined,
                    'h2-opts': proxy.transport?.type === 'h2'
                        ? {
                            path: proxy.transport.path,
                            host: proxy.transport.host
                        }
                        : undefined
                };
            case 'vless':
                return {
                    name: proxy.tag,
                    type: proxy.type,
                    server: proxy.server,
                    port: proxy.server_port,
                    uuid: proxy.uuid,
                    cipher: proxy.security,
                    tls: proxy.tls?.enabled || false,
                    'client-fingerprint': proxy.tls.utls?.fingerprint,
                    servername: proxy.tls?.server_name || '',
                    network: proxy.transport?.type || 'tcp',
                    'ws-opts': proxy.transport?.type === 'ws' ? {
                        path: proxy.transport.path,
                        headers: proxy.transport.headers
                    } : undefined,
                    'reality-opts': proxy.tls.reality?.enabled ? {
                        'public-key': proxy.tls.reality.public_key,
                        'short-id': proxy.tls.reality.short_id,
                    } : undefined,
                    'grpc-opts': proxy.transport?.type === 'grpc' ? {
                        'grpc-service-name': proxy.transport.service_name,
                    } : undefined,
                    tfo: proxy.tcp_fast_open,
                    'skip-cert-verify': !!proxy.tls?.insecure,
                    ...(typeof proxy.udp !== 'undefined' ? { udp: proxy.udp } : {}),
                    ...(proxy.alpn ? { alpn: proxy.alpn } : {}),
                    ...(proxy.packet_encoding ? { 'packet-encoding': proxy.packet_encoding } : {}),
                    'flow': proxy.flow ?? undefined,
                };
            case 'hysteria2':
                return {
                    name: proxy.tag,
                    type: proxy.type,
                    server: proxy.server,
                    port: proxy.server_port,
                    ...(proxy.ports ? { ports: proxy.ports } : {}),
                    obfs: proxy.obfs?.type,
                    'obfs-password': proxy.obfs?.password,
                    password: proxy.password,
                    auth: proxy.auth,
                    up: proxy.up,
                    down: proxy.down,
                    'recv-window-conn': proxy.recv_window_conn,
                    sni: proxy.tls?.server_name || '',
                    'skip-cert-verify': !!proxy.tls?.insecure,
                    ...(proxy.hop_interval !== undefined ? { 'hop-interval': proxy.hop_interval } : {}),
                    ...(proxy.alpn ? { alpn: proxy.alpn } : {}),
                    ...(proxy.fast_open !== undefined ? { 'fast-open': proxy.fast_open } : {}),
                };
            case 'trojan':
                return {
                    name: proxy.tag,
                    type: proxy.type,
                    server: proxy.server,
                    port: proxy.server_port,
                    password: proxy.password,
                    cipher: proxy.security,
                    tls: proxy.tls?.enabled || false,
                    'client-fingerprint': proxy.tls.utls?.fingerprint,
                    sni: proxy.tls?.server_name || '',
                    network: proxy.transport?.type || 'tcp',
                    'ws-opts': proxy.transport?.type === 'ws' ? {
                        path: proxy.transport.path,
                        headers: proxy.transport.headers
                    } : undefined,
                    'reality-opts': proxy.tls.reality?.enabled ? {
                        'public-key': proxy.tls.reality.public_key,
                        'short-id': proxy.tls.reality.short_id,
                    } : undefined,
                    'grpc-opts': proxy.transport?.type === 'grpc' ? {
                        'grpc-service-name': proxy.transport.service_name,
                    } : undefined,
                    tfo: proxy.tcp_fast_open,
                    'skip-cert-verify': !!proxy.tls?.insecure,
                    ...(proxy.alpn ? { alpn: proxy.alpn } : {}),
                    'flow': proxy.flow ?? undefined,
                };
            case 'tuic':
                return {
                    name: proxy.tag,
                    type: proxy.type,
                    server: proxy.server,
                    port: proxy.server_port,
                    uuid: proxy.uuid,
                    password: proxy.password,
                    'congestion-controller': proxy.congestion_control,
                    'skip-cert-verify': !!proxy.tls?.insecure,
                    ...(proxy.disable_sni !== undefined ? { 'disable-sni': proxy.disable_sni } : {}),
                    ...(proxy.tls?.alpn ? { alpn: proxy.tls.alpn } : {}),
                    'sni': proxy.tls?.server_name,
                    'udp-relay-mode': proxy.udp_relay_mode || 'native',
                    ...(proxy.zero_rtt !== undefined ? { 'zero-rtt': proxy.zero_rtt } : {}),
                    ...(proxy.reduce_rtt !== undefined ? { 'reduce-rtt': proxy.reduce_rtt } : {}),
                    ...(proxy.fast_open !== undefined ? { 'fast-open': proxy.fast_open } : {}),
                };
            case 'anytls':
                return {
                    name: proxy.tag,
                    type: 'anytls',
                    server: proxy.server,
                    port: proxy.server_port,
                    password: proxy.password,
                    ...(proxy.udp !== undefined ? { udp: proxy.udp } : {}),
                    ...(proxy.tls?.utls?.fingerprint ? { 'client-fingerprint': proxy.tls.utls.fingerprint } : {}),
                    ...(proxy.tls?.server_name ? { sni: proxy.tls.server_name } : {}),
                    ...(proxy.tls?.insecure !== undefined ? { 'skip-cert-verify': !!proxy.tls.insecure } : {}),
                    ...(proxy.tls?.alpn ? { alpn: proxy.tls.alpn } : {}),
                    ...(proxy['idle-session-check-interval'] !== undefined ? { 'idle-session-check-interval': proxy['idle-session-check-interval'] } : {}),
                    ...(proxy['idle-session-timeout'] !== undefined ? { 'idle-session-timeout': proxy['idle-session-timeout'] } : {}),
                    ...(proxy['min-idle-session'] !== undefined ? { 'min-idle-session': proxy['min-idle-session'] } : {}),
                };
            default:
                return proxy; // Return as-is if no specific conversion is defined
        }
    }

    addProxyToConfig(proxy) {
        this.config.proxies = this.config.proxies || [];

        // Find proxies with the same or partially matching name
        // 检查是否有完全相同名称的代理（而不是包含关系）
        const similarProxies = this.config.proxies.filter(p => p.name === proxy.name);

        // Check if there is a proxy with identical data excluding the 'name' field
        const isIdentical = similarProxies.some(p => {
            const { name: _, ...restOfProxy } = proxy; // Exclude the 'name' attribute
            const { name: __, ...restOfP } = p;       // Exclude the 'name' attribute
            return JSON.stringify(restOfProxy) === JSON.stringify(restOfP);
        });

        if (isIdentical) {
            // If there is a proxy with identical data, skip adding it
            return;
        }

        // If there are proxies with similar names but different data, modify the name
        if (similarProxies.length > 0) {
            proxy.name = `${proxy.name} ${similarProxies.length + 1}`;
        }

        // Add the proxy to the configuration
        this.config.proxies.push(proxy);
    }

    addAutoSelectGroup(proxyList) {
        this.config['proxy-groups'] = this.config['proxy-groups'] || [];
        const normalize = (s) => typeof s === 'string' ? s.trim() : s;
        const autoName = t('outboundNames.Auto Select');
        const exists = this.config['proxy-groups'].some(g => g && normalize(g.name) === normalize(autoName));
        if (exists) return;
        this.config['proxy-groups'].push({
            name: autoName,
            type: 'url-test',
            proxies: DeepCopy(proxyList),
            url: 'https://www.gstatic.com/generate_204',
            interval: 300,
            lazy: false
        });
    }

    addNodeSelectGroup(proxyList) {
        this.config['proxy-groups'] = this.config['proxy-groups'] || [];
        const normalize = (s) => typeof s === 'string' ? s.trim() : s;
        const nodeName = t('outboundNames.Node Select');
        const exists = this.config['proxy-groups'].some(g => g && normalize(g.name) === normalize(nodeName));
        if (exists) return;
        const list = [
            'DIRECT',
            'REJECT',
            t('outboundNames.Auto Select'),
            ...proxyList
        ];
        this.config['proxy-groups'].unshift({
            type: "select",
            name: nodeName,
            proxies: list
        });
    }

    buildSelectGroupMembers(proxyList = []) {
        const normalize = (s) => typeof s === 'string' ? s.trim() : s;
        const directReject = ['DIRECT', 'REJECT'];
        const base = this.groupByCountry
            ? [
                t('outboundNames.Node Select'),
                t('outboundNames.Auto Select'),
                ...(this.manualGroupName ? [this.manualGroupName] : []),
                ...((this.countryGroupNames || []))
            ]
            : [
                t('outboundNames.Node Select'),
                ...proxyList
            ];
        const combined = [...directReject, ...base].filter(Boolean);
        const seen = new Set();
        return combined.filter(name => {
            const key = normalize(name);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    addOutboundGroups(outbounds, proxyList) {
        outbounds.forEach(outbound => {
            if (outbound !== t('outboundNames.Node Select')) {
                const normalize = (s) => typeof s === 'string' ? s.trim() : s;
                const name = t(`outboundNames.${outbound}`);
                const exists = this.config['proxy-groups'].some(g => g && normalize(g.name) === normalize(name));
                if (!exists) {
                    const proxies = this.buildSelectGroupMembers(proxyList);
                    this.config['proxy-groups'].push({
                        type: "select",
                        name,
                        proxies
                    });
                }
            }
        });
    }

    addCustomRuleGroups(proxyList) {
        if (Array.isArray(this.customRules)) {
            this.customRules.forEach(rule => {
                const normalize = (s) => typeof s === 'string' ? s.trim() : s;
                const name = t(`outboundNames.${rule.name}`);
                const exists = this.config['proxy-groups'].some(g => g && normalize(g.name) === normalize(name));
                if (!exists) {
                    const proxies = this.buildSelectGroupMembers(proxyList);
                    this.config['proxy-groups'].push({
                        type: "select",
                        name,
                        proxies
                    });
                }
            });
        }
    }

    addFallBackGroup(proxyList) {
        const normalize = (s) => typeof s === 'string' ? s.trim() : s;
        const name = t('outboundNames.Fall Back');
        const exists = this.config['proxy-groups'].some(g => g && normalize(g.name) === normalize(name));
        if (exists) return;
        const proxies = this.buildSelectGroupMembers(proxyList);
        this.config['proxy-groups'].push({
            type: "select",
            name,
            proxies
        });
    }

    addCountryGroups() {
        const proxies = this.getProxies();
        const countryGroups = {};

        proxies.forEach(proxy => {
            const countryInfo = parseCountryFromNodeName(proxy.name);
            if (countryInfo) {
                const { name } = countryInfo;
                if (!countryGroups[name]) {
                    countryGroups[name] = { ...countryInfo, proxies: [] };
                }
                countryGroups[name].proxies.push(proxy.name);
            }
        });

        const normalize = (s) => typeof s === 'string' ? s.trim() : s;
        const existingNames = new Set((this.config['proxy-groups'] || []).map(g => normalize(g?.name)).filter(Boolean));

        const manualProxyNames = proxies.map(p => p?.name).filter(Boolean);
        const manualGroupName = manualProxyNames.length > 0 ? t('outboundNames.Manual Switch') : null;
        if (manualGroupName) {
            const manualNorm = normalize(manualGroupName);
            if (!existingNames.has(manualNorm)) {
                this.config['proxy-groups'].push({
                    name: manualGroupName,
                    type: 'select',
                    proxies: manualProxyNames
                });
                existingNames.add(manualNorm);
            }
        }

        const countries = Object.keys(countryGroups).sort((a, b) => a.localeCompare(b));
        const countryGroupNames = [];

        countries.forEach(country => {
            const { emoji, name, proxies } = countryGroups[country];
            const groupName = `${emoji} ${name}`;
            const norm = normalize(groupName);
            if (!existingNames.has(norm)) {
                this.config['proxy-groups'].push({
                    name: groupName,
                    type: 'url-test',
                    proxies: proxies,
                    url: 'https://www.gstatic.com/generate_204',
                    interval: 300,
                    lazy: false
                });
                existingNames.add(norm);
            }
            countryGroupNames.push(groupName);
        });

        const nodeSelectGroup = this.config['proxy-groups'].find(g => g && g.name === t('outboundNames.Node Select'));
        if (nodeSelectGroup && Array.isArray(nodeSelectGroup.proxies)) {
            const seen = new Set();
            const rebuilt = [
                'DIRECT',
                'REJECT',
                t('outboundNames.Auto Select'),
                ...(manualGroupName ? [manualGroupName] : []),
                ...countryGroupNames
            ].filter(Boolean);
            nodeSelectGroup.proxies = rebuilt.filter(name => {
                if (seen.has(name)) return false;
                seen.add(name);
                return true;
            });
        }
        this.countryGroupNames = countryGroupNames;
        this.manualGroupName = manualGroupName;
    }

    // 生成规则
    generateRules() {
        return generateRules(this.selectedRules, this.customRules);
    }

    /**
     * 获取并解析 ACL4SSR 远程配置
     */
    async fetchACL4SSRConfig() {
        try {
            const response = await fetch(DEFAULT_ACL4SSR_CONFIG_URL);
            if (!response.ok) {
                throw new Error(`Failed to fetch ACL4SSR config: ${response.status}`);
            }
            const content = await response.text();
            this.acl4ssrConfig = parseACL4SSRConfig(content);
            return this.acl4ssrConfig;
        } catch (error) {
            console.error('Error fetching ACL4SSR config:', error);
            this.useACL4SSR = false;
            return null;
        }
    }

    /**
     * 根据 ACL4SSR 配置生成代理分组
     */
    generateACL4SSRProxyGroups(proxyNames) {
        if (!this.acl4ssrConfig) return;

        const { proxyGroups } = this.acl4ssrConfig;
        this.config['proxy-groups'] = [];

        for (const group of proxyGroups) {
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
            // 但是：只有当分组没有成员引用时（即国家分组），才添加具体节点
            // 应用策略组（有成员引用的）不应该包含具体节点
            if (group.filter && group.members.length === 0) {
                for (const proxyName of proxyNames) {
                    if (matchNodeFilter(proxyName, group.filter)) {
                        proxies.push(proxyName);
                    }
                }
            }

            // 如果筛选后没有节点且没有成员引用，跳过这个分组（不创建空分组）
            // 空分组会导致 Clash 报错: 'use' or 'proxies' missing
            if (proxies.length === 0) {
                continue;
            }

            clashGroup.proxies = proxies;

            // URL 测试分组的额外配置
            if (group.type === 'url-test') {
                clashGroup.url = group.urlTestConfig?.url || 'http://www.gstatic.com/generate_204';
                clashGroup.interval = group.urlTestConfig?.interval || 300;
                clashGroup.lazy = false;
            }

            this.config['proxy-groups'].push(clashGroup);
        }
    }

    /**
     * 根据 ACL4SSR 配置生成规则（直接展开所有远程规则）
     */
    async generateACL4SSRRules() {
        if (!this.acl4ssrConfig) return [];

        const { rulesets } = this.acl4ssrConfig;
        const rules = [];

        // Clash/Mihomo 支持的规则类型
        const supportedRuleTypes = new Set([
            'DOMAIN', 'DOMAIN-SUFFIX', 'DOMAIN-KEYWORD', 'DOMAIN-REGEX',
            'GEOSITE', 'GEOIP', 'IP-CIDR', 'IP-CIDR6', 'IP-ASN',
            'SRC-GEOIP', 'SRC-IP-CIDR', 'SRC-PORT', 'DST-PORT',
            'PROCESS-NAME', 'PROCESS-PATH', 'RULE-SET', 'MATCH',
            'IN-PORT', 'IN-TYPE', 'IN-USER', 'IN-NAME',
            'SUB-RULE', 'AND', 'OR', 'NOT',
            'NETWORK'
        ]);

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

            // 远程规则集需要下载并展开
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

                        // 解析规则格式
                        if (trimmed.includes(',')) {
                            // 完整规则格式，直接添加分组
                            const parts = trimmed.split(',');
                            if (parts.length >= 2) {
                                const ruleType = parts[0].toUpperCase();
                                const ruleValue = parts[1];

                                // 跳过 Clash 不支持的规则类型
                                if (!supportedRuleTypes.has(ruleType)) {
                                    continue;
                                }

                                // 对于 IP 类规则，可能需要添加 no-resolve
                                if (ruleType.includes('IP-CIDR') || ruleType === 'GEOIP' || ruleType === 'IP-ASN') {
                                    if (parts.length > 2 && parts[2].toLowerCase() === 'no-resolve') {
                                        rules.push(`${ruleType},${ruleValue},${group},no-resolve`);
                                    } else {
                                        rules.push(`${ruleType},${ruleValue},${group},no-resolve`);
                                    }
                                } else {
                                    rules.push(`${ruleType},${ruleValue},${group}`);
                                }
                            }
                        } else if (trimmed.match(/^[a-zA-Z0-9][\w\-\.]*\.[a-zA-Z]{2,}$/)) {
                            // 纯域名，作为 DOMAIN-SUFFIX 处理
                            rules.push(`DOMAIN-SUFFIX,${trimmed},${group}`);
                        } else if (trimmed.match(/^[\d\.\/]+$/) && trimmed.includes('/')) {
                            // IP-CIDR 格式
                            rules.push(`IP-CIDR,${trimmed},${group},no-resolve`);
                        } else if (trimmed.match(/^[\da-fA-F:\/]+$/) && trimmed.includes(':')) {
                            // IPv6 CIDR 格式
                            rules.push(`IP-CIDR6,${trimmed},${group},no-resolve`);
                        }
                    }
                }
            } catch (error) {
                console.warn(`Failed to fetch ruleset from ${url}:`, error);
            }
        }

        // 不使用 rule-providers，直接使用展开的规则
        delete this.config['rule-providers'];
        return rules;
    }

    /**
     * 重写 build 方法以支持 ACL4SSR 配置
     */
    async build() {
        // 首先获取 ACL4SSR 配置
        if (this.useACL4SSR) {
            await this.fetchACL4SSRConfig();
        }

        const customItems = await this.parseCustomItems();
        this.addCustomItems(customItems);

        if (this.useACL4SSR && this.acl4ssrConfig) {
            // 使用 ACL4SSR 配置生成分组
            const proxyNames = this.getProxyList();
            this.generateACL4SSRProxyGroups(proxyNames);

            // 生成 ACL4SSR 规则（异步下载并展开）
            this.config.rules = await this.generateACL4SSRRules();
        } else {
            // 使用内置逻辑
            this.addSelectors();
        }

        return this.formatConfig();
    }

    formatConfig() {
        if (this.useACL4SSR && this.acl4ssrConfig) {
            // ACL4SSR 规则已在 build 方法中生成，不需要 rule-providers
            // 规则已经设置在 this.config.rules 中
        } else {
            // 使用内置规则生成逻辑
            const rules = this.generateRules();
            const ruleResults = [];

            const { site_rule_providers, ip_rule_providers } = generateClashRuleSets(this.selectedRules, this.customRules);
            this.config['rule-providers'] = {
                ...site_rule_providers,
                ...ip_rule_providers
            };

            rules.filter(rule => !!rule.domain_suffix || !!rule.domain_keyword).map(rule => {
                rule.domain_suffix.forEach(suffix => {
                    ruleResults.push(`DOMAIN-SUFFIX,${suffix},${t('outboundNames.' + rule.outbound)}`);
                });
                rule.domain_keyword.forEach(keyword => {
                    ruleResults.push(`DOMAIN-KEYWORD,${keyword},${t('outboundNames.' + rule.outbound)}`);
                });
            });

            rules.filter(rule => !!rule.site_rules[0]).map(rule => {
                rule.site_rules.forEach(site => {
                    ruleResults.push(`RULE-SET,${site},${t('outboundNames.' + rule.outbound)}`);
                });
            });

            rules.filter(rule => !!rule.ip_rules[0]).map(rule => {
                rule.ip_rules.forEach(ip => {
                    ruleResults.push(`RULE-SET,${ip},${t('outboundNames.' + rule.outbound)},no-resolve`);
                });
            });

            rules.filter(rule => !!rule.ip_cidr).map(rule => {
                rule.ip_cidr.forEach(cidr => {
                    ruleResults.push(`IP-CIDR,${cidr},${t('outboundNames.' + rule.outbound)},no-resolve`);
                });
            });

            this.config.rules = [...ruleResults];
            this.config.rules.push(`MATCH,${t('outboundNames.Fall Back')}`);
        }

        // Sanitize proxy-groups: ensure their proxy references exist
        const normalize = (s) => typeof s === 'string' ? s.trim() : s;
        const groups = this.config['proxy-groups'] || [];
        if (Array.isArray(groups) && groups.length > 0) {
            const proxyNames = new Set((this.config.proxies || []).map(p => normalize(p?.name)).filter(Boolean));
            const groupNames = new Set(groups.map(g => normalize(g?.name)).filter(Boolean));
            const validNames = new Set(['DIRECT', 'REJECT'].map(normalize));
            proxyNames.forEach(n => validNames.add(n));
            groupNames.forEach(n => validNames.add(n));

            this.config['proxy-groups'] = groups.map(g => {
                if (!g || !Array.isArray(g.proxies)) return g;
                const filtered = g.proxies
                    .map(x => typeof x === 'string' ? x.trim() : x)
                    .filter(x => typeof x === 'string' && validNames.has(x));
                // de-duplicate while preserving order
                const seen = new Set();
                const deduped = filtered.filter(x => (seen.has(x) ? false : (seen.add(x), true)));
                return { ...g, proxies: deduped };
            });
        }

        let yamlOutput = yaml.dump(this.config, {
            lineWidth: -1,
            noRefs: true,
            quotingType: '"',
            flowLevel: -1
        });

        // 修复 YAML 对特殊字符的不必要转义（如 \= 应该是 =）
        yamlOutput = yamlOutput.replace(/\\=/g, '=');
        yamlOutput = yamlOutput.replace(/\\&/g, '&');

        return yamlOutput;
    }
}

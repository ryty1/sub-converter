/**
 * A4ss Clash 配置构建器
 * 基于 A4ss.ini 的规则和策略组生成 Clash 配置
 */
import yaml from 'js-yaml';
import { CLASH_CONFIG } from './config.js';
import { BaseConfigBuilder } from './BaseConfigBuilder.js';
import { DeepCopy } from './utils.js';
import {
    A4SS_RULESETS,
    A4SS_SPECIAL_RULES,
    A4SS_PROXY_GROUPS,
    A4SS_COUNTRY_PATTERNS,
    matchCountryGroup,
    getAllCountryGroupNames
} from './a4ssRules.js';

export class A4ssClashConfigBuilder extends BaseConfigBuilder {
    constructor(inputString, baseConfig, lang, userAgent) {
        if (!baseConfig) {
            baseConfig = CLASH_CONFIG;
        }
        super(inputString, baseConfig, lang, userAgent, true);
        this.countryGroups = {}; // 国家分组 { groupName: [proxyNames] }
        this.allProxyNames = [];
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

                if (proxy.plugin) {
                    ssConfig.plugin = proxy.plugin;
                    ssConfig['plugin-opts'] = {};
                    if (proxy.plugin_opts) {
                        const opts = proxy.plugin_opts;
                        if (opts.mode !== undefined) ssConfig['plugin-opts'].mode = opts.mode;
                        if (opts.host !== undefined) ssConfig['plugin-opts'].host = opts.host;
                        if (opts.path !== undefined) ssConfig['plugin-opts'].path = opts.path;
                        if (opts.tls !== undefined) ssConfig['plugin-opts'].tls = opts.tls;
                        if (opts.peer !== undefined) ssConfig['plugin-opts'].peer = opts.peer;
                        if (opts.mux !== undefined) ssConfig['plugin-opts'].mux = opts.mux;
                        if (opts.skip_cert_verify !== undefined) ssConfig['plugin-opts'].allowInsecure = opts.skip_cert_verify;
                    }
                }
                if (proxy.tls?.utls?.fingerprint) {
                    ssConfig['client-fingerprint'] = proxy.tls.utls.fingerprint;
                } else if (proxy.transport?.type === 'ws' || proxy.plugin) {
                    ssConfig['client-fingerprint'] = 'chrome';
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
                        ? { path: proxy.transport.path, headers: proxy.transport.headers }
                        : undefined,
                    'grpc-opts': proxy.transport?.type === 'grpc'
                        ? { 'grpc-service-name': proxy.transport.service_name }
                        : undefined,
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
                    'client-fingerprint': proxy.tls?.utls?.fingerprint,
                    servername: proxy.tls?.server_name || '',
                    network: proxy.transport?.type || 'tcp',
                    'ws-opts': proxy.transport?.type === 'ws' ? {
                        path: proxy.transport.path,
                        headers: proxy.transport.headers
                    } : undefined,
                    'reality-opts': proxy.tls?.reality?.enabled ? {
                        'public-key': proxy.tls.reality.public_key,
                        'short-id': proxy.tls.reality.short_id,
                    } : undefined,
                    'grpc-opts': proxy.transport?.type === 'grpc' ? {
                        'grpc-service-name': proxy.transport.service_name,
                    } : undefined,
                    'skip-cert-verify': !!proxy.tls?.insecure,
                    ...(proxy.flow ? { 'flow': proxy.flow } : {}),
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
                    up: proxy.up,
                    down: proxy.down,
                    sni: proxy.tls?.server_name || '',
                    'skip-cert-verify': !!proxy.tls?.insecure,
                };

            case 'trojan':
                return {
                    name: proxy.tag,
                    type: proxy.type,
                    server: proxy.server,
                    port: proxy.server_port,
                    password: proxy.password,
                    sni: proxy.tls?.server_name || '',
                    'skip-cert-verify': !!proxy.tls?.insecure,
                    network: proxy.transport?.type || 'tcp',
                    'ws-opts': proxy.transport?.type === 'ws' ? {
                        path: proxy.transport.path,
                        headers: proxy.transport.headers
                    } : undefined,
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
                    'sni': proxy.tls?.server_name,
                    'udp-relay-mode': proxy.udp_relay_mode || 'native',
                };

            default:
                return proxy;
        }
    }

    addProxyToConfig(proxy) {
        this.config.proxies = this.config.proxies || [];

        const similarProxies = this.config.proxies.filter(p => p.name.includes(proxy.name));
        const isIdentical = similarProxies.some(p => {
            const { name: _, ...restOfProxy } = proxy;
            const { name: __, ...restOfP } = p;
            return JSON.stringify(restOfProxy) === JSON.stringify(restOfP);
        });

        if (isIdentical) return;

        if (similarProxies.length > 0) {
            proxy.name = `${proxy.name} ${similarProxies.length + 1}`;
        }

        this.config.proxies.push(proxy);
        this.allProxyNames.push(proxy.name);

        // 按国家分组
        const countryGroup = matchCountryGroup(proxy.name);
        if (countryGroup) {
            if (!this.countryGroups[countryGroup]) {
                this.countryGroups[countryGroup] = [];
            }
            this.countryGroups[countryGroup].push(proxy.name);
        }
    }

    // BaseConfigBuilder 抽象方法的空实现（A4ss 使用自定义逻辑）
    addAutoSelectGroup(proxyList) {
        // A4ss 使用 buildA4ssProxyGroups 替代
    }

    addNodeSelectGroup(proxyList) {
        // A4ss 使用 buildA4ssProxyGroups 替代
    }

    addOutboundGroups(outbounds, proxyList) {
        // A4ss 使用 buildA4ssProxyGroups 替代
    }

    addCustomRuleGroups(proxyList) {
        // A4ss 不使用自定义规则组
    }

    addFallBackGroup(proxyList) {
        // A4ss 在 buildA4ssProxyGroups 中处理
    }

    addCountryGroups() {
        // A4ss 在 buildA4ssProxyGroups 中处理
    }

    /**
     * 覆盖 BaseConfigBuilder 的 addSelectors 方法
     * 使用 A4ss 风格的策略组生成
     */
    addSelectors() {
        this.buildA4ssProxyGroups();
    }

    /**
     * 构建 A4ss 风格的策略组
     */
    buildA4ssProxyGroups() {
        this.config['proxy-groups'] = [];
        const existingCountryGroups = Object.keys(this.countryGroups);

        // 1. 先添加国家分组（url-test 类型）
        existingCountryGroups.forEach(groupName => {
            const proxies = this.countryGroups[groupName];
            if (proxies.length > 0) {
                this.config['proxy-groups'].push({
                    name: groupName,
                    type: 'url-test',
                    proxies: proxies,
                    url: 'http://www.gstatic.com/generate_204',
                    interval: 300,
                    tolerance: 50
                });
            }
        });

        // 2. 添加功能策略组
        A4SS_PROXY_GROUPS.forEach(groupDef => {
            const group = {
                name: groupDef.name,
                type: groupDef.type,
            };

            if (groupDef.type === 'url-test') {
                group.url = groupDef.url || 'http://www.gstatic.com/generate_204';
                group.interval = groupDef.interval || 300;
                group.tolerance = groupDef.tolerance || 50;
            }

            // 确定代理列表
            if (groupDef.filter === '.*') {
                // 包含所有节点
                group.proxies = DeepCopy(this.allProxyNames);
            } else if (groupDef.proxies) {
                // 使用预定义的代理列表，过滤掉不存在的国家分组
                group.proxies = groupDef.proxies.filter(p => {
                    if (p === 'DIRECT' || p === 'REJECT') return true;
                    if (['♻️ 自动选择', '☑️ 手动切换', '🚀 节点选择', '🎯 全球直连', '🛑 全球拦截', '🍃 应用净化', '🐟 漏网之鱼'].includes(p)) return true;
                    // 检查国家分组是否存在
                    if (p.includes('节点')) {
                        return existingCountryGroups.includes(p);
                    }
                    return true;
                });

                // 如果需要包含所有国家分组
                if (groupDef.includeCountries) {
                    // 在 ☑️ 手动切换 后面插入所有国家分组
                    const insertIdx = group.proxies.indexOf('☑️ 手动切换');
                    if (insertIdx !== -1) {
                        const countriesToAdd = existingCountryGroups.filter(c => !group.proxies.includes(c));
                        group.proxies.splice(insertIdx + 1, 0, ...countriesToAdd);
                    }
                }

                // 添加 DIRECT
                if (groupDef.appendDirect && !group.proxies.includes('DIRECT')) {
                    group.proxies.push('DIRECT');
                }
            }

            // 只有当 proxies 不为空时才添加
            if (group.proxies && group.proxies.length > 0) {
                this.config['proxy-groups'].push(group);
            }
        });

        // 调整策略组顺序：功能组在前，国家组在后
        const functionalGroups = this.config['proxy-groups'].filter(g =>
            !Object.keys(A4SS_COUNTRY_PATTERNS).includes(g.name)
        );
        const countryGroupsConfig = this.config['proxy-groups'].filter(g =>
            Object.keys(A4SS_COUNTRY_PATTERNS).includes(g.name)
        );
        this.config['proxy-groups'] = [...functionalGroups, ...countryGroupsConfig];
    }

    /**
     * 生成 A4ss 规则
     */
    generateA4ssRules() {
        const rules = [];

        // 添加 RULE-SET 规则
        A4SS_RULESETS.forEach(ruleset => {
            rules.push(`RULE-SET,${ruleset.url},${ruleset.group}`);
        });

        // 添加特殊规则
        A4SS_SPECIAL_RULES.forEach(rule => {
            if (rule.type === 'GEOIP') {
                rules.push(`GEOIP,${rule.value},${rule.group}`);
            } else if (rule.type === 'MATCH') {
                rules.push(`MATCH,${rule.group}`);
            }
        });

        return rules;
    }

    /**
     * 格式化并输出配置
     */
    formatConfig() {
        // 构建策略组
        this.buildA4ssProxyGroups();

        // 生成规则
        this.config.rules = this.generateA4ssRules();

        // 清理无效的策略组引用
        const validNames = new Set([
            'DIRECT', 'REJECT',
            ...this.allProxyNames,
            ...this.config['proxy-groups'].map(g => g.name)
        ]);

        this.config['proxy-groups'] = this.config['proxy-groups'].map(g => {
            if (!g.proxies) return g;
            const filtered = g.proxies.filter(p => validNames.has(p));
            return { ...g, proxies: filtered };
        }).filter(g => !g.proxies || g.proxies.length > 0);

        return yaml.dump(this.config, {
            lineWidth: -1,
            noRefs: true,
            quotingType: '"',
        });
    }
}

const PATH_LENGTH = 7;

// 自定义的字符串前缀检查函数
export function checkStartsWith(str, prefix) {
	if (str === undefined || str === null || prefix === undefined || prefix === null) {
		return false;
	}
	str = String(str);
	prefix = String(prefix);
	return str.slice(0, prefix.length) === prefix;
}


// Base64 编码函数
export function encodeBase64(input) {
	const encoder = new TextEncoder();
	const utf8Array = encoder.encode(input);
	let binaryString = '';
	for (const byte of utf8Array) {
		binaryString += String.fromCharCode(byte);
	}
	return base64FromBinary(binaryString);
}

// Base64 解码函数
export function decodeBase64(input) {
	const binaryString = base64ToBinary(input);
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	const decoder = new TextDecoder();
	return decoder.decode(bytes);
}

// 将二进制字符串转换为 Base64（编码）
export function base64FromBinary(binaryString) {
	const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	let base64String = '';
	let padding = '';

	const remainder = binaryString.length % 3;
	if (remainder > 0) {
		padding = '='.repeat(3 - remainder);
		binaryString += '\0'.repeat(3 - remainder);
	}

	for (let i = 0; i < binaryString.length; i += 3) {
		const bytes = [
			binaryString.charCodeAt(i),
			binaryString.charCodeAt(i + 1),
			binaryString.charCodeAt(i + 2)
		];
		const base64Index1 = bytes[0] >> 2;
		const base64Index2 = ((bytes[0] & 3) << 4) | (bytes[1] >> 4);
		const base64Index3 = ((bytes[1] & 15) << 2) | (bytes[2] >> 6);
		const base64Index4 = bytes[2] & 63;

		base64String += base64Chars[base64Index1] +
			base64Chars[base64Index2] +
			base64Chars[base64Index3] +
			base64Chars[base64Index4];
	}

	return base64String.slice(0, base64String.length - padding.length) + padding;
}

// 将 Base64 转换为二进制字符串（解码）
export function base64ToBinary(base64String) {
	const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	let binaryString = '';
	base64String = base64String.replace(/=+$/, ''); // 去掉末尾的 '='

	for (let i = 0; i < base64String.length; i += 4) {
		const bytes = [
			base64Chars.indexOf(base64String[i]),
			base64Chars.indexOf(base64String[i + 1]),
			base64Chars.indexOf(base64String[i + 2]),
			base64Chars.indexOf(base64String[i + 3])
		];
		const byte1 = (bytes[0] << 2) | (bytes[1] >> 4);
		const byte2 = ((bytes[1] & 15) << 4) | (bytes[2] >> 2);
		const byte3 = ((bytes[2] & 3) << 6) | bytes[3];

		if (bytes[1] !== -1) binaryString += String.fromCharCode(byte1);
		if (bytes[2] !== -1) binaryString += String.fromCharCode(byte2);
		if (bytes[3] !== -1) binaryString += String.fromCharCode(byte3);
	}

	return binaryString;
}

export function tryDecodeSubscriptionLines(input, { decodeUriComponent = false } = {}) {
	if (typeof input !== 'string') {
		return input;
	}

	const trimmed = input.trim();
	if (trimmed === '') {
		return trimmed;
	}

	const splitIfMultiple = (value) => {
		if (typeof value !== 'string') {
			return value;
		}

		const normalized = value.replace(/\r\n/g, '\n');
		const segments = normalized
			.split('\n')
			.map(segment => segment.trim())
			.filter(segment => segment !== '');

		if (segments.length > 1 && segments.some(segment => segment.includes('://'))) {
			return segments;
		}

		return normalized.trim();
	};

	const directResult = splitIfMultiple(trimmed);
	if (Array.isArray(directResult)) {
		return directResult;
	}
	if (typeof directResult === 'string' && directResult.includes('://')) {
		return directResult;
	}

	try {
		let decoded = decodeBase64(trimmed);
		if (decodeUriComponent && decoded.includes('%')) {
			const hasProtocolScheme = decoded.includes('://');
			if (!hasProtocolScheme) {
				try {
					decoded = decodeURIComponent(decoded);
				} catch (_) {
					// ignore URI decode errors and fall back to the decoded string
				}
			}
		}

		const decodedResult = splitIfMultiple(decoded);
		if (Array.isArray(decodedResult)) {
			return decodedResult;
		}
		if (typeof decodedResult === 'string' && decodedResult.includes('://')) {
			return decodedResult;
		}
	} catch (_) {
		// ignore decoding errors and return the original trimmed input
	}

	return trimmed;
}
export function DeepCopy(obj) {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}
	if (Array.isArray(obj)) {
		return obj.map(item => DeepCopy(item));
	}
	const newObj = {};
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			newObj[key] = DeepCopy(obj[key]);
		}
	}
	return newObj;
}

export function GenerateWebPath(length = PATH_LENGTH) {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	let result = ''
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length))
	}
	return result
}

export function parseServerInfo(serverInfo) {
	let host, port;
	if (serverInfo.startsWith('[')) {
		const closeBracketIndex = serverInfo.indexOf(']');
		host = serverInfo.slice(1, closeBracketIndex);
		port = serverInfo.slice(closeBracketIndex + 2); // +2 to skip ']:'
	} else {
		const lastColonIndex = serverInfo.lastIndexOf(':');
		host = serverInfo.slice(0, lastColonIndex);
		port = serverInfo.slice(lastColonIndex + 1);
	}
	return { host, port: parseInt(port) };
}

export function parseUrlParams(url) {
	const [, rest] = url.split('://');
	const [addressPart, ...remainingParts] = rest.split('?');
	const paramsPart = remainingParts.join('?');

	const [paramsOnly, ...fragmentParts] = paramsPart.split('#');

	// 在使用 URLSearchParams 之前，先提取 path 参数
	// 因为 URLSearchParams 会把 path 中的 %26 (编码的 &) 解码后当作参数分隔符
	let pathValue = null;
	const pathMatch = paramsOnly.match(/path=([^&]*(?:%26[^&]*)*)/);
	if (pathMatch) {
		pathValue = pathMatch[1];
	}

	const searchParams = new URLSearchParams(paramsOnly);
	const params = Object.fromEntries(searchParams.entries());

	// 恢复正确的 path 值（保留了 %26 编码的 & 符号）
	if (pathValue) {
		try {
			params.path = decodeURIComponent(pathValue);
		} catch (e) {
			params.path = pathValue;
		}
	}

	let name = fragmentParts.length > 0 ? fragmentParts.join('#') : '';
	try {
		name = decodeURIComponent(name);
	} catch (error) { };

	return { addressPart, params, name };
}

export function createTlsConfig(params) {
	let tls = { enabled: false };
	if (params.security != 'none') {
		tls = {
			enabled: true,
			server_name: params.sni || params.host,
			insecure: !!params?.allowInsecure || !!params?.insecure || !!params?.allow_insecure,
			// utls: {
			//   enabled: true,
			//   fingerprint: "chrome"
			// },
		};
		if (params.security === 'reality') {
			tls.reality = {
				enabled: true,
				public_key: params.pbk,
				short_id: params.sid,
			};
		}
	}
	return tls;
}

export function createTransportConfig(params) {
	return {
		type: params.type,
		path: params.path ?? undefined,
		...(params.host && { 'headers': { 'host': params.host } }),
		...(params.type === 'grpc' && {
			service_name: params.serviceName ?? undefined,
		})
	};
}

// Parse boolean value from various formats
export function parseBool(value, fallback = undefined) {
	if (value === undefined || value === null) return fallback;
	if (typeof value === 'boolean') return value;
	const lowered = String(value).toLowerCase();
	if (lowered === 'true' || lowered === '1') return true;
	if (lowered === 'false' || lowered === '0') return false;
	return fallback;
}

// Parse number value safely
export function parseMaybeNumber(value) {
	if (value === undefined || value === null) return undefined;
	const num = Number(value);
	return Number.isNaN(num) ? undefined : num;
}

// Parse comma-separated string to array
export function parseArray(value) {
	if (!value) return undefined;
	if (Array.isArray(value)) return value;
	return String(value)
		.split(',')
		.map(entry => entry.trim())
		.filter(entry => entry.length > 0);
}

export function parseCountryFromNodeName(nodeName) {
	const countryData = {
		// 亚洲 - Asia
		'HK': { name: 'Hong Kong', emoji: '🇭🇰', aliases: ['香港', 'Hong Kong', 'HK', '港'] },
		'TW': { name: 'Taiwan', emoji: '🇹🇼', aliases: ['台湾', 'Taiwan', 'TW', '台'] },
		'JP': { name: 'Japan', emoji: '🇯🇵', aliases: ['日本', 'Japan', 'JP', '日'] },
		'KR': { name: 'Korea', emoji: '🇰🇷', aliases: ['韩国', 'Korea', 'KR', '韩', 'South Korea'] },
		'SG': { name: 'Singapore', emoji: '🇸🇬', aliases: ['新加坡', 'Singapore', 'SG', '狮城'] },
		'MY': { name: 'Malaysia', emoji: '🇲🇾', aliases: ['马来西亚', 'Malaysia', 'MY', '马来'] },
		'TH': { name: 'Thailand', emoji: '🇹🇭', aliases: ['泰国', 'Thailand', 'TH'] },
		'VN': { name: 'Vietnam', emoji: '🇻🇳', aliases: ['越南', 'Vietnam', 'VN'] },
		'PH': { name: 'Philippines', emoji: '🇵🇭', aliases: ['菲律宾', 'Philippines', 'PH'] },
		'ID': { name: 'Indonesia', emoji: '🇮🇩', aliases: ['印度尼西亚', 'Indonesia', 'ID', '印尼'] },
		'IN': { name: 'India', emoji: '🇮🇳', aliases: ['印度', 'India', 'IN'] },
		'PK': { name: 'Pakistan', emoji: '🇵🇰', aliases: ['巴基斯坦', 'Pakistan', 'PK'] },
		'BD': { name: 'Bangladesh', emoji: '🇧🇩', aliases: ['孟加拉', 'Bangladesh', 'BD'] },
		'KH': { name: 'Cambodia', emoji: '🇰🇭', aliases: ['柬埔寨', 'Cambodia', 'KH'] },
		'MM': { name: 'Myanmar', emoji: '🇲🇲', aliases: ['缅甸', 'Myanmar', 'MM'] },
		'LA': { name: 'Laos', emoji: '🇱🇦', aliases: ['老挝', 'Laos', 'LA'] },
		'NP': { name: 'Nepal', emoji: '🇳🇵', aliases: ['尼泊尔', 'Nepal', 'NP'] },
		'LK': { name: 'Sri Lanka', emoji: '🇱🇰', aliases: ['斯里兰卡', 'Sri Lanka', 'LK'] },
		'MN': { name: 'Mongolia', emoji: '🇲🇳', aliases: ['蒙古', 'Mongolia', 'MN'] },
		'KZ': { name: 'Kazakhstan', emoji: '🇰🇿', aliases: ['哈萨克斯坦', 'Kazakhstan', 'KZ'] },
		'UZ': { name: 'Uzbekistan', emoji: '🇺🇿', aliases: ['乌兹别克斯坦', 'Uzbekistan', 'UZ'] },
		'MO': { name: 'Macau', emoji: '🇲🇴', aliases: ['澳门', 'Macau', 'MO', '澳'] },

		// 中东 - Middle East
		'AE': { name: 'United Arab Emirates', emoji: '🇦🇪', aliases: ['阿联酋', 'United Arab Emirates', 'UAE', 'AE', '迪拜', 'Dubai'] },
		'SA': { name: 'Saudi Arabia', emoji: '🇸🇦', aliases: ['沙特阿拉伯', 'Saudi Arabia', 'SA', '沙特'] },
		'IL': { name: 'Israel', emoji: '🇮🇱', aliases: ['以色列', 'Israel', 'IL'] },
		'TR': { name: 'Turkey', emoji: '🇹🇷', aliases: ['土耳其', 'Turkey', 'TR'] },
		'IR': { name: 'Iran', emoji: '🇮🇷', aliases: ['伊朗', 'Iran', 'IR'] },
		'IQ': { name: 'Iraq', emoji: '🇮🇶', aliases: ['伊拉克', 'Iraq', 'IQ'] },
		'QA': { name: 'Qatar', emoji: '🇶🇦', aliases: ['卡塔尔', 'Qatar', 'QA'] },
		'KW': { name: 'Kuwait', emoji: '🇰🇼', aliases: ['科威特', 'Kuwait', 'KW'] },
		'OM': { name: 'Oman', emoji: '🇴🇲', aliases: ['阿曼', 'Oman', 'OM'] },
		'BH': { name: 'Bahrain', emoji: '🇧🇭', aliases: ['巴林', 'Bahrain', 'BH'] },
		'JO': { name: 'Jordan', emoji: '🇯🇴', aliases: ['约旦', 'Jordan', 'JO'] },
		'LB': { name: 'Lebanon', emoji: '🇱🇧', aliases: ['黎巴嫩', 'Lebanon', 'LB'] },
		'EG': { name: 'Egypt', emoji: '🇪🇬', aliases: ['埃及', 'Egypt', 'EG'] },

		// 欧洲 - Europe
		'GB': { name: 'United Kingdom', emoji: '🇬🇧', aliases: ['英国', 'United Kingdom', 'UK', 'GB', 'Britain'] },
		'DE': { name: 'Germany', emoji: '🇩🇪', aliases: ['德国', 'Germany', 'DE'] },
		'FR': { name: 'France', emoji: '🇫🇷', aliases: ['法国', 'France', 'FR'] },
		'RU': { name: 'Russia', emoji: '🇷🇺', aliases: ['俄罗斯', 'Russia', 'RU', '俄'] },
		'NL': { name: 'Netherlands', emoji: '🇳🇱', aliases: ['荷兰', 'Netherlands', 'NL', 'Holland'] },
		'CH': { name: 'Switzerland', emoji: '🇨🇭', aliases: ['瑞士', 'Switzerland', 'CH'] },
		'SE': { name: 'Sweden', emoji: '🇸🇪', aliases: ['瑞典', 'Sweden', 'SE'] },
		'IT': { name: 'Italy', emoji: '🇮🇹', aliases: ['意大利', 'Italy', 'IT'] },
		'ES': { name: 'Spain', emoji: '🇪🇸', aliases: ['西班牙', 'Spain', 'ES'] },
		'IE': { name: 'Ireland', emoji: '🇮🇪', aliases: ['爱尔兰', 'Ireland', 'IE'] },
		'PT': { name: 'Portugal', emoji: '🇵🇹', aliases: ['葡萄牙', 'Portugal', 'PT'] },
		'AT': { name: 'Austria', emoji: '🇦🇹', aliases: ['奥地利', 'Austria', 'AT'] },
		'BE': { name: 'Belgium', emoji: '🇧🇪', aliases: ['比利时', 'Belgium', 'BE'] },
		'PL': { name: 'Poland', emoji: '🇵🇱', aliases: ['波兰', 'Poland', 'PL'] },
		'CZ': { name: 'Czech Republic', emoji: '🇨🇿', aliases: ['捷克', 'Czech Republic', 'Czech', 'CZ'] },
		'GR': { name: 'Greece', emoji: '🇬🇷', aliases: ['希腊', 'Greece', 'GR'] },
		'DK': { name: 'Denmark', emoji: '🇩🇰', aliases: ['丹麦', 'Denmark', 'DK'] },
		'NO': { name: 'Norway', emoji: '🇳🇴', aliases: ['挪威', 'Norway', 'NO'] },
		'FI': { name: 'Finland', emoji: '🇫🇮', aliases: ['芬兰', 'Finland', 'FI'] },
		'HU': { name: 'Hungary', emoji: '🇭🇺', aliases: ['匈牙利', 'Hungary', 'HU'] },
		'RO': { name: 'Romania', emoji: '🇷🇴', aliases: ['罗马尼亚', 'Romania', 'RO'] },
		'BG': { name: 'Bulgaria', emoji: '🇧🇬', aliases: ['保加利亚', 'Bulgaria', 'BG'] },
		'UA': { name: 'Ukraine', emoji: '🇺🇦', aliases: ['乌克兰', 'Ukraine', 'UA'] },
		'SK': { name: 'Slovakia', emoji: '🇸🇰', aliases: ['斯洛伐克', 'Slovakia', 'SK'] },
		'SI': { name: 'Slovenia', emoji: '🇸🇮', aliases: ['斯洛文尼亚', 'Slovenia', 'SI'] },
		'HR': { name: 'Croatia', emoji: '🇭🇷', aliases: ['克罗地亚', 'Croatia', 'HR'] },
		'RS': { name: 'Serbia', emoji: '🇷🇸', aliases: ['塞尔维亚', 'Serbia', 'RS'] },
		'LU': { name: 'Luxembourg', emoji: '🇱🇺', aliases: ['卢森堡', 'Luxembourg', 'LU'] },
		'IS': { name: 'Iceland', emoji: '🇮🇸', aliases: ['冰岛', 'Iceland', 'IS'] },
		'EE': { name: 'Estonia', emoji: '🇪🇪', aliases: ['爱沙尼亚', 'Estonia', 'EE'] },
		'LV': { name: 'Latvia', emoji: '🇱🇻', aliases: ['拉脱维亚', 'Latvia', 'LV'] },
		'LT': { name: 'Lithuania', emoji: '🇱🇹', aliases: ['立陶宛', 'Lithuania', 'LT'] },
		'MD': { name: 'Moldova', emoji: '🇲🇩', aliases: ['摩尔多瓦', 'Moldova', 'MD'] },
		'BY': { name: 'Belarus', emoji: '🇧🇾', aliases: ['白俄罗斯', 'Belarus', 'BY'] },
		'CY': { name: 'Cyprus', emoji: '🇨🇾', aliases: ['塞浦路斯', 'Cyprus', 'CY'] },
		'MT': { name: 'Malta', emoji: '🇲🇹', aliases: ['马耳他', 'Malta', 'MT'] },

		// 北美洲 - North America
		'US': { name: 'United States', emoji: '🇺🇸', aliases: ['美国', 'United States', 'US', 'USA', '美'] },
		'CA': { name: 'Canada', emoji: '🇨🇦', aliases: ['加拿大', 'Canada', 'CA'] },
		'MX': { name: 'Mexico', emoji: '🇲🇽', aliases: ['墨西哥', 'Mexico', 'MX'] },
		'PA': { name: 'Panama', emoji: '🇵🇦', aliases: ['巴拿马', 'Panama', 'PA'] },
		'CR': { name: 'Costa Rica', emoji: '🇨🇷', aliases: ['哥斯达黎加', 'Costa Rica', 'CR'] },
		'GT': { name: 'Guatemala', emoji: '🇬🇹', aliases: ['危地马拉', 'Guatemala', 'GT'] },

		// 南美洲 - South America
		'BR': { name: 'Brazil', emoji: '🇧🇷', aliases: ['巴西', 'Brazil', 'BR'] },
		'AR': { name: 'Argentina', emoji: '🇦🇷', aliases: ['阿根廷', 'Argentina', 'AR'] },
		'CL': { name: 'Chile', emoji: '🇨🇱', aliases: ['智利', 'Chile', 'CL'] },
		'CO': { name: 'Colombia', emoji: '🇨🇴', aliases: ['哥伦比亚', 'Colombia', 'CO'] },
		'PE': { name: 'Peru', emoji: '🇵🇪', aliases: ['秘鲁', 'Peru', 'PE'] },
		'VE': { name: 'Venezuela', emoji: '🇻🇪', aliases: ['委内瑞拉', 'Venezuela', 'VE'] },
		'EC': { name: 'Ecuador', emoji: '🇪🇨', aliases: ['厄瓜多尔', 'Ecuador', 'EC'] },
		'UY': { name: 'Uruguay', emoji: '🇺🇾', aliases: ['乌拉圭', 'Uruguay', 'UY'] },

		// 非洲 - Africa
		'ZA': { name: 'South Africa', emoji: '🇿🇦', aliases: ['南非', 'South Africa', 'ZA'] },
		'NG': { name: 'Nigeria', emoji: '🇳🇬', aliases: ['尼日利亚', 'Nigeria', 'NG'] },
		'KE': { name: 'Kenya', emoji: '🇰🇪', aliases: ['肯尼亚', 'Kenya', 'KE'] },
		'MA': { name: 'Morocco', emoji: '🇲🇦', aliases: ['摩洛哥', 'Morocco', 'MA'] },
		'TN': { name: 'Tunisia', emoji: '🇹🇳', aliases: ['突尼斯', 'Tunisia', 'TN'] },
		'GH': { name: 'Ghana', emoji: '🇬🇭', aliases: ['加纳', 'Ghana', 'GH'] },

		// 大洋洲 - Oceania
		'AU': { name: 'Australia', emoji: '🇦🇺', aliases: ['澳大利亚', 'Australia', 'AU', '澳洲'] },
		'NZ': { name: 'New Zealand', emoji: '🇳🇿', aliases: ['新西兰', 'New Zealand', 'NZ'] },
		'FJ': { name: 'Fiji', emoji: '🇫🇯', aliases: ['斐济', 'Fiji', 'FJ'] },
		'PG': { name: 'Papua New Guinea', emoji: '🇵🇬', aliases: ['巴布亚新几内亚', 'Papua New Guinea', 'PG'] },
	};

	const allAliases = Object.values(countryData).flatMap(c => c.aliases);
	const regex = new RegExp(allAliases.map(p => p.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|'), 'i');
	const match = nodeName.match(regex);

	if (match) {
		const matchedAlias = match[0];
		for (const code in countryData) {
			if (countryData[code].aliases.some(alias => alias.toLowerCase() === matchedAlias.toLowerCase())) {
				return { code, ...countryData[code] };
			}
		}
	}

	return null;
}

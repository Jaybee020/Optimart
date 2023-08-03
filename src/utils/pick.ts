export function pick(obj: object, keys: string[]): object {
	return keys.reduce<{ [key: string]: unknown }>((finalObj, key) => {
		if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
			finalObj[key] = obj[key as keyof typeof obj];
		}
		return finalObj;
	}, {});
}

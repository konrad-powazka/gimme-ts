/** @ignore @internal */
export function nameof<T>(key: keyof T & string, instance?: T): string {
    return key;
}

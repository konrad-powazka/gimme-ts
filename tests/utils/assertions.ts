import { expect } from 'chai';

export function expectAllEqual<T>(items: ReadonlyArray<T>) {
    for(let item1Index = 0; item1Index < items.length - 1; item1Index++){
        const item1 = items[item1Index];
        const item2 = items[item1Index + 1];
        expect(item1).to.be.equal(item2);
    }
}

export function expectAllNotEqual<T>(items: ReadonlyArray<T>) {
    for(let item1Index = 0; item1Index < items.length; item1Index++) {
        const item1 = items[item1Index];

        for(let item2Index = item1Index + 1; item2Index < items.length; item2Index++) {
            const item2 = items[item2Index];
            expect(item1).to.not.be.equal(item2);
        }
    }
}

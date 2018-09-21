import { Lifecycle, abstraction, concretion, ContainerBuilder, Container } from '../../../src';
import { expect } from 'chai';
import { nameof } from '../../../src/nameof';
import _ from 'lodash';
import { expectAllEqual, expectAllNotEqual } from '../../utils/assertions';

interface I1 {
    d21: I2;
    d22: I2;
    d31: I3;
    d32: I3;
}

interface I2 {
    d31: I3;
    d32: I3;
}

interface I3 {
}

class C {
    private static lastInstanceId = 0;
    readonly instanceId = C.lastInstanceId++;
}

class C1 extends C implements I1 {
    constructor(public d21: I2, public d22: I2, public d31: I3, public d32: I3) {
        super();
    }
}

class C2 extends C implements I2 {
    constructor(public d31: I3, public d32: I3) {
        super();
    }
}

class C3 extends C implements I3 {
}

export function runTestCases(runFn: () => void) {
    describe(`${nameof('Container', { Container })} with 3-level dependencies registered`, () => {
        runFn();
    });
}

export function runTestCase(
    lifecycle1: Lifecycle,
    lifecycle2: Lifecycle,
    lifecycle3: Lifecycle,
    runAssertionsFn: (instances: InstancesCreatedByTestCase) => void) {
    const title = `resolves correctly when lvl 1 dependency is registered as ${getLifecycleName(lifecycle1)}, lvl 2 dependency is registered as ${getLifecycleName(lifecycle2)} and lvl 3 dependency is registered as ${getLifecycleName(lifecycle3)}`;

    it(title, () => {
        const builder = new ContainerBuilder();
        builder.for(abstraction<I1>()).use(concretion(C1)).inLifecycle(lifecycle1);
        builder.for(abstraction<I2>()).use(concretion(C2)).inLifecycle(lifecycle2);
        builder.for(abstraction<I3>()).use(concretion(C3)).inLifecycle(lifecycle3);
        const container = builder.build();
        const scopedContainer1 = container.createScope();
        const scopedContainer2 = container.createScope();

        const instances = new InstancesCreatedByTestCase(
            scopedContainer1.resolve(abstraction<I1>()),
            scopedContainer1.resolve(abstraction<I1>()),
            scopedContainer2.resolve(abstraction<I1>()),
            scopedContainer2.resolve(abstraction<I1>()));

        const all1s = instances.getAll1s();

        for (const instance1 of all1s) {
            expect(instance1).to.be.instanceof(C1);
        }

        const all2s = instances.getAll2s();

        for (const instance2 of all2s) {
            expect(instance2).to.be.instanceof(C2);
        }

        const all3s = instances.getAll3s();

        for (const instance3 of all3s) {
            expect(instance3).to.be.instanceof(C3);
        }

        runAssertionsFn(instances);
    });
}

function getLifecycleName(lifecycle: Lifecycle) {
    return Lifecycle[lifecycle].toLowerCase();
}

class InstancesCreatedByTestCase {
    constructor(readonly scope1Instance11: I1,
        readonly scope1Instance12: I1,
        readonly scope2Instance11: I1,
        readonly scope2Instance12: I1) {
    }

    expectAll1s2s3sEqual() {
        this.expectAll1sEqual();
        this.expectAll2sEqual();
        this.expectAll3sEqual();
    }

    expectAll1s2s3sNotEqual() {
        this.expectAll1sNotEqual();
        this.expectAll2sNotEqual();
        this.expectAll3sNotEqual();
    }

    expectAll1sEqual() {
        const instance1s = this.getAll1s();
        expectAllEqual(instance1s);
    }

    getAll1s() {
        return this.getAll1sFromScope1().concat(this.getAll1sFromScope2());
    }

    getAll1sFromScope1(): I1[] {
        return [
            this.scope1Instance11,
            this.scope1Instance12,
        ];
    }
    getAll1sFromScope2(): I1[] {
        return [
            this.scope2Instance11,
            this.scope2Instance12
        ];
    }

    expectAll2sEqual() {
        const instance2s = this.getAll2s();
        expectAllEqual(instance2s);
    }

    getAll2s() {
        const instance1s = this.getAll1s();
        return getAll2sFrom1s(instance1s);
    }

    expectAll3sEqual() {
        const all3s = this.getAll3s();
        expectAllEqual(all3s);
    }

    getAll3s() {
        const all1s = this.getAll1s();
        return getAll3sFrom1s(all1s);
    }

    expectAllNotEqual() {
        this.expectAll1sNotEqual();
        this.expectAll2sNotEqual();
        this.expectAll3sNotEqual();
    }

    expectAll1sNotEqual() {
        const instance1s = this.getAll1s();
        expectAllNotEqual(instance1s);
    }

    expectAll2sNotEqual() {
        const instance2s = this.getAll2s();
        expectAllNotEqual(instance2s);
    }

    expectAll3sNotEqual() {
        const instance3s = this.getAll3s();
        expectAllNotEqual(instance3s);
    }
};

export function getAll2sFrom1s(instance1s: I1[]): I2[] {
    return _(instance1s).map(instance1 => [
        instance1.d21,
        instance1.d22,
    ]).flatten().value();
}

export function getAll3sFrom1s(instance1s: I1[]): I3[] {
    const instance2s = getAll2sFrom1s(instance1s);
    const instance3sFroms2s = getAll3sFrom2s(instance2s);

    return _(instance1s).map(instance1 => {
        return [instance1.d31, instance1.d32];
    }).flatten().value().concat(instance3sFroms2s);
}

export function getAll3sFrom2s(instance2s: I2[]): I3[] {
    return _(instance2s).map(instance2 => [
        instance2.d31,
        instance2.d32
    ]).flatten().value();
}
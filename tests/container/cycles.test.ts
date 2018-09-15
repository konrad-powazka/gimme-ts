import { expect } from 'chai';
import 'mocha';
import { Container } from '../../src';
import { nameof } from '../../src/nameof';
import { abstraction, concretion } from '../../src/functions-to-transform';

describe(nameof('Container', { Container }), () => {
    let container: Container;

    beforeEach(() => {
        container = new Container();
    });

    it('detects one-level dependency cycle', () => {
        interface IOneLevelDependencyCycle {
        }
        
        class OneLevelDependencyCycle implements IOneLevelDependencyCycle {
            constructor(dependency: IOneLevelDependencyCycle) {
            }
        }

        container.for(abstraction<IOneLevelDependencyCycle>()).use(concretion(OneLevelDependencyCycle));
        
        const action = () => container.resolve(abstraction<IOneLevelDependencyCycle>());

        expect(action).to.throw;
    });

    it('detects two-level dependency cycle', () => {
        interface ITwoLevelDependencyCycle1 {
        }
        
        interface ITwoLevelDependencyCycle2 {
        }
        
        class TwoLevelDependencyCycle1 implements ITwoLevelDependencyCycle1 {
            constructor(dependency: ITwoLevelDependencyCycle2) {
            }
        }
        
        class TwoLevelDependencyCycle2 implements ITwoLevelDependencyCycle2 {
            constructor(dependency: ITwoLevelDependencyCycle1) {
            }
        }

        container.for(abstraction<ITwoLevelDependencyCycle1>()).use(concretion(TwoLevelDependencyCycle1));
        container.for(abstraction<ITwoLevelDependencyCycle2>()).use(concretion(TwoLevelDependencyCycle2));

        const action = () => container.resolve(abstraction<TwoLevelDependencyCycle1>());

        expect(action).to.throw;
    });

    it('detects three-level dependency cycle', () => {
        interface IThreeLevelDependencyCycle1 {
        }
        
        interface IThreeLevelDependencyCycle2 {
        }
        
        interface IThreeLevelDependencyCycle3 {
        }
        
        class ThreeLevelDependencyCycle1 implements IThreeLevelDependencyCycle1 {
            constructor(dependency: IThreeLevelDependencyCycle2) {
            }
        }
        
        class ThreeLevelDependencyCycle2 implements IThreeLevelDependencyCycle2 {
            constructor(dependency: IThreeLevelDependencyCycle3) {
            }
        }
        
        class ThreeLevelDependencyCycle3 implements IThreeLevelDependencyCycle3 {
            constructor(dependency: IThreeLevelDependencyCycle1) {
            }
        }

        container.for(abstraction<IThreeLevelDependencyCycle1>()).use(concretion(ThreeLevelDependencyCycle1));
        container.for(abstraction<IThreeLevelDependencyCycle2>()).use(concretion(ThreeLevelDependencyCycle2));
        container.for(abstraction<IThreeLevelDependencyCycle3>()).use(concretion(ThreeLevelDependencyCycle3));
        
        const action = () => container.resolve(abstraction<ThreeLevelDependencyCycle1>());

        expect(action).to.throw;
    });

    it('detects nested dependency cycle', () => {
        interface IHasDependencyCycle {
        }

        class HasDependencyCycle implements IHasDependencyCycle {
            constructor(dependency: IHasDependencyCycle) {
            }
        }

        class HasChildWithDependencyCycle{
            constructor(faultyChild: IHasDependencyCycle){
            }
        }

        container.for(abstraction<HasChildWithDependencyCycle>()).use(concretion(HasChildWithDependencyCycle));
        container.for(abstraction<IHasDependencyCycle>()).use(concretion(HasDependencyCycle));
        
        const action = () => container.resolve(abstraction<HasChildWithDependencyCycle>());

        expect(action).to.throw;
    });
});

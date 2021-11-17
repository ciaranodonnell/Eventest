declare class Expectation {
    expectedValue: any;
    constructor(expected: any);
    equals(testValue: any): void;
}
declare class Test {
    that(expected: any): Expectation;
}
declare class TestSuite {
    title: string | undefined;
    given: (() => Promise<void>);
    after: (() => Promise<void>);
    thens: ((test: Test) => Promise<void>)[];
    run: () => Promise<void>;
}
declare function setmeup(t: TestSuite): Promise<void>;

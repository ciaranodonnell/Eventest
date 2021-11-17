

class Expectation {
    expectedValue: any;
    constructor(expected: any) {
        this.expectedValue = expected
    }

    equals(testValue: any) {
        if (this.expectedValue == undefined) {
            if (testValue != undefined)
                throw {message: `Value not as expected. Expected: ${this.expectedValue}. Value: ${testValue}`};
        }
    }
}
class Test {


    that(expected: any): Expectation {
        return new Expectation(expected);
    }
}

class TestSuite {

    title: string | undefined;
    //definition: (this: Test) => void;
    given: (() => Promise<void>) = async () => { };
    after: (() => Promise<void>) = async () => { };
    thens: ((test: Test) => Promise<void>)[] = [];

    // given(g: (this: Test) => Promise<void>) {
    //     this.before = g;
    // }

    run : ()=> Promise<void> = async ()=> {
        await this.given();
        let test = new Test();
        for (let x = 0; x < this.thens.length; x++) {
            let testcase = this.thens[x];
            await testcase(test);
        }
        await this.after();
    }

}
async function setmeup(t:TestSuite) : Promise<void>{
    await t.run();
}

// setmeup({ 
//     title: 'Submitting NewReservationRequest',
//     given: async () => {
//         console.log('before');
//     },
//     thens: [
//         async (test:Test) => {
//             test.that(1).equals(1);
//         }
//     ],
//     after: async () => {
//         console.log('before');
//     }
// });

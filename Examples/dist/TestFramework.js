"use strict";
class Expectation {
    constructor(expected) {
        this.expectedValue = expected;
    }
    equals(testValue) {
        if (this.expectedValue == undefined) {
            if (testValue != undefined)
                throw { message: `Value not as expected. Expected: ${this.expectedValue}. Value: ${testValue}` };
        }
    }
}
class Test {
    that(expected) {
        return new Expectation(expected);
    }
}
class TestSuite {
    constructor() {
        //definition: (this: Test) => void;
        this.given = async () => { };
        this.after = async () => { };
        this.thens = [];
        // given(g: (this: Test) => Promise<void>) {
        //     this.before = g;
        // }
        this.run = async () => {
            await this.given();
            let test = new Test();
            for (let x = 0; x < this.thens.length; x++) {
                let testcase = this.thens[x];
                await testcase(test);
            }
            await this.after();
        };
    }
}
async function setmeup(t) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdEZyYW1ld29yay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9UZXN0RnJhbWV3b3JrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFFQSxNQUFNLFdBQVc7SUFFYixZQUFZLFFBQWE7UUFDckIsSUFBSSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUE7SUFDakMsQ0FBQztJQUVELE1BQU0sQ0FBQyxTQUFjO1FBQ2pCLElBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxTQUFTLEVBQUU7WUFDakMsSUFBSSxTQUFTLElBQUksU0FBUztnQkFDdEIsTUFBTSxFQUFDLE9BQU8sRUFBRSxvQ0FBb0MsSUFBSSxDQUFDLGFBQWEsWUFBWSxTQUFTLEVBQUUsRUFBQyxDQUFDO1NBQ3RHO0lBQ0wsQ0FBQztDQUNKO0FBQ0QsTUFBTSxJQUFJO0lBR04sSUFBSSxDQUFDLFFBQWE7UUFDZCxPQUFPLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7Q0FDSjtBQUVELE1BQU0sU0FBUztJQUFmO1FBR0ksbUNBQW1DO1FBQ25DLFVBQUssR0FBMEIsS0FBSyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDL0MsVUFBSyxHQUEwQixLQUFLLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMvQyxVQUFLLEdBQXNDLEVBQUUsQ0FBQztRQUU5Qyw0Q0FBNEM7UUFDNUMsdUJBQXVCO1FBQ3ZCLElBQUk7UUFFSixRQUFHLEdBQXdCLEtBQUssSUFBRyxFQUFFO1lBQ2pDLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ25CLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7WUFDdEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN4QyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN4QjtZQUNELE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3ZCLENBQUMsQ0FBQTtJQUVMLENBQUM7Q0FBQTtBQUNELEtBQUssVUFBVSxPQUFPLENBQUMsQ0FBVztJQUM5QixNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNsQixDQUFDO0FBRUQsYUFBYTtBQUNiLGlEQUFpRDtBQUNqRCwyQkFBMkI7QUFDM0IsaUNBQWlDO0FBQ2pDLFNBQVM7QUFDVCxlQUFlO0FBQ2YsaUNBQWlDO0FBQ2pDLHNDQUFzQztBQUN0QyxZQUFZO0FBQ1osU0FBUztBQUNULDJCQUEyQjtBQUMzQixpQ0FBaUM7QUFDakMsUUFBUTtBQUNSLE1BQU0ifQ==

import { v4 as uuid } from 'uuid';
import * as Bus from "./BusTester"

export class Test{
    private uniqueTestId : string;
    private bus : Bus.BusTester;

    constructor(bus : Bus.BusTester){
        this.uniqueTestId = uuid();
        this.bus = bus;
    }


}
import {BoolResponse} from "se-workshop-20-interfaces/dist/src/Response";
import {CreditCard} from "se-workshop-20-interfaces/dist/src/CommonInterface";
import { loggerW} from "../../api-int/internal_api";

import axios from 'axios'
import * as querystring from "querystring";
const logger = loggerW(__filename)

export class PaymentSystemAdapter {
    EXTERNAL_URL: string = "https://cs-bgu-wsep.herokuapp.com/"

    async connect(): Promise<BoolResponse> {
        try {
            const connectRes = await axios.post(this.EXTERNAL_URL, querystring.stringify({action_type: 'handshake'}),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                })
            if (connectRes.data === "OK") {
                return {data: {result: true}}
            }
            return {data: {result: false}}
        } catch (e) {
            logger.warn(`ERROR connect to external system ${e}`)
            return {data: {result: false}}
        }
    }

    async pay(price: number, creditCard: CreditCard): Promise<number> {
        try {
            const payRes = await axios.post(this.EXTERNAL_URL, querystring.stringify({
                    action_type: 'pay',
                    card_number: creditCard.number,
                    month: creditCard.expMonth,
                    year: creditCard.expYear,
                    holder: creditCard.holderName,
                    ccv: creditCard.cvv,
                    id: '123'
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                })
            return payRes.data;
        } catch (e) {
            logger.warn(`ERROR pay via external system ${e}`)
            return -1
        }
    }
}
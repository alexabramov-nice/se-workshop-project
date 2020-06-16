import {BoolResponse} from "se-workshop-20-interfaces/dist/src/Response";
import {CreditCard} from "se-workshop-20-interfaces/dist/src/CommonInterface";
import {errorMsg, loggerW} from "../../api-int/internal_api";
import {PaymentSystemAdapter} from "./PaymentSystemAdapter";
const logger = loggerW(__filename)

export class PaymentSystem {
    private _paymentSys: any;
    private _name: string;
    private _isConnected: boolean;

    constructor() {
        this._name = "Payment System"
        this._paymentSys = new PaymentSystemAdapter();
        this._isConnected = false;
    }

    setPaymentSys(real: any) {
        this._paymentSys = real;
    }

    async connect(): Promise<BoolResponse> {
        logger.info("connecting payment system...");
        const succ: BoolResponse = {data: {result: true}};
        if (this._paymentSys) {
            try {
                const isConnected = this._paymentSys.connect();
                this._isConnected = isConnected ? true : false;
                isConnected ? logger.info("successfully connected payment system") :
                    logger.warn("failed connecting payment system");
                return isConnected ? succ :
                    {error: {message: errorMsg.E_CON + " : " + this._name}, data: {result: false}};
            } catch (e) {
                const error: string = `${errorMsg.E_CON}. message: ${e}`;
                logger.error(error);
                return {error: {message: error}, data: {result: false}};
            }
        } else {
            return succ;
        }
    }

    async pay(price: number, creditCard: CreditCard): Promise<number> {
        if (!this._isConnected) {
            const connectSucc : BoolResponse = await this.connect()
            if(!connectSucc.data.result){
                logger.info("payment system is not connected");
                return -1;
            }
        }
        logger.info("trying to charge" );
        let isPaid: boolean = false;
        if (this._paymentSys) {
            return this._paymentSys.pay(price,creditCard)
        } else {
            isPaid = this.validateCreditCard(creditCard)
            if (!isPaid) {
                logger.error("payment failed - invalid credit card")
                return -1;
            }
            isPaid = this.validateBalance(creditCard, price);
            if (!isPaid) {
                logger.error("payment failed - ough money")
                return -1
            }
            return Math.random() * (1000 - 1) + 1;
        }


    }

    private validateCreditCard(creditCard: CreditCard) : boolean {
        logger.info(`validating credit card ending on: ${creditCard.number.substring(creditCard.number.length-4)}`);
        if (this._paymentSys) {
            return this._paymentSys.validateCreditCard();
        } else {
            const today: Date = new Date();
            let expOk: boolean = creditCard.expYear.length === 2 && ((parseInt('20' + creditCard.expYear, 10) > today.getFullYear() ||
                (parseInt(creditCard.expYear, 10) === today.getFullYear() % 100 && parseInt(creditCard.expMonth, 10) >= today.getMonth() + 1)))
            expOk = expOk && creditCard.holderName && creditCard.holderName.length > 0 &&
                creditCard.number && creditCard.number.length > 0 &&
                creditCard.cvv && creditCard.cvv.length > 0;
            return expOk === true;
        }
    }

    private validateBalance(creditCard: CreditCard, amountToCharge: number) {
        logger.info(`validating balance on credit card ending on: ${creditCard.number.substring(creditCard.number.length-4)} want to charge ${amountToCharge}`);
        if (this._paymentSys) {
            return this._paymentSys.validateBalance();
        } else {
            return amountToCharge < 1000;
        }
    }
}

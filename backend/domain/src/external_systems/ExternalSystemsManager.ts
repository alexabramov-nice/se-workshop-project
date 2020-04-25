import {DeliverySystem} from "./delivery_system/DeliverySystem"
import {PaymentSystem} from "./payment_system/PaymentSystem"
import {SecuritySystem} from "./security_system/SecuritySystem"
import {errorMsg, ExternalSystems, BoolResponse, loggerW} from "../api-int/internal_api"
const logger = loggerW(__filename)

export class ExternalSystemsManager {
    private _paymentSystem: PaymentSystem;
    private _deliverySystem: DeliverySystem;
    private _securitySystem: SecuritySystem

    constructor() {
        this._deliverySystem = new DeliverySystem();
        this._paymentSystem = new PaymentSystem();
        this._securitySystem = new SecuritySystem();
    }

    connectSystem(system: ExternalSystems): BoolResponse {
        logger.debug(`trying to connect to ${system}`);
        switch (system) {
            case (ExternalSystems.DELIVERY):
                return this._deliverySystem.connect();
            case (ExternalSystems.PAYMENT):
                return this._paymentSystem.connect();
            case (ExternalSystems.SECURITY):
                return this._securitySystem.connect();
        }
    }

    connectAllSystems(): BoolResponse {
        const responses: BoolResponse[] = [this._deliverySystem.connect(), this._paymentSystem.connect(), this._securitySystem.connect()];
        const errors = responses.filter(val => val.error)
        if (errors.length === 0) {
            logger.warn("cant connect to one of the external systems.")
            return {data: {result: true}}
        } else {
            return {data: {result: false}, error: {message: errorMsg.E_CON, options: errors}}
        }
    }



    get paymentSystem(): PaymentSystem {
        return this._paymentSystem;
    }

    get deliverySystem(): DeliverySystem {
        return this._deliverySystem;
    }

    get securitySystem(): SecuritySystem {
        return this._securitySystem;
    }
}




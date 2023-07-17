import {Payload} from "../types.js";

export const onUpdateRequest = (type: string, resData: Payload, data: string, id: string | number = 0): Payload => {
    resData.type = type;
    resData.id = id;
    resData.data = data;
    return JSON.parse(JSON.stringify(resData));
}

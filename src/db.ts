import {Payload} from "./types.js";

export const database:Payload[] = [];


export const onUpdateDb = (id:string, user:Payload) => {
    user.uid = id;
    database.push(user);
}
export const onGetUser = (id:string) => {
    const user = database.find(user => user.uid === id);
    if (user){
        const userName = JSON.parse(JSON.stringify(user.data));
        return {'id': database.indexOf(user!), 'name':userName.split(',').at(0).replace('{"name":"','').replace('"','')};
    }
}

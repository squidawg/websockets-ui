import {User} from "./types.js";

export const database:User[] = [];


export const onUpdateDb = (id:string, user:User) => {
    user.uid = id;
    database.push(user);
}
export const onGetUser = (id:string) => {
    const user = database.find(user => user.uid === id);
    if (user){
        const userName = JSON.parse(JSON.stringify(user.data));
        return userName.split(',').at(0).replace('{"name":"','').replace('"','');
    }
}

import {RoomType} from '../constants/room';

interface RoomCreation {
     _id: string,
     type: RoomType,
     seller: string,
     buyer: string,
     shop_id: string,
     creator: string,
     role: string,
     shop: any
}


interface RoomFetch {
     user_id: string,
     role: string
}

export {
     RoomCreation,
     RoomFetch
}
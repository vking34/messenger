import {RoomType} from '../constants/room';

interface RoomCreation {
     type: RoomType,
     seller: string,
     buyer: string,
     creator: string,
     role: string
}


interface RoomFetch {
     user_id: string,
     role: string
}

export {
     RoomCreation,
     RoomFetch
}
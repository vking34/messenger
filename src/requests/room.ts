import {RoomType} from '../constants/room';

export interface RoomCreation {
     _id: string,
     type: RoomType,
     seller: string,
     buyer: string,
     shop_id: string,
     creator: string,
     role: string,
     shop: any
}
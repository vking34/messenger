import { RoomType } from '../constants/room';

export interface RoomCreation {
     _id: string,
     type: RoomType,
     seller: string,
     buyer: string,
     shop_id: string,
     creator: string,
     role: string,
     shop: any,
     buyer_info: any
}

export interface RoomStatus {
     room_id: string,
     status: boolean
}

export interface StatusRoomList {
     user_id: string,
     user_role: string,
     rooms: Array<RoomStatus>
}
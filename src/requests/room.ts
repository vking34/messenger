import {RoomType} from '../constants/room';

export interface RoomCreation {
     type: RoomType,
     seller: string,
     buyer: string,
     role: string
}
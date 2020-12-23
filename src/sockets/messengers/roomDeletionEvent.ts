import { messengerNamespace } from '../index';

export const ROOM_DELETION_EVENT = 'room_deletion';
export default (room_id: string, seller: string, buyer: string, deletion_role: string) => {
    return new Promise((resovle, _reject) => {
        const deletion = {
            room_id,
            seller,
            buyer,
            deletion_role
        };
        messengerNamespace.in(seller).emit(ROOM_DELETION_EVENT, deletion);
        messengerNamespace.in(buyer).emit(ROOM_DELETION_EVENT, deletion);
        resovle(true);
    })
}
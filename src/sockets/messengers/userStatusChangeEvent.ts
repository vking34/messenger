import { messengerNamespace } from '../index';

export const USER_STATUS_CHANGE_EVENT = 'user_status_change';
export default (sender: string, receiver: string, user_role: string, room_id: string, status: boolean) => {
    return new Promise((resolve, _reject) => {
        messengerNamespace.in(receiver).emit(USER_STATUS_CHANGE_EVENT, {
            user_id: sender,
            user_role,
            room_id,
            status
        });
        resolve(true);
    })
}
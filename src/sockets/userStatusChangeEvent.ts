import io from './index';
import {MESSENGER_NS} from './index'
import {SocketEvents} from '../constants/socket';

export default (sender: string, receiver: string, user_role: string, room_id: string, status: boolean) => {
        io.of(MESSENGER_NS).in(receiver).emit(SocketEvents.USER_STATUS_CHANGE_EVENT, {
            user_id: sender,
            user_role,
            room_id,
            status
        })
    }
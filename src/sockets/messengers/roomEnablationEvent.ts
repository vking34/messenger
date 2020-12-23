import { UserRole } from '../../constants/user';
import { messengerNamespace } from '../index';
import { USER_STATUS_CHANGE_EVENT } from './userStatusChangeEvent';


export default (room_id: string, user_role: string, seller: string, buyer: string) => {
    return new Promise((resolve, reject) => {
        let sender: string, receiver: string;

        if (user_role === UserRole.BUYER) {
            sender = buyer;
            receiver = seller;
        }
        else {
            sender = seller;
            receiver = buyer;
        }

        messengerNamespace.in(receiver).clients((e, receiverConnections) => {
            if (e) {
                reject(e);
                return;
            }

            const numOfReceiverConnections = receiverConnections?.length;
            if (numOfReceiverConnections > 0) {
                messengerNamespace.in(sender).clients((e, senderConnections) => {
                    if (e) {
                        reject(e);
                        return;
                    }

                    const numOfSenderConnections = senderConnections?.length;
                    if (numOfSenderConnections > 0) {
                        messengerNamespace.in(receiver).emit(USER_STATUS_CHANGE_EVENT, {
                            user_id: sender,
                            user_role,
                            room_id,
                            status: true
                        });
                        resolve(true);
                    }
                })
            }

            resolve(false);
        });
    });
}
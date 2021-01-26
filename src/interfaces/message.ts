import { MessageType } from '../constants/message';

export interface MessageFormat {
    _id: string,
    room_id: string,
    from: string,
    to: string,
    type: MessageType,
    content: string,
    created_at: string,
    updated_at: string,
    is_seen: boolean
}


export interface MessageFetch {
    room_id: {
        type: string,
        require: [true]
    },
    created_at: number,
    limit: number
}
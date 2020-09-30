import { Schema } from "mongoose";
import mongoose from './index';
import { MessageSchema } from './message';

const RoomSchema: Schema = new mongoose.Schema(
     {
          _id: {
               type: String,
               required: [true, 'Room ID is required!']
          },
          type: String,
          creator: String,
          buyer: String,
          seller: String,
          last_message: MessageSchema 
     },
     {
          timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
     }
);

export default mongoose.model('cz_rooms', RoomSchema);




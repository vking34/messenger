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
          last_message: MessageSchema,
          shop: Object,
          buyer_info: {
               name: String,
               avatar: String,
               phone_number: String,
               email: String
          },
          pinned_by_buyer: Date,
          pinned_by_seller: Date,
          enable: {
               type: Boolean,
               default: true
          },
          buyer_unseen_messages: {
               type: Number,
               default: 0
          },
          seller_unseen_messages: {
               type: Number,
               default: 0
          }
     },
     {
          timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
     }
);

export default mongoose.model('cz_rooms', RoomSchema);




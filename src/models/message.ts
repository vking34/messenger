import { Mongoose, Schema } from "mongoose";

const mongoose: Mongoose = require('mongoose');
const SchemaCreator = mongoose.Schema;

const messageSchema: Schema = new SchemaCreator({
     _id: String,
     sender: {
          type: String,
          required: [true, 'Sender username is required!']
     },
     receiver: {
          type: String,
          required: [true, 'Sender username is required!']
     },
     content: {
          type: String,
          required: [true, 'Message content is required!']
     },
     room_id: String,
     type: String,
     is_seen: {
          type: Boolean,
          default: false
     }
},
{timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}}
);

const MessageModel = mongoose.model('cz_messages', messageSchema);

export default MessageModel;

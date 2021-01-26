import mongoose, { Schema } from "mongoose";

const MessageSchema: Schema = new mongoose.Schema(
     {
          _id: String,
          from: {
               type: String,
               required: [true, 'Sender username is required!']
          },
          to: {
               type: String,
               required: [true, 'Receiver username is required!']
          },
          type: String,
          content: {
               type: String,
               required: [true, 'Message content is required!']
          },
          room_id: String,
          is_seen: {
               type: Boolean,
               default: false
          }
     },
     { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// MessageSchema.index({ room_id: 1, created_at: -1 });

const MessageModel = mongoose.model('cz_messages', MessageSchema);
export {
     MessageSchema,
     MessageModel
};

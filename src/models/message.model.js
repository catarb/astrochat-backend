import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "assistant"],
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 10000,
    },
    metadata: {
      type: Object,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ conversation: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;

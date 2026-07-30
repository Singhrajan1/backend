import mongoose, { schema } from "mongoose";

const subscriptionSchema = new Schema({
    name:{
        type: String,
        require: true,
        lowercase: true,
        index: true
    },
    description:{
        type: String,
        require: true
    },
    videos:{
        type: Schema.Types.ObejectId,
        Ref: "Video"
    },
    owner:{
        type: Schema.Types.ObjectId,
        Ref: "User"
    }
}, { timestamp: true });

const Subscription = mongoose.model("Subscription",subscriptionSchema)

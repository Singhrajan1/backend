import mongoose, {Schema} from "mongoose";

const likesSchema= new Schema(
    {
        likedBy:{
            type: [Schema.Types.ObjectId],
            ref: "User"
        },
        tweets:{
            type: [Schema.Types.ObjectId],
            ref: "Tweet"
        },
        comments:{
            type: [Schema.Types.ObejctId],
            ref:" Comment"
        },
        video:{
            type:[Schema.Types.ObjectId],
            ref: "Video"
        }
},{ timestamps:true})
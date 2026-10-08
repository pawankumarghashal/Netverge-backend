import mongoose,{Schema} from "mongoose";


const UserSchema = new mongoose.Schema ({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"

    },
    name:{
        type:String,
        required:true

    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
         type:String,
        required:true,
        unique:true


    },
    profilePicture:{
        type:String,
        default:"default.jpg"
    },
    password:{
        type:String,
        required:true

    },

    createdDate:{
        type:Date,
        default:Date.now

    },
    active:{
        type:String,
        default:true

    },
    token:{
        type:String,
        default:""

    },
})

const User = mongoose.model("User",UserSchema)

export default User;
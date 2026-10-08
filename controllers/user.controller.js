import Profile from "../models/profile.model.js"
import bcrypt from "bcrypt";
import User from "../models/user.model.js"
import crypto, { randomBytes } from "crypto"
import { error } from "console";
import PDFDocument from   "pdfkit";
import fs from "fs"
import ConnectionRequest from "../models/connections.model.js";
import jwt from "jsonwebtoken";









const convertUserDataTOPDF =async (userData)=>{
    const doc = new PDFDocument();
    const outputPath = crypto.randomBytes(32).toString("hex")+".pdf"
    const stream =  fs.createWriteStream("uploads/"+outputPath)

    doc.pipe(stream)

    doc.image(`uploads/${userData.userId.profilePicture}`,{align:"center",width:"100"});
    doc.fontSize(14).text(`Name:${userData.userId.name}`)
    doc.fontSize(14).text(`Email:${userData.userId.email}`)
    doc.fontSize(14).text(`Username:${userData.userId.username}`)
    doc.fontSize(14).text(`Bio:${userData.bio}`)
    doc.fontSize(14).text(`Current Post:${userData.currentPost}`);

    doc.fontSize(14).text("Past Work:")

    userData.pastWork.forEach((work,index)=>{
        doc.fontSize(14).text(`Position:${work.position}`)
        doc.fontSize(14).text(`Company Name:${work.company}`)
        doc.fontSize(14).text(`Years:${work.years}`);
    })

    doc.end();
  return outputPath;

}





 export const register = async (req,res) =>{
    try{
     
        const {name,email,username,password}= req.body
        if (!name|| !email|| !username|| !password) return res.status(400).json({message:"All fields are required"});

        const user = await User.findOne({
            email
        })

        if(user) return res.status(400).json({message:"User already exists"})

            const hashedPassword = await bcrypt.hash(password,10)

        const newUser = new User({
            name,
            password:hashedPassword,
            username,
            email


        });
        
        await newUser.save();

        const profile = new Profile({userId: newUser._id});

        await profile.save()

        // return res.json({message:"User Created"})
        


    // const token = jwt.sign(
    //   { id: newUser._id },              
    //   process.env.JWT_SECRET,           
    //   { expiresIn: "7d" }               
    // );
    const token = crypto.randomBytes(32).toString("hex");

newUser.token = token;
await newUser.save();

    return res.status(201).json({
      message: "User Created",
      token,                             
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username
      }
    })









    } catch(error){
return res.status(400).json({message:error.message})
    }
}



export const login = async (req,res) =>{
    try{
        const {email,password} = req.body ;

        if(!email || !password) return res.status(404).json({message:"All field are required"})
            
const user = await User.findOne({
    email
})

if(!user) return res.status(404).json({message:"User does not exist"})

    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch) return res.status(404).json({message:"invalid Credentials"})

        const token = crypto.randomBytes(32).toString("hex");
        await User.updateOne({_id:user._id},{token})

        return res.json({token});
        


    }catch(error){
        return res.status(400).json({message:error.message})
    }
}


export const uploadProfilePicture = async (req,res) =>{

        const {token} = req.body 
    try{

        const user = await User.findOne({token:token});

        if(!user){
            return res.status(404).json({message:"User not found "})
        }

        user.profilePicture= req.file.filename

        await user.save()
      return res.json({message:"Profile Picture Uploaded"})

    }catch(error){
        return res.status(400).json({message:error.message})
    }
} 


export const updateUserProfile = async (req,res) =>{

    try {
      
        const{token,...newUserData} = req.body
     
        const user = await User.findOne({token:token})
        if(!user){
            return res.status(404).json({message:"User not found"})
         }

           const{email,username} = newUserData; 

     const existingUser = await User.findOne({$or:[{email},{username}]})

  

     if(existingUser){
        if(existingUser && String(existingUser._id) !== String(user._id)){
            return res.status(505).json({message:"User already exist"})
        }
     }  
     
     Object.assign(user,newUserData)

     await user.save()
     return res.json({ message: "User Updated" });



    } catch(error){
        return res.status(400).json({message:error.message})
    }

}


export const getUserAndProfile = async (req,res) =>{
    try{

       const {token} = req.query;
       if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

       const user = await User.findOne({token:token})

       if(!user){
        return res.status(400).json({message:"User not  found"})
       }

       const userProfile = await Profile.findOne({userId:user._id}).populate("userId","name email username profilePicture")
   return res.json(userProfile)
    } catch (error){
        return res.status(500).json({message:error.message})
    }
}


// export const getUserAndProfile = async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//       return res.status(401).json({ message: "Token missing" });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findById(decoded.userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const userProfile = await Profile.findOne({ userId: user._id })
//       .populate("userId", "name email username profilePicture");

//     return res.status(200).json(userProfile);

//   } catch (err) {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };



export const updateProfileData = async(req,res) =>{
       
    try{
            
      console.log("📦 req.body:", req.body);
        const{token,...newProfileData} = req.body;

        const userProfile = await User.findOne({token})

        if(!userProfile){
            return res.status(404).json("User not found")
        }

      const profile_to_update = await Profile.findOne({userId:userProfile._id})
      
    if (!profile_to_update) {
      return res.status(404).json({ message: "Profile not found for this user" });
    }



      Object.assign(profile_to_update,newProfileData)

      await profile_to_update.save()

      return res.json({message:"Profile Update"})

    }catch(error){
        return res.status(404).json({message:error.message})
    }
}


export const getAllUserProfile = async(req,res) =>{
    try{

        const profile = await Profile.find().populate("userId","name username email profilePicture")

        return res.json({profile})

    }catch(error){
        return res.status(404).json({message:error.message})
    }
}


export const downloadProfile = async(req,res)=>{
    const user_id = req.query.id

    const userProfile = await Profile.findOne({userId:user_id}).populate("userId","name username email profilePicture")
 let a = await convertUserDataTOPDF(userProfile)
 return res.json({"message":a})



}

export const sentConnectionRequest = async(req,res)=>{
    const {token,connectionId} = req.body
    try{

        const user = await User.findOne({token})

        if(!user){
          return  res.status(400).json({message:"User not found"})
        }
    
         const connectionUser = await User.findOne({_id:connectionId})

         if(!connectionUser){
            return res.status(400).json({message:"Connection User not found"})
         }

        const existingUser = await ConnectionRequest.findOne({
            userId:connectionUser._id,
            connectionId:user._id
        })
        if (String(user._id) === String(connectionUser._id)) {
  return res.status(400).json({ message: "You cannot send request to yourself" });
}

        if(existingUser){
           return res.status(400).json({message:"Request already Sent"})
        }

         const request = new ConnectionRequest({
            userId:connectionUser._id,
            connectionId:user._id,
               status_accepted: false
         });
         const reverseRequest = await ConnectionRequest.findOne({
  userId: user._id,             
  connectionId: connectionUser._id  
});

if (reverseRequest) {
  return res.status(400).json({ message: "Request already exists in reverse" });
}

         await request.save();

  return res.json({message:"Request Sent"});
         
 


    }catch(err){
        res.status(500).json({message:err.message})
    }
}

export const   getMyConnectionsRequests= async(req,res)=>{
    const{token} = req.query
    
    try{
        const user = await User.findOne({token})
        if(!user){
            return res.status(404).json({message:"User not found"})   
        }

        const connections = await ConnectionRequest.find({userId:user._id}).populate("connectionId","name username email profilePicture")

      return res.json({connections})


    }catch(err){
        return res.status(500).json({message:err.message})
    }
}

export const whatAreMyConncetions = async(req,res)=>{
    const{token} = req.body

    try{
        const user = await User.findOne({token})

        if(!user){
            return res.status(400).json({message:"User not found"})
        }

        const connections  = await ConnectionRequest.find({userId:user._id}).populate("connectionId","name username email profilePicture")

        res.json(connections)

    }catch(err){
        return res.status(500).json({Message:err.message})
    }
}

export const acceptConnectionRequest = async(req,res)=>{
    let{token,requestId,action_type}= req.body
    try{

     const user = await User.findOne({token})
     if(!user){
        return res.status(404).json({message:"User not Found"})
     }

     const connection = await ConnectionRequest.findOne({_id:requestId})
     if(!connection){
        return res.status(404).json({message:"connection not found"})
     }

     if(action_type==="accept"){
        connection.status_accepted=true
     }else{
        connection.status_accepted= false
     }
       
      await connection.save()

     return res.json({message:"Request Updated"})

    }catch(err){
        return res.status(500).json({message:err.message})
    }
}



export const getUserProfileAndUserBasedOnUsername= async (req,res) => {
    const {username} = req.query

    try{

        let user = await User.findOne({username})

        if(!user){
            return res.status(401).json({message :"User not found"})
        }


        let userProfile = await Profile.findOne({userId : user._id})
         .populate("userId" , "name username email profilePicture")


         return res.json({"profile" : userProfile})

    }catch(err){
        return res.status(500).json({message : err.message})

    }


}
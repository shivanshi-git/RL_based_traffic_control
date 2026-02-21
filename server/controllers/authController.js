export const register =  async (req , res) => {
    const {name , email , password} = req.body;

    if (!name || !email || !password){
        return res.json({success: false, message: 'missing details'})
    }

    try{


    } catch (error){
        res.json({success:false , messsage : error.message})
    }
}

export default  authController;

const mongoose=require('mongoose')
mongoose.set('strictQuery', false);
const password ='1234'

//const connectionString=`mongodb+srv://daniel94cruz:${password}@cluster0.ecmhoaq.mongodb.net/Axia?retryWrites=true&w=majority&appName=Cluster0`
const connectionString=`mongodb+srv://AXIAFINANZAS:${password}@cluster0.rofpd.mongodb.net/Axia?retryWrites=true&w=majority&appName=Cluster0`

const connectDB=async() => {
   await mongoose.connect(connectionString)
.then(() => {
    console.log('dataBase Conected')
}).catch((error) =>{
    console.log(error)
} )
}




module.exports=connectDB;
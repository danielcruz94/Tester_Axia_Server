
require('dotenv').config(); 
const mongoose=require('mongoose')
mongoose.set('strictQuery', false);
// const password ='1234'

//const connectionString=`mongodb+srv://daniel94cruz:${password}@cluster0.ecmhoaq.mongodb.net/Axia?retryWrites=true&w=majority&appName=Cluster0`
// const connectionString=`mongodb+srv://AXIAFINANZAS:${password}@cluster0.rofpd.mongodb.net/Axia?retryWrites=true&w=majority&appName=Cluster0`
const connectDB = async () => {
    const connectionString = process.env.MONGODB_URI;
  
    if (!connectionString) {
      console.error('❌ No se encontró la variable MONGODB_URI');
      return;
    }
  
    try {
      await mongoose.connect(connectionString, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log('✅ MongoDB conectado correctamente');
    } catch (error) {
      console.error('❌ Error al conectar MongoDB:', error.message);
    }
}




module.exports=connectDB;
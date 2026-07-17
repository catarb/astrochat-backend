import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("La variable de entorno MONGODB_URI no está definida");
    }

    const connection = await mongoose.connect(mongoUri);

    console.log(
      `MongoDB conectado correctamente al host ${connection.connection.host}`,
    );
  } catch (error) {
    console.error(`Error al conectar con MongoDB: ${error.message}`);
    throw error;
  }
};

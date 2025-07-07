import { connectMongoDB, getUserByCredentials } from './src/lib/mongo.js';
import { verifyPassword } from './src/lib/password.js';

async function debugLogin() {
  try {
    console.log('🔍 Probando conexión a MongoDB...');
    await connectMongoDB();
    console.log('✅ Conexión exitosa');

    console.log('🔍 Buscando usuario admin...');
    const user = await getUserByCredentials('admin');
    
    if (!user) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }
    
    console.log('✅ Usuario encontrado:', {
      username: user.username,
      role: user.role,
      isActive: user.isActive,
      hasPassword: !!user.password
    });

    console.log('🔍 Probando verificación de contraseña...');
    const isValid = await verifyPassword('admin123', user.password);
    console.log('Contraseña válida:', isValid);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugLogin();

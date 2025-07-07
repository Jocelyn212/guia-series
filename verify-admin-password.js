import { getUserByCredentials } from './src/lib/mongo.js';
import bcrypt from 'bcrypt';

async function verifyAdminCredentials() {
  try {
    console.log('🔍 Verificando usuario seriesadmin...');
    
    const user = await getUserByCredentials('seriesadmin');
    
    if (user) {
      console.log('✅ Usuario encontrado:', {
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        passwordHash: user.password.substring(0, 20) + '...'
      });
      
      // Probar contraseñas posibles
      const possiblePasswords = [
        'Mtz123!@#',
        '0v6nK2e2131eUH+C1ZUnFw==',
        Buffer.from('0v6nK2e2131eUH+C1ZUnFw==', 'base64').toString('utf8')
      ];
      
      for (const password of possiblePasswords) {
        const isValid = await bcrypt.compare(password, user.password);
        console.log(`🔐 Contraseña "${password}": ${isValid ? '✅ VÁLIDA' : '❌ Inválida'}`);
      }
      
    } else {
      console.log('❌ Usuario no encontrado');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

verifyAdminCredentials();

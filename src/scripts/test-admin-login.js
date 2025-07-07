import { getUserByCredentials } from "../lib/mongo";
import { verifyPassword } from "../lib/password";
import { connectMongoDB } from "../lib/mongo";

async function testAdminLogin() {
    try {
        console.log('🔍 Probando login de admin...\n');
        
        await connectMongoDB();
        console.log('✅ Conectado a MongoDB');
        
        const username = 'seriesadmin';
        const password = '0v6nK2e2131eUH+C1ZUnFw==';
        
        console.log(`\n🔐 Intentando login con:`);
        console.log(`   Username: ${username}`);
        console.log(`   Password: ${password}`);
        
        // Buscar usuario
        const user = await getUserByCredentials(username);
        
        if (!user) {
            console.log('❌ Usuario no encontrado');
            return;
        }
        
        console.log('\n✅ Usuario encontrado:');
        console.log(`   ID: ${user._id}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   IsActive: ${user.isActive}`);
        console.log(`   Hash almacenado: ${user.password.substring(0, 30)}...`);
        
        // Verificar contraseña
        console.log('\n🔍 Verificando contraseña...');
        const isPasswordValid = await verifyPassword(password, user.password);
        
        if (isPasswordValid) {
            console.log('✅ ¡Contraseña VÁLIDA! El login debería funcionar.');
            
            // Verificar que es admin
            if (user.role === 'admin' && user.isActive) {
                console.log('✅ Usuario es admin y está activo');
                console.log('✅ ¡Login de admin debería funcionar correctamente!');
            } else {
                console.log('❌ Usuario no es admin o está inactivo');
                console.log(`   Role: ${user.role}`);
                console.log(`   IsActive: ${user.isActive}`);
            }
        } else {
            console.log('❌ Contraseña INVÁLIDA');
        }
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    }
}

testAdminLogin();

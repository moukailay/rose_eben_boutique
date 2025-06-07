// check-setup.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnostic de votre installation Medusa...\n');

// 1. Vérifier la version de Node
try {
  const nodeVersion = process.version;
  console.log(`✅ Node.js version: ${nodeVersion}`);
  if (parseInt(nodeVersion.split('.')[0].substring(1)) < 18) {
    console.log('⚠️  Medusa v2 nécessite Node.js 18 ou supérieur');
  }
} catch (error) {
  console.log('❌ Impossible de vérifier la version de Node.js');
}

// 2. Vérifier PostgreSQL
try {
  execSync('pg_isready', { stdio: 'ignore' });
  console.log('✅ PostgreSQL est en cours d\'exécution');
} catch (error) {
  console.log('❌ PostgreSQL n\'est pas accessible');
  console.log('   Lancez PostgreSQL avec: docker-compose up -d');
}

// 3. Vérifier le fichier .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ Fichier .env trouvé');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = ['DATABASE_URL', 'STORE_CORS', 'ADMIN_CORS'];
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`   ✅ ${varName} est défini`);
    } else {
      console.log(`   ❌ ${varName} manquant`);
    }
  });
} else {
  console.log('❌ Fichier .env non trouvé');
  console.log('   Créez un fichier .env basé sur .env.template');
}

// 4. Vérifier les dépendances
const packageJson = require('./package.json');
const medusaVersion = packageJson.dependencies['@medusajs/medusa'];
console.log(`\n✅ Version de Medusa: ${medusaVersion}`);

// 5. Vérifier les modules requis
const requiredModules = [
  '@medusajs/inventory',
  '@medusajs/stock-location'
];

console.log('\n🔍 Vérification des modules...');
requiredModules.forEach(module => {
  const modulePath = path.join(__dirname, 'node_modules', module);
  if (fs.existsSync(modulePath)) {
    console.log(`   ✅ ${module} est installé`);
  } else {
    console.log(`   ❌ ${module} n'est pas installé`);
    console.log(`      Installez avec: npm install ${module}`);
  }
});

console.log('\n📋 Recommandations:');
console.log('1. Assurez-vous que PostgreSQL est lancé');
console.log('2. Vérifiez votre fichier .env');
console.log('3. Installez les modules manquants');
console.log('4. Lancez: npx medusa db:migrate');
console.log('5. Puis: npm run dev');
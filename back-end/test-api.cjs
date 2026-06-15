
const axios = require('axios').default;
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
require('dotenv').config();

// Create a cookie jar to maintain session
const jar = new CookieJar();
const api = wrapper(axios.create({
  baseURL: 'http://localhost:3000',
  jar,
  withCredentials: true,
}));

async function testWorkflow() {
  console.log('\n========================================');
  console.log('🚀 INICIANDO TESTE DE FLUXO COMPLETO');
  console.log('========================================\n');

  try {
    // Restart with static emails for easier testing
    const clientEmail = 'cliente-static-' + Date.now() + '@teste.com';
    const proEmail = 'profissional-static-' + Date.now() + '@teste.com';

    // Step 1: Register client with static email
    console.log('📋 PASSO 1: Cadastrando cliente com email fixo...');
    const registerClient = await api.post('/auth/register', {
      nome: 'Cliente Teste Fixo',
      email: clientEmail,
      senha: '123456',
      tipo: 'CLIENTE',
    });
    console.log('✅ Cliente cadastrado! Resposta:', JSON.stringify(registerClient.data, null, 2), '\n');

    // Step 2: Client creates service
    console.log('📋 PASSO 2: Cliente criando serviço...');
    const createServiceRes2 = await api.post('/client/services', {
      titulo: 'Instalação elétrica 2',
      descricao: 'Preciso instalar mais tomadas',
      valor: 200,
      prazo: '3 dias',
    });
    const serviceId2 = createServiceRes2.data.servico.id;
    console.log('✅ Serviço criado! ID:', serviceId2, 'Resposta:', JSON.stringify(createServiceRes2.data, null, 2), '\n');

    // Step 3: Logout client
    console.log('📋 PASSO 3: Deslogando cliente...');
    const logoutClient = await api.post('/auth/logout');
    console.log('✅ Cliente deslogado! Resposta:', JSON.stringify(logoutClient.data, null, 2), '\n');

    // Step 4: Register professional with static email
    console.log('📋 PASSO 4: Cadastrando profissional com email fixo...');
    const registerPro = await api.post('/auth/register', {
      nome: 'Profissional Teste Fixo',
      email: proEmail,
      senha: '123456',
      tipo: 'PROFISSIONAL',
    });
    console.log('✅ Profissional cadastrado! Resposta:', JSON.stringify(registerPro.data, null, 2), '\n');

    // Step 5: Create professional profile
    console.log('📋 PASSO 5: Criando perfil profissional...');
    const createProfile = await api.post('/professionals/profile', {
      profissao: 'Eletricista',
      bio: 'Experiência de 10 anos',
      experiencia: '10 anos',
      habilidades: JSON.stringify(['Elétrica', 'Instalação', 'Reparo']),
      localizacao: 'São Paulo',
      descricao: 'Melhores serviços de eletricista',
      cidade: 'São Paulo',
      valor_hora: 120,
      telefone: '11988888888',
    });
    console.log('✅ Perfil criado! Resposta:', JSON.stringify(createProfile.data, null, 2), '\n');

    // Step 6: Professional sends proposal
    console.log('📋 PASSO 6: Profissional enviando proposta para serviço...');
    const sendProposalRes2 = await api.post('/professionals/proposals', {
      serviceId: serviceId2,
    });
    const proposalProfessionalId2 = sendProposalRes2.data.proposta.id;
    console.log('✅ Proposta enviada! ID:', proposalProfessionalId2, 'Resposta:', JSON.stringify(sendProposalRes2.data, null, 2), '\n');

    // Step 7: Logout professional
    console.log('📋 PASSO 7: Deslogando profissional...');
    const logoutPro = await api.post('/auth/logout');
    console.log('✅ Profissional deslogado! Resposta:', JSON.stringify(logoutPro.data, null, 2), '\n');

    // Step 8: Client logs in
    console.log('📋 PASSO 8: Cliente logando...');
    const loginClient = await api.post('/auth/login', {
      email: clientEmail,
      senha: '123456',
    });
    console.log('✅ Cliente logado! Resposta:', JSON.stringify(loginClient.data, null, 2), '\n');

    // Step 9: Client gets service details
    console.log('📋 PASSO 9: Cliente obtendo detalhes do serviço...');
    const serviceDetailsRes = await api.get('/client/proposals/' + serviceId2);
    console.log('✅ Detalhes obtidos! Resposta:', JSON.stringify(serviceDetailsRes.data, null, 2));
    const professionalId = serviceDetailsRes.data.profissionais[0]?.profile?.user_id || serviceDetailsRes.data.profissionais[0]?.id;
    if (professionalId) {
      console.log('   Profissional ID:', professionalId, '\n');
    }

    // Step 10: Client starts service
    console.log('📋 PASSO 10: Cliente iniciando serviço...');
    const startService = await api.patch('/client/proposals/' + serviceId2 + '/start/' + (professionalId || 1));
    console.log('✅ Serviço iniciado! Resposta:', JSON.stringify(startService.data, null, 2), '\n');

    // Step 11: Logout client
    console.log('📋 PASSO 11: Deslogando cliente...');
    const logoutClient2 = await api.post('/auth/logout');
    console.log('✅ Cliente deslogado! Resposta:', JSON.stringify(logoutClient2.data, null, 2), '\n');

    // Step 12: Professional logs in
    console.log('📋 PASSO 12: Profissional logando...');
    const loginPro = await api.post('/auth/login', {
      email: proEmail,
      senha: '123456',
    });
    console.log('✅ Profissional logado! Resposta:', JSON.stringify(loginPro.data, null, 2), '\n');

    // Step 13: Professional marks service as completed
    console.log('📋 PASSO 13: Profissional marcando serviço como concluído...');
    const completeService = await api.post('/professionals/proposals/' + proposalProfessionalId2 + '/complete');
    console.log('✅ Serviço marcado como concluído! Resposta:', JSON.stringify(completeService.data, null, 2), '\n');

    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO! 🎉\n');
    console.log('📋 Resumo dos passos:');
    console.log('   1. Cliente cadastrado');
    console.log('   2. Cliente criou serviço na tabela `proposals`');
    console.log('   3. Profissional cadastrado e criou perfil');
    console.log('   4. Profissional enviou proposta na tabela `proposalProfessionals` (conectada a `proposals`)');
    console.log('   5. Cliente aceitou/iniciou serviço');
    console.log('   6. Profissional marcou serviço como concluído');
    console.log('   7. WhatsApp de notificação simulado!\n');

  } catch (error) {
    console.error('❌ ERRO NO TESTE:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      console.error('   Headers:', JSON.stringify(error.response.headers, null, 2));
    } else if (error.request) {
      console.error('   Request:', error.request);
    } else {
      console.error('   Message:', error.message);
    }
    console.error('   Stack:', error.stack);
  }
}

testWorkflow();


# Micelânia Web Frontend

Sistema de gerenciamento de clientes desenvolvido em React + Vite para a empresa Micelânia.

## 🚀 Funcionalidades

- **Autenticação de usuários** (Login/Registro)
- **Gerenciamento de clientes** com validação de CPF
- **Captura de assinatura digital** via canvas
- **Captura de fotos** via webcam
- **Listagem e busca de clientes** com filtros por data
- **Atualização de dados** de clientes existentes
- **Histórico de compras** por cliente
- **Interface responsiva** para desktop e mobile

## 🛠️ Tecnologias Utilizadas

- **React 18.3.1** - Library para interfaces
- **Vite 6.0.5** - Build tool e servidor de desenvolvimento
- **React Router DOM 7.1.1** - Roteamento
- **Axios 1.7.9** - Cliente HTTP
- **CPF-CNPJ-Validator 1.0.3** - Validação de documentos
- **React Signature Canvas 1.0.7** - Captura de assinatura
- **React Webcam 7.2.0** - Captura de fotos
- **Tesseract.js 6.0.0** - OCR (reconhecimento de texto)
- **Helmet 8.0.0** - Segurança de cabeçalhos HTTP

## 📋 Pré-requisitos

- Node.js 16.0.0 ou superior
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/filipecrespo11/micelania-web-frontend-final.git
cd micelania-web-frontend-final
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (se necessário):
```bash
# Crie um arquivo .env.local na raiz do projeto
VITE_API_URL=https://micelania-app.onrender.com
```

## 🚀 Execução

### Desenvolvimento
```bash
npm run dev
```
O app estará disponível em `http://localhost:5173`

### Build de Produção
```bash
npm run build
```

### Preview da Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

## 📱 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── CameraCapture.jsx    # Captura de fotos
│   ├── CustomerList.jsx     # Lista de clientes
│   ├── CustomerManagement.jsx # Gerenciamento de clientes
│   ├── CustomerUpdate.jsx   # Atualização de clientes
│   ├── Login.jsx           # Tela de login
│   ├── Register.jsx        # Tela de registro
│   ├── ProtectedRoute.jsx  # Proteção de rotas
│   └── logoBase64.jsx      # Logo em base64
├── hooks/              # Custom hooks
│   └── useAuth.js          # Hook de autenticação
├── App.jsx             # Componente principal
├── App.css             # Estilos globais
└── main.jsx            # Ponto de entrada
```

## 🔐 Funcionalidades de Segurança

- **Proteção de rotas** - Verificação de token JWT
- **Validação de formulários** - Validação client-side
- **Sanitização de dados** - Limpeza de inputs
- **Headers de segurança** - Configuração via Helmet

## 🎨 Melhorias Implementadas

### Interface e UX
- ✅ **Design moderno** com gradientes e glassmorphism
- ✅ **Responsividade completa** para mobile/tablet/desktop
- ✅ **Feedback visual** com loading states e mensagens
- ✅ **Acessibilidade** com labels apropriados e navegação por teclado

### Funcionalidades
- ✅ **Formatação automática de CPF** com máscaras
- ✅ **Validação robusta** de formulários
- ✅ **Proteção de rotas** com redirecionamento automático
- ✅ **Estados de loading** em todas as operações
- ✅ **Tratamento de erros** com mensagens específicas
- ✅ **Botão de logout** em áreas protegidas

### Código
- ✅ **Código limpo** com melhor organização
- ✅ **Hooks personalizados** para autenticação
- ✅ **PropTypes** para validação de props
- ✅ **Componentização** adequada
- ✅ **Tratamento de erros** robusto
- ✅ **Performance otimizada** com lazy loading

### Segurança
- ✅ **Validação de token** antes de cada requisição
- ✅ **Sanitização de dados** de entrada
- ✅ **Proteção contra XSS** básica
- ✅ **Headers de segurança** configurados

## 📊 API Endpoints

O frontend se conecta com a API backend nos seguintes endpoints:

- `POST /auth/login` - Autenticação de usuário
- `POST /auth/register` - Registro de novo usuário
- `GET /customers` - Listar clientes
- `POST /customers` - Criar novo cliente
- `GET /customers/:id` - Buscar cliente específico
- `PUT /customers/:id` - Atualizar cliente

## 🔄 Fluxo de Trabalho

1. **Login/Registro** - Usuário se autentica no sistema
2. **Dashboard** - Acesso ao gerenciamento de clientes
3. **Cadastro** - Inclusão de novos clientes com assinatura
4. **Listagem** - Visualização e busca de clientes existentes
5. **Edição** - Atualização de dados e novas compras

## 🐛 Problemas Corrigidos

- ❌ Arquivo CSS corrompido → ✅ CSS reescrito com design moderno
- ❌ HTML mal estruturado → ✅ Semântica correta
- ❌ Falta de validação → ✅ Validação robusta
- ❌ Sem tratamento de erros → ✅ Feedback adequado
- ❌ Design inconsistente → ✅ UI/UX profissional
- ❌ Código duplicado → ✅ Componentização
- ❌ Falta de segurança → ✅ Proteção de rotas

## 🚀 Próximas Melhorias Sugeridas

- [ ] **Modo offline** com cache local
- [ ] **Notificações push** para novos clientes
- [ ] **Relatórios em PDF** de vendas
- [ ] **Dashboard analítico** com gráficos
- [ ] **Sistema de backup** automático
- [ ] **Logs de auditoria** de ações
- [ ] **Integração com WhatsApp** para comunicação
- [ ] **Sistema de permissões** por usuário

## 👥 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é propriedade da Micelânia e é destinado apenas para uso interno.

## 📞 Suporte

Para suporte técnico, entre em contato:
- Email: suporte@micelania.com
- Desenvolvedor: Filipe Crespo

---

**Versão:** 2.0.0  
**Última atualização:** Dezembro 2024

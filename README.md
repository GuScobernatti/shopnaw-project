# Shopnaw Store 🛍️

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white)

> Um E-commerce Full Stack completo com gestão de estoque, cálculo de frete real e pagamentos integrados.

---

### 💻 Sobre o Projeto

O **Shopnaw Store** é uma aplicação de comércio eletrônico desenvolvida para simular um ambiente real de vendas online. O projeto vai além do básico, implementando fluxos complexos como Webhooks de pagamento, cálculo de frete via API de correios e gestão administrativa de produtos.

🌐 **Acesse o projeto online:** [www.shopnaw.com.br](https://www.shopnaw.com.br)

---

### 📸 Screenshots

|                             Home Page                              |                          Carrinho de Compras                           |
| :----------------------------------------------------------------: | :--------------------------------------------------------------------: |
| ![Home](/frontend/src/assets/Screenshot%202026-01-28%20011150.png) | ![Carrinho](/frontend/src/assets/Screenshot%202026-01-28%20011307.png) |

|                            Painel Admin                             |                                Checkout                                |
| :-----------------------------------------------------------------: | :--------------------------------------------------------------------: |
| ![Admin](/frontend/src/assets/Screenshot%202026-01-28%20011427.png) | ![Checkout](/frontend/src/assets/Screenshot%202026-01-28%20011330.png) |

---

### ⚙️ Funcionalidades

- [x] **Autenticação:** Login e Cadastro de usuários com JWT.
- [x] **Catálogo:** Listagem de produtos com filtros e paginação.
- [x] **Carrinho:** Gestão de itens local e sincronizada com banco de dados.
- [x] **Checkout Transparente:**
  - Integração com **Mercado Pago** (Pix e Cartão).
  - Webhook para atualização automática de status (Pendente -> Aprovado).
- [x] **Logística:** Cálculo de frete em tempo real via **Melhor Envio**.
- [x] **Painel Administrativo:**
  - CRUD de Produtos (com upload de imagens via **Cloudinary**).
  - Dashboard de Vendas.
- [x] **E-mails:** Envio automático de status do pedido.

---

### 🛠 Tecnologias Utilizadas

#### Front-end

- **React.js**: Biblioteca principal.
- **Context API**: Gerenciamento de estado global (Carrinho/Auth).
- **Styled Components**: Estilização dinâmica.
- **Axios**: Requisições HTTP.

#### Back-end

- **Node.js & Express**: API RESTful.
- **PostgreSQL**: Banco de dados relacional.
- **node-postgres (pg)**: Driver de conexão.
- **Bcrypt & JWT**: Segurança e Autenticação.

#### Infraestrutura & APIs Externas

- **Vercel**: Deploy do Frontend.
- **Render**: Deploy do Backend e Banco de Dados.
- **Cloudinary**: Armazenamento de imagens.
- **Mercado Pago API**: Processamento de pagamentos.
- **Melhor Envio API**: Cotação de fretes.

---

### 🚀 Como rodar este projeto

```bash
# Clone este repositório
$ git clone [https://github.com/SEU_USUARIO/shopnaw-project.git](https://github.com/SEU_USUARIO/shopnaw-project.git)

# Acesse a pasta do projeto no terminal/cmd
$ cd shopnaw-project

# Instale as dependências (Front e Back)
$ cd backend && npm install
$ cd ../frontend && npm install

# Execute a aplicação
$ cd backend && npm start
$ cd frontend && npm run dev
```

<a href="https://www.linkedin.com/in/gustavo-scobernatti/"> <img style="border-radius: 50%;" src="https://www.google.com/search?q=https://avatars.githubusercontent.com/u/108602635%3Fv%3D4" width="100px;" alt=""/> <br /> <sub><b>Gustavo Luiz Scobernatti de Almeida</b></sub> </a> <a href="https://www.linkedin.com/in/gustavo-scobernatti/" title="Linkedin">🚀</a>

Feito por Gustavo Luiz Scobernatti de Almeida.
👋🏽 Entre em contato!

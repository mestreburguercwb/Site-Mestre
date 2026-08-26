# 🍔 Mestre Burguer - Sistema de Pedidos Online

[![React](https://shields.io)](https://react.dev)
[![Vite](https://shields.io)](https://vitejs.dev)
[![Supabase](https://shields.io)](https://supabase.com)
[![PostgreSQL](https://shields.io)](https://postgresql.org)

O **Mestre Burguer** é um sistema profissional completo de pedidos online desenvolvido para hamburguerias artesanais. A plataforma abrange desde a interface pública do cliente (cardápio digital, carrinho e checkout) até um painel administrativo robusto e em tempo real para gerenciamento de estoque, produtos, categorias e fluxo de pedidos.

---

## 🎨 Identidade Visual & Design

O design do sistema segue uma proposta **Premium, Moderna e Gastronômica**, inspirada em hamburguerias artesanais de alto padrão.
*   **Cor de Fundo:** Preto (`#000000`)
*   **Cores de Destaque:** Dourado metálico, Vermelho, Laranja/Cheddar e Branco.
*   **Elementos Visuais:** Estética forte baseada em detalhes de brasão, fogo, metal e ouro, evitando layouts genéricos de templates comuns.

---

## 🛠️ Tecnologias Obrigatórias

*   **Frontend:** React + Vite (JavaScript ou TypeScript) com CSS Moderno.
*   **Backend & Banco de Dados:** Supabase e PostgreSQL.
*   **Autenticação:** Supabase Auth.
*   **Funcionalidades Realtime:** Supabase Realtime (Sincronização instantânea de pedidos).
*   **Storage:** Supabase Storage (Bucket `product-images` para upload de imagens).
*   **Deploy Homologado:** Netlify ou Vercel.

---

## 📂 Arquitetura do Projeto

A estrutura de pastas do frontend deve seguir rigorosamente a organização abaixo:

```text
src/
├── components/   # Componentes reutilizáveis (botões, cards, modais)
├── pages/        # Telas da aplicação (Home, Login, Admin, Dashboard)
├── layouts/      # Layouts de estrutura (ClientLayout, AdminLayout)
├── hooks/        # React Hooks personalizados (useAuth, useCart)
├── services/     # Regras de negócio e chamadas de API
├── contexts/     # Contextos globais (CartContext, AuthContext)
├── lib/          # Inicialização de bibliotecas externas (supabase.js)
├── data/         # Dados estáticos ou mocks iniciais
├── styles/       # Estilizações globais e temas CSS
└── App.jsx       # Componente raiz
```

---

## ⚙️ Configuração do Ambiente (Supabase)

A conexão com o banco de dados é feita exclusivamente por variáveis de ambiente. As chaves de acesso nunca devem ser expostas diretamente no código.

1. Crie um arquivo `.env` na raiz do projeto com base no arquivo `.env.example`:
   ```bash
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   ```

2. O arquivo de conexão em `src/lib/supabase.js` deve ser configurado da seguinte forma:
   ```javascript
   import { createClient } from '@supabase/supabase-js';

   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```

---

## 🗄️ Modelagem do Banco de Dados (PostgreSQL)

O banco de dados armazena o histórico estático de preços e nomes no momento do pedido. Se um produto for alterado ou deletado do catálogo, os pedidos antigos permanecerão intactos.

### 1. Tabela `categories`
*   `id` (UUID/BigInt, PK)
*   `name` (Text)
*   `description` (Text)
*   `image_url` (Text)
*   `display_order` (Integer)
*   `active` (Boolean)
*   `created_at` (Timestamp)

> **Carga Inicial de Categorias:** `Lanches`, `Adicionais`, `Porções`.

### 2. Tabela `products`
*   `id` (UUID/BigInt, PK)
*   `category_id` (FK -> `categories.id`)
*   `name` (Text)
*   `description` (Text)
*   `price` (Numeric/Decimal)
*   `image_url` (Text)
*   `active` (Boolean)
*   `featured` (Boolean) - *Destaque*
*   `display_order` (Integer)
*   `created_at` (Timestamp)
*   `updated_at` (Timestamp)

### 3. Tabela `orders`
*   `id` (UUID/BigInt, PK)
*   `order_number` (Serial/Integer)
*   `customer_name` (Text)
*   `customer_phone` (Text)
*   `delivery_address` (Text)
*   `delivery_number` (Text)
*   `delivery_complement` (Text)
*   `delivery_neighborhood` (Text)
*   `payment_method` (Text) - *Dinheiro, Pix, Cartão de Crédito, Cartão de Débito*
*   `change_for` (Numeric/Decimal, Nullable) - *Troco para quanto*
*   `notes` (Text, Nullable)
*   `subtotal` (Numeric/Decimal)
*   `delivery_fee` (Numeric/Decimal)
*   `total` (Numeric/Decimal)
*   `status` (Text) - *Valores: pending, confirmed, preparing, ready, out_for_delivery, delivered, cancelled*
*   `created_at` (Timestamp)
*   `updated_at` (Timestamp)

### 4. Tabela `order_items`
*   `id` (UUID/BigInt, PK)
*   `order_id` (FK -> `orders.id` ON DELETE CASCADE)
*   `product_id` (FK -> `products.id` ON DELETE SET NULL)
*   `product_name` (Text) - *Snapshot do nome no momento da compra*
*   `quantity` (Integer)
*   `unit_price` (Numeric/Decimal) - *Snapshot do preço no momento da compra*
*   `subtotal` (Numeric/Decimal)
*   `created_at` (Timestamp)

### 5. Tabela `order_item_extras`
*   `id` (UUID/BigInt, PK)
*   `order_item_id` (FK -> `order_items.id` ON DELETE CASCADE)
*   `extra_id` (UUID/BigInt)
*   `extra_name` (Text)
*   `price` (Numeric/Decimal)
*   `quantity` (Integer)

---

## 🔒 Segurança (Row Level Security - RLS)

As políticas de RLS no Supabase garantem o controle estrito de acessos:
*   **Clientes (Público Não Autenticado):** Podem ler apenas categorias e produtos ativos (`active = true`). Possuem permissão exclusiva de **Inserção** na tabela de `orders`, `order_items` e `order_item_extras`. Não possuem acesso de leitura ou escrita a dados de outros clientes ou painéis internos.
*   **Administradores (Autenticados via Supabase Auth):** Possuem controle total de **CRUD** (Create, Read, Update, Delete) em todas as tabelas, gerenciamento do bucket de imagens e alteração de status de pedidos.

---

## 💻 Funcionalidades do Sistema

### 🛒 Área do Cliente (`/`)
*   **Cardápio Digital:** Navegação fluida categorizada entre Home, Lanches, Adicionais e Porções.
*   **Modal de Customização:** Ao selecionar um produto, abre um modal interativo para inclusão de adicionais e observações.
*   **Carrinho Persistente:** Controle de quantidade de itens (`+` / `-`), exclusão e cálculo de subtotal automático em tempo de execução.
*   **Checkout Completo:** Formulário detalhado com dados de entrega e forma de pagamento (Dinheiro com campo dinâmico de troco, Pix, Crédito ou Débito).

### 🔐 Autenticação Administrativa (`/admin/login`)
*   Tela de login segura integrada ao Supabase Auth.
*   Middleware de proteção de rotas: Tentativas de acesso direto à rota `/admin` sem token ativo redirecionam o usuário imediatamente para a tela de login.

### 📊 Painel Administrativo (`/admin`)
*   **Dashboard de Métricas:** Cards informativos com contagem de pedidos do dia (Pendentes, Em Preparo, Concluídos), Faturamento do Dia, produtos mais vendidos e histórico recente.
*   **Monitoramento Realtime de Pedidos:** Atualização instantânea na tela assim que um cliente finaliza uma compra. Emite um alerta visual (`🔔 NOVO PEDIDO RECEBIDO!`), sinal sonoro opcional e destaca o card do novo pedido.
*   **Fluxo do Pedido:** Alteração de status com um clique através dos botões: *Confirmar, Em Preparo, Pronto, Saiu para Entrega, Entregue e Cancelar*.
*   **Filtros Avançados:** Filtros por status do pedido e períodos de tempo (Hoje, Ontem, Últimos 7 dias, Últimos 30 dias).
*   **Gerenciamento de Produtos & Imagens:** Interface para cadastrar, editar, duplicar, ativar/desativar e excluir itens, integrado ao Supabase Storage para upload e substituição de fotos de produtos.

---

## 📦 Dados Iniciais para Cadastro

### Categorias e Produtos

#### 🥪 Lanches
*   **X-BURGUER** (R$ 14,90): *Pão, hambúrguer, queijo cheddar, picles e molho*
*   **X-BACON** (R$ 19,90): *Pão, hambúrguer, queijo cheddar, bacon, picles e molho*
*   **X-TUDO** (R$ 25,90): *Pão, hambúrguer, queijo, bacon, presunto, ovo, alface, tomate e cebola roxa*
*   **X-SALADA** (R$ 17,90): *Pão, hambúrguer, queijo, presunto, alface, tomate e picles*
*   **X-CALABRESA** (R$ 19,90): *Pão, hambúrguer, queijo, calabresa, cebola roxa e molho cheddar*
*   **DUPLO SMASH** (R$ 24,90): *Pão, 2 hambúrgueres, queijo, bacon em tiras, picles, cebola roxa e molho cheddar*
*   **MEXICANO** (R$ 22,90): *Pão, hambúrguer, queijo, alface americana, cebola roxa, molho cheddar e nachos*

#### 🥓 Adicionais
*   Bacon — R$ 5,00
*   Cheddar — R$ 3,00
*   Ovo — R$ 3,00
*   Calabresa — R$ 4,00
*   Cebola Roxa — R$ 3,00

#### 🍟 Porções
*   **BATATA** — R$ 16,90
*   **CALABRESA ACEBOLADA** — R$ 20,90

#### 🥤 Bebidas
*   Coca-Cola lata 310 ml — R$ 5,99
*   Coca-Cola lata Zero 310 ml — R$ 5,99
*   Água Mineral 500 ml — R$ 3,99

---

## 🚀 Como Executar o Projeto Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com
   cd mestre-burguer
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente no arquivo `.env`.

4. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

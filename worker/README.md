# Servidor do chat (aba "Perguntas")

A aba **Perguntas** do app envia as dúvidas para este pequeno servidor, que roda de graça na Cloudflare. Ele guarda a sua chave da API do Claude em segredo, conversa com a IA e devolve a resposta ao app. A chave nunca fica no código do app, que é público.

Tudo pode ser feito pelo navegador, inclusive no celular. Leva uns 15 minutos.

---

## 1. Criar a chave da API do Claude

1. Acesse https://console.anthropic.com e crie uma conta.
2. Em **Billing**, adicione créditos (o uso é pago por pergunta respondida).
3. **Defina um limite de gastos** em **Settings → Limits** (por exemplo, US$ 5 por mês). Isso garante que a conta nunca passe desse valor, mesmo que alguém abuse do chat.
4. Em **API Keys → Create Key**, crie uma chave com o nome `leitura-biblica` e **copie** o valor (começa com `sk-ant-`). Ele só aparece uma vez.

> Nunca cole essa chave no GitHub, no app ou em conversas. Ela só vai no passo 3.

## 2. Criar o servidor na Cloudflare

1. Crie uma conta gratuita em https://dash.cloudflare.com.
2. No menu, abra **Compute (Workers) → Workers & Pages → Create → Create Worker** (o nome do menu pode variar um pouco).
3. Dê o nome `leitura-biblica-chat` e toque em **Deploy**.
4. Toque em **Edit code**, apague todo o código de exemplo, cole o conteúdo de [`worker.js`](worker.js) e toque em **Deploy**.
5. Anote o endereço do servidor, algo como:
   `https://leitura-biblica-chat.SEU-USUARIO.workers.dev`

## 3. Guardar a chave como segredo

No Worker, vá em **Settings → Variables and Secrets → Add**:

| Tipo | Nome | Valor |
|---|---|---|
| **Secret** | `ANTHROPIC_API_KEY` | a chave `sk-ant-...` do passo 1 |

Salve e faça **Deploy** de novo se o painel pedir.

Opcionais, como **Text**:

| Nome | Para que serve | Padrão |
|---|---|---|
| `MODEL` | Modelo do Claude. `claude-haiku-5-5` é o mais barato; `claude-sonnet-5-5` dá respostas mais elaboradas e custa mais. | `claude-haiku-5-5` |
| `LIMIT_PER_IP` | Perguntas por pessoa por dia | `30` |
| `LIMIT_PER_DAY` | Perguntas no total por dia. Não passe de 450: cada pergunta faz 2 gravações no KV, e o plano gratuito permite 1.000 por dia. | `300` |
| `ALLOWED_ORIGINS` | Sites que podem usar o chat | `https://guilhermeldps-debug.github.io` |

## 4. Ligar os limites diários (recomendado)

Os limites `LIMIT_PER_IP` e `LIMIT_PER_DAY` e o recebimento de denúncias só funcionam com um KV (um pequeno banco de dados gratuito):

1. No painel, abra **Storage & Databases → KV → Create** e crie um namespace chamado `leitura-biblica-limites`.
2. Volte ao Worker → **Settings → Bindings → Add → KV namespace**.
3. **Variable name:** `LIMITS` · **KV namespace:** `leitura-biblica-limites`. Salve e faça **Deploy**.

## 5. Testar

Abra o endereço do Worker no navegador. Deve aparecer:

```json
{"ok":true,"service":"leitura-biblica-chat"}
```

## 6. Ligar o app

Envie o endereço do Worker para o Claude (ou edite você mesmo): no `index.html`, a linha

```js
const CHAT_URL = "";
```

passa a ser

```js
const CHAT_URL = "https://leitura-biblica-chat.SEU-USUARIO.workers.dev";
```

Depois do envio ao GitHub, a aba **Perguntas** começa a responder em poucos minutos, inclusive no app instalado e na versão da Play Store.

---

## Ver denúncias

Quando alguém toca em **Denunciar resposta**, a pergunta, a resposta e o motivo ficam guardados por 90 dias no KV `leitura-biblica-limites`, com chaves que começam com `report:`. Para ver: **Storage & Databases → KV → leitura-biblica-limites → KV Pairs**.

## Segurança e custos

- A chave fica só na Cloudflare, como segredo criptografado.
- O servidor só aceita pedidos vindos do site do app (`ALLOWED_ORIGINS`). Isso barra o uso por outros sites, mas não é uma proteção total; por isso os limites diários e o **limite de gastos no console da Anthropic** são importantes.
- As conversas não são gravadas. Com o KV ligado, ficam só contadores diários (por IP anonimizado, apagados em 2 dias) e as denúncias (apagadas em 90 dias).
- O plano gratuito da Cloudflare cobre 100 mil pedidos por dia, muito acima do necessário.

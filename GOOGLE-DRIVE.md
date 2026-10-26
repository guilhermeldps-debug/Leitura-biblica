# Ligar o backup no Google Drive

O botão **Salvar no Drive** do app precisa de uma autorização do Google, um "ID do cliente". Ele é criado uma única vez no Google Cloud. **É gratuito e não pede cartão de crédito.** Leva uns 10 minutos e dá para fazer pelo celular, mas no computador é mais confortável.

Use a sua **conta Google pessoal**.

---

## 1. Criar o projeto

1. Acesse https://console.cloud.google.com e aceite os termos, se pedir.
2. No topo, abra o seletor de projetos → **Novo projeto**.
3. Nome: `Leitura Biblica` → **Criar**. Confira se o projeto novo está selecionado no topo.

> Se o Google oferecer um "teste gratuito" ou pedir para ativar faturamento, **ignore**. Nada aqui precisa de faturamento.

## 2. Ativar a API do Google Drive

1. No menu ☰, abra **APIs e serviços → Biblioteca**.
2. Busque **Google Drive API**, abra e toque em **Ativar**.

## 3. Configurar a tela de login (Google Auth Platform)

1. No menu ☰, abra **APIs e serviços → Tela de permissão OAuth** (pode aparecer como **Google Auth Platform**) → **Começar**.
2. **Informações do app:** nome `Leitura Bíblica`, e-mail de suporte: o seu.
3. **Público:** **Externo**.
4. **Dados de contato:** o seu e-mail → aceite a política → **Criar**.
5. Em **Branding** (Identidade visual), preencha:
   - **Página inicial do app:** `https://guilhermeldps-debug.github.io/Leitura-biblica/`
   - **Política de Privacidade:** `https://guilhermeldps-debug.github.io/Leitura-biblica/privacidade.html`
   - **Domínios autorizados:** `guilhermeldps-debug.github.io`
   - **Não envie logotipo.** Com logotipo, o Google exige uma verificação extra.
   - Salve.
6. Em **Acesso a dados** → **Adicionar ou remover escopos**, marque `.../auth/drive.file` ("Ver, editar, criar e excluir somente os arquivos do Google Drive que você usa com este app") → **Atualizar** → **Salvar**.
7. Em **Público** → **Publicar app** → confirme. O status passa a **Em produção**.
   - O escopo `drive.file` é classificado pelo Google como **não sensível**, então não há análise demorada. Se o app ficasse em "Teste", só e-mails cadastrados conseguiriam entrar.

## 4. Criar o ID do cliente

1. Em **Clientes** (ou **Credenciais → Criar credenciais → ID do cliente OAuth**):
2. **Tipo de aplicativo:** **Aplicativo da Web**. Nome: `Leitura Bíblica`.
3. **Origens JavaScript autorizadas** → Adicionar URI:
   ```
   https://guilhermeldps-debug.github.io
   ```
4. **URIs de redirecionamento autorizados** → Adicionar URI (exatamente assim, com a barra no final):
   ```
   https://guilhermeldps-debug.github.io/Leitura-biblica/
   ```
5. **Criar**. Copie o **ID do cliente**, que termina em `.apps.googleusercontent.com`.
   - Não é preciso usar a "chave secreta do cliente". Não a envie a ninguém.

## 5. Ligar no app

Mande o **ID do cliente** para o Claude, ou edite você mesmo no `index.html`:

```js
const DRIVE_CLIENT_ID = "";
```

passa a ser

```js
const DRIVE_CLIENT_ID = "123456789-abc.apps.googleusercontent.com";
```

O ID do cliente **não é segredo**: ele fica no código público do app de propósito, é assim que o login do Google funciona em apps web.

Depois do envio ao GitHub, a área **Google Drive** aparece na seção Backup do app em poucos minutos.

---

## Como funciona para quem usa o app

- **Salvar no Drive:** na primeira vez, abre o login do Google. A pessoa escolhe a conta e autoriza o acesso, e o app cria a pasta **Leitura Bíblica** com o arquivo `backup-leitura-biblica.json`. Nas próximas vezes, **o mesmo arquivo é substituído**, sem criar cópias.
- **Restaurar do Drive:** busca esse arquivo, mostra o resumo (capítulos, anotações, conexões) e só substitui o progresso do celular depois da confirmação.
- **Trocar de celular:** instale o app, toque em **Restaurar do Drive** e entre com a mesma conta Google.
- A autorização vale por cerca de 1 hora. Depois disso, o app abre o login de novo, normalmente com um toque só.
- O app só enxerga os arquivos que ele mesmo criou. Os demais arquivos do Drive ficam inacessíveis para ele.

## Problemas comuns

| Mensagem | O que fazer |
|---|---|
| `redirect_uri_mismatch` na tela do Google | Confira o passo 4.4: o endereço precisa ser idêntico, com `https`, `L` maiúsculo em `Leitura-biblica` e a barra no final. |
| "A API do Google Drive ainda não foi ativada" | Faça o passo 2 no mesmo projeto do ID do cliente. |
| "Acesso bloqueado: o app não concluiu a verificação" | Confira o passo 3.7 (app **Em produção**) e se nenhum logotipo foi enviado. |
| "Acesso ao Google Drive cancelado" | A pessoa fechou ou recusou a tela do Google. É só tentar de novo. |

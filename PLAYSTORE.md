# Leitura Bíblica na Google Play

Guia para publicar o app (PWA em https://guilhermeldps-debug.github.io/Leitura-biblica/) na Google Play como TWA (Trusted Web Activity).

O app Android é um "invólucro" que abre o site em tela cheia. Por isso, **atualizações feitas no site chegam ao app da loja automaticamente**, sem enviar um novo AAB. Só é preciso gerar outro AAB quando mudar algo do próprio invólucro (nome, ícone, cores, versão do Android).

---

## 1. Textos da ficha da loja

### Nome do app (até 30 caracteres)

```
Leitura Bíblica
```

Alternativa, caso queira se diferenciar de outros apps com nome parecido: `Leitura Bíblica: Diário` (23 caracteres).

### Descrição curta (até 80 caracteres)

```
Marque os capítulos lidos, faça anotações e ligue passagens. Funciona offline.
```

(78 caracteres)

### Descrição completa (até 4.000 caracteres)

```
Acompanhe sua leitura da Bíblia, capítulo por capítulo.

O Leitura Bíblica é um diário de leitura simples e bonito para quem quer ler a Bíblia inteira ou criar o hábito de ler todos os dias. Você marca o que leu, vê seu progresso e guarda o que aprendeu em cada capítulo.

📖 MARQUE SUA LEITURA
• Os 66 livros e 1.189 capítulos, organizados por seção: Pentateuco, Livros históricos, Poéticos, Profetas, Evangelhos, Cartas e Apocalipse.
• Toque nos capítulos lidos e confirme em "Salvar". Nada é alterado sem a sua confirmação.
• Botão "Próximo capítulo" para continuar de onde parou.
• Veja os livros na ordem bíblica ou em ordem cronológica aproximada.

📊 ACOMPANHE SEU PROGRESSO
• Livros concluídos e capítulos lidos, no total e por Testamento.
• Capítulos lidos hoje, dias seguidos de leitura e livros em andamento.
• Mapa das últimas 16 semanas para ver sua constância.

✍️ ANOTE E CONECTE
• Escreva anotações em cada capítulo: versículos, reflexões, perguntas e orações.
• Crie conexões entre passagens (profecia e cumprimento, texto paralelo, citação ou mesmo tema), marcadas por cores nos dois capítulos.
• Busque em todas as suas anotações e conexões.
• Um pequeno resumo do assunto de cada livro ajuda a contextualizar a leitura.

💬 TIRE SUAS DÚVIDAS
• Painel "Perguntas", aberto pelo botão no topo: pergunte sobre a Bíblia e a fé cristã e receba respostas de uma inteligência artificial que mostram, separadamente e bem identificadas, a visão evangélica e a visão católica, além do que as duas têm em comum, com as referências bíblicas.
• Pergunte direto de um livro para entender a mensagem dele.
• As respostas são geradas por IA e podem conter erros: confira na Bíblia e converse com o pastor ou o padre da sua comunidade.

🔒 PRIVADO E OFFLINE
• Sem cadastro, sem anúncios e sem rastreamento.
• Seu progresso, suas anotações e suas conexões ficam somente no seu celular. Só as perguntas que você faz no painel "Perguntas" são enviadas para serem respondidas pela IA, sem identificar você.
• Funciona sem internet.
• Salve um arquivo de backup e restaure quando trocar de aparelho.

🌙 DO SEU JEITO
• Tema claro, escuro ou automático.

Observação: o app não traz o texto bíblico. Use-o junto com a sua Bíblia preferida, impressa ou digital.
```

### Outras informações da ficha

| Campo | Sugestão |
|---|---|
| Categoria | Livros e referências |
| Tags | Bíblia, leitura, estudo bíblico, devocional |
| E-mail de contato | seu e-mail (aparece publicamente na ficha) |
| Site | https://guilhermeldps-debug.github.io/Leitura-biblica/ |
| Política de privacidade | https://guilhermeldps-debug.github.io/Leitura-biblica/privacidade.html |

### Imagens da ficha (já estão no repositório)

| Item exigido | Arquivo |
|---|---|
| Ícone 512×512 | `loja/icone-512.png` |
| Gráfico de destaque 1024×500 | `loja/feature-graphic-1024x500.png` |
| Capturas de tela do celular (mínimo 2) | `screenshots/painel.png`, `screenshots/livro.png`, `screenshots/conexoes.png`, `screenshots/perguntas.png` (1080×1920) |

As capturas usam dados de exemplo. Se preferir, tire capturas no seu próprio celular, que já mostram as fontes exatamente como no app.

---

## 2. Antes de começar: publicar o assetlinks.json

O assetlinks.json prova ao Android que o site e o app são do mesmo dono. Sem ele o app funciona, mas abre com uma **barra de endereço** no topo, como um navegador.

O Android só procura esse arquivo na **raiz do domínio**:

```
https://guilhermeldps-debug.github.io/.well-known/assetlinks.json
```

O app está em um subcaminho (`/Leitura-biblica/`), então o arquivo deste repositório (`.well-known/assetlinks.json`) **não é suficiente**: ele fica em `/Leitura-biblica/.well-known/`, onde o Android não procura. A raiz `guilhermeldps-debug.github.io` é servida por outro repositório, o do seu "site de usuário".

**Como fazer:**

1. No GitHub, crie um repositório público chamado exatamente `guilhermeldps-debug.github.io`.
2. Adicione um arquivo vazio chamado `.nojekyll` na raiz. Sem ele o GitHub Pages ignora pastas que começam com ponto, como `.well-known`.
3. Adicione o arquivo `.well-known/assetlinks.json` (copie o deste repositório, já com os fingerprints reais — veja a etapa 4).
4. Em **Settings → Pages**, publique a partir da branch `main`, pasta `/ (root)`.
5. Confira abrindo https://guilhermeldps-debug.github.io/.well-known/assetlinks.json no navegador. Deve aparecer o JSON.

Isso não afeta o app atual: ele continua em `/Leitura-biblica/`.

Alternativa: usar um domínio próprio (ex.: `leiturabiblica.com.br`) no GitHub Pages. Aí o app fica na raiz do domínio e o assetlinks.json deste repositório passa a valer.

---

## 3. Gerar o AAB assinado com o PWABuilder

1. Acesse https://www.pwabuilder.com e cole `https://guilhermeldps-debug.github.io/Leitura-biblica/`.
2. Aguarde a análise. O manifest, o service worker e os ícones devem aparecer como válidos.
3. Clique em **Package for stores** → **Android** → **Generate Package**.
4. Em **All settings**, confira:
   - **Package ID:** `io.github.guilhermeldps_debug.leiturabiblica` (é o mesmo do assetlinks.json; **não pode ser alterado depois** do primeiro envio ao Play Console).
   - **App name:** `Leitura Bíblica` · **Launcher name:** `Leitura Bíblica`
   - **App version:** `1.0.0` · **App version code:** `1` (aumente a cada novo AAB enviado: 2, 3…)
   - **Host:** `guilhermeldps-debug.github.io`
   - **Start URL:** `/Leitura-biblica/`
   - **Manifest URL:** `https://guilhermeldps-debug.github.io/Leitura-biblica/manifest.json`
   - **Theme color:** `#23407A` · **Background color:** `#F6F7F9`
   - **Display mode:** Standalone
   - **Signing key:** **Create new** (preencha nome, organização e senhas).
5. Clique em **Download**. O ZIP traz:
   - `*.aab`: o arquivo que vai para a Play Store.
   - `*.apk`: para instalar e testar direto no celular.
   - `signing.keystore` e `signing-key-info.txt`: **sua chave de upload e as senhas**.
   - `assetlinks.json`: com o fingerprint da chave de upload.

> ⚠️ **Guarde `signing.keystore` e `signing-key-info.txt` em local seguro** (fora do GitHub, com backup). Sem eles você não consegue enviar atualizações do app. Nunca coloque esses arquivos no repositório.

---

## 4. Enviar ao Play Console

1. Crie a conta de desenvolvedor em https://play.google.com/console (taxa única de US$ 25 e verificação de identidade).
2. **Criar app**: nome `Leitura Bíblica`, idioma padrão Português (Brasil), tipo **App**, **Gratuito**. Aceite as declarações.
3. **Teste fechado → Criar nova versão**. Aceite o **Play App Signing** (o Google guarda a chave final de assinatura).
4. Envie o `.aab` gerado pelo PWABuilder. Nome da versão: `1.0.0`. Notas: "Primeira versão".
5. Pegue os fingerprints e complete o assetlinks.json:
   - **Chave de assinatura do app:** Play Console → **Teste e lançamento → Configuração → Integridade do app → Assinatura de apps** → copie o **SHA-256** do "Certificado da chave de assinatura do app".
   - **Chave de upload:** já preenchida no `.well-known/assetlinks.json` deste repositório (`4D:C2:B0:EF:…:AA:76`, vinda do ZIP do PWABuilder).
   - Coloque os dois no lugar dos textos `COLE_AQUI_...` e publique o arquivo na raiz, como explicado na etapa 2.
   - Confira em https://developers.google.com/digital-asset-links/tools/generator (Host: `guilhermeldps-debug.github.io`, pacote e SHA-256 da chave de assinatura do app).
6. Preencha o **Conteúdo do app** (menu "Política"):
   - **Política de privacidade:** `https://guilhermeldps-debug.github.io/Leitura-biblica/privacidade.html`
   - **Anúncios:** não contém anúncios.
   - **Acesso ao app:** todo o app está disponível sem login.
   - **Segurança dos dados:** progresso, anotações e conexões ficam só no aparelho e não são coletados. O painel **Perguntas** envia o texto das perguntas a um servidor para gerar a resposta, então declare:
     - **Coleta de dados: Sim** → tipo **Atividade no app → Outros conteúdos gerados pelo usuário**.
     - **Uso:** Funcionalidade do app. **Opcional** (o usuário escolhe se quer usar o chat). **Processado de forma temporária**: as conversas não são guardadas; só respostas denunciadas ficam 90 dias para revisão.
     - **Compartilhamento: Não** (Cloudflare e Anthropic atuam como prestadores de serviço, que o Google não considera compartilhamento).
     - **Criptografia em trânsito: Sim** (HTTPS). **Exclusão:** não há conta nem dados guardados; informe que o usuário pode limpar a conversa no app.
   - **Conteúdo gerado por IA:** o app cumpre a política do Google Play para IA generativa: cada resposta tem o botão **Denunciar resposta**, que envia a denúncia ao desenvolvedor, e o app avisa que as respostas são geradas por IA.
   - **Classificação de conteúdo:** responda ao questionário (categoria Referência/Educação; nada de violência ou conteúdo sensível).
   - **Público-alvo:** escolher faixas a partir de 13 anos evita as exigências extras do programa para famílias. Inclua menores de 13 só se quiser esse público.
   - **App de notícias**, **Apps governamentais**, **Recursos financeiros**, **Saúde:** responda "não".
7. Preencha a **Ficha principal da loja** com os textos e imagens da seção 1.

---

## 5. Teste fechado: 12 testadores por 14 dias

Contas pessoais criadas depois de 13 de novembro de 2023 precisam disso antes de publicar para todos. Regra atual: **pelo menos 12 testadores com opt-in, mantido por 14 dias seguidos**. Quem sai antes não conta, e quem sai e volta reinicia a contagem.

1. **Teste e lançamento → Testes → Teste fechado** → na faixa (ex.: "Alpha"), abra **Testadores**.
2. Crie uma lista de e-mails (contas Google) ou use um Google Grupo. **Convide 15 a 20 pessoas** para ter folga caso alguém desista.
3. Envie a versão para revisão. Quando for aprovada, copie o **link de participação (opt-in)** e mande aos testadores.
4. Cada testador precisa: abrir o link com a conta Google convidada → tocar em **Tornar-se testador** → instalar pela Play Store → **não sair do teste** pelos 14 dias.
5. Peça que usem o app de verdade durante o período (marquem capítulos, escrevam anotações). O Google pode pedir mais tempo de teste se houver pouco uso.
6. Se publicar ajustes durante o teste, gere um AAB com **version code maior** (2, 3…) e envie na mesma faixa.
7. Depois dos 14 dias com 12 ou mais testadores ativos: **Painel → Solicitar acesso à produção**. Responda às perguntas sobre o teste (quem testou, o que foi ajustado, por que o app está pronto).
8. Aprovado o acesso, crie a versão de **Produção** (pode promover a mesma versão do teste fechado) e envie para revisão.

---

## 6. Depois de publicado

- **Mudanças no app (telas, funções, textos):** basta atualizar o site no GitHub. O app da loja carrega a versão nova sozinho.
- **Mudanças no ícone, nome ou cores do invólucro:** gere um novo AAB no PWABuilder com a **mesma chave** (`signing.keystore`) e um version code maior.
- **Nunca altere** o Package ID nem perca a chave de upload.

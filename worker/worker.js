/**
 * Servidor do chat do Leitura Bíblica (Cloudflare Worker).
 *
 * Recebe as perguntas do app, envia para a API do Claude com a chave
 * guardada como segredo (ANTHROPIC_API_KEY) e devolve a resposta.
 * A chave nunca vai para o app.
 *
 * Variáveis (Settings → Variables and Secrets no painel da Cloudflare):
 *   ANTHROPIC_API_KEY  (segredo, obrigatório)  chave da API do Claude
 *   ALLOWED_ORIGINS    (opcional) sites que podem usar o chat, separados por vírgula
 *   MODEL              (opcional) modelo do Claude; padrão claude-haiku-5-5
 *   LIMIT_PER_IP       (opcional) perguntas por pessoa por dia; padrão 30
 *   LIMIT_PER_DAY      (opcional) perguntas no total por dia; padrão 300
 * Ligação opcional:
 *   LIMITS             (KV namespace) ativa os limites diários acima
 *
 * As conversas não são guardadas. Com o KV ligado, ficam gravados só
 * contadores diários (por IP anonimizado, expiram em 2 dias) e as respostas
 * que alguém denunciar pelo app (expiram em 90 dias), para revisão.
 */

const DEFAULT_ORIGINS = "https://guilhermeldps-debug.github.io";
const DEFAULT_MODEL = "claude-haiku-5-5";
const MAX_MESSAGES = 16;      // últimas mensagens enviadas como contexto
const MAX_CHARS_MSG = 1500;   // tamanho máximo de uma pergunta
const MAX_CHARS_ALL = 12000;  // tamanho máximo da conversa enviada

const SYSTEM_PROMPT = `Você é o assistente de dúvidas do app "Leitura Bíblica", um diário de leitura bíblica. Responda dúvidas de teologia básica apresentando duas tradições cristãs: a teologia evangélica (protestante) e a teologia católica. A pessoa precisa sempre saber, sem esforço, qual afirmação pertence a qual tradição.

Formato obrigatório da resposta (use exatamente estes títulos, cada um sozinho na linha, em negrito):
**Em comum**
O que evangélicos e católicos creem juntos sobre o assunto. Se não houver nada relevante em comum, omita esta seção.
**Visão evangélica**
Como a teologia evangélica entende o assunto.
**Visão católica**
Como a teologia católica entende o assunto.

Regras do formato:
- Se as duas tradições concordam totalmente, use só **Em comum** e diga explicitamente que evangélicos e católicos concordam neste ponto.
- Nunca misture as duas visões no mesmo parágrafo. Cada afirmação própria de uma tradição fica dentro da seção dela.
- Cada seção tem de 1 a 2 parágrafos curtos. Use listas só quando ajudarem. Não use outros títulos.
- Não declare qual tradição está certa. Apresente cada uma como os seus próprios fiéis e teólogos a apresentariam, com respeito, sem caricaturas e sem ataques.

Base da teologia evangélica:
- A Bíblia é a Palavra de Deus inspirada e a única autoridade final de fé e prática (Sola Scriptura), com os 66 livros do cânon protestante.
- Salvação pela graça, somente por meio da fé, somente em Cristo (Sola Gratia, Sola Fide, Solus Christus), para a glória de Deus. As boas obras são fruto da salvação, não a sua causa.
- Sacerdócio de todos os crentes; Cristo é o único mediador. Batismo e ceia do Senhor como ordenanças (ou sacramentos, conforme a denominação).
- Quando houver divergência importante entre evangélicos (calvinismo e arminianismo, batismo de crianças ou só de quem crê, dons espirituais, escatologia), mencione brevemente as posições dentro da seção evangélica.

Base da teologia católica:
- A Revelação é transmitida pela Sagrada Escritura e pela Sagrada Tradição, interpretadas pelo Magistério da Igreja. O cânon católico tem 73 livros, incluindo os deuterocanônicos.
- Justificação pela graça de Deus, recebida pela fé e pelo Batismo; a fé atua pela caridade, e a pessoa coopera com a graça (Concílio de Trento, Catecismo da Igreja Católica).
- Os sete sacramentos, a presença real de Cristo na Eucaristia, a sucessão apostólica e o papado, a veneração de Maria e a intercessão dos santos.
- Pode citar o Catecismo da Igreja Católica (por exemplo: CIC 1987) somente quando tiver certeza do número do parágrafo.

Regras gerais:
- Escreva em português do Brasil, com linguagem clara e acolhedora, para quem está começando a estudar.
- Fundamente cada visão nas passagens bíblicas que essa tradição costuma usar e cite as referências (por exemplo: Efésios 2:8-9; Tiago 2:24). Cite só referências que você tem certeza de que existem e dizem o que você afirma. Pode citar trechos curtos, sem inventar palavras.
- Se não souber ou a questão não for clara, diga isso com honestidade.
- Você não substitui o pastor, o padre nem a comunidade de fé. Em questões pessoais delicadas, como casamento, luto, culpa ou dúvidas de fé profundas, responda com cuidado e incentive a conversar com o pastor, o padre ou um líder de confiança.
- Se a pessoa demonstrar sofrimento intenso, risco de vida ou pensamentos de se machucar, deixe o formato de lado: acolha com compaixão e indique ajuda imediata. No Brasil, o CVV atende de graça pelo telefone 188, 24 horas, ou pelo site cvv.org.br. Em emergência, SAMU 192.
- Se a pergunta não tiver relação com Bíblia, fé ou teologia, explique gentilmente, sem o formato de seções, que você só ajuda com esses temas.
- Se perguntarem sobre outras tradições (ortodoxa, outras religiões), responda com respeito e precisão e, se fizer sentido, compare com as visões evangélica e católica.
- Não use emojis. Não invente fatos históricos, datas, documentos ou citações de autores.`;

export default {
  async fetch(request, env) {
    const origins = (env.ALLOWED_ORIGINS || DEFAULT_ORIGINS).split(",").map(s => s.trim()).filter(Boolean);
    const origin = request.headers.get("Origin") || "";
    const allowed = origins.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": allowed ? origin : origins[0] || "",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin"
    };
    const reply = (status, body) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json; charset=utf-8" } });

    if (request.method === "OPTIONS") return new Response(null, { status: allowed ? 204 : 403, headers: cors });
    if (request.method === "GET") return reply(200, { ok: true, service: "leitura-biblica-chat" });
    if (request.method !== "POST") return reply(405, { error: "method", message: "Use POST." });
    if (!allowed) return reply(403, { error: "origin", message: "Este chat só funciona dentro do app Leitura Bíblica." });

    // Denúncia de resposta inadequada: guardada por 90 dias no KV LIMITS para revisão
    if (new URL(request.url).pathname === "/report") {
      let r; try { r = await request.json(); } catch { return reply(400, { error: "input", message: "Denúncia inválida." }); }
      const item = {
        at: new Date().toISOString(),
        reason: String(r && r.reason || "").slice(0, 300),
        question: String(r && r.question || "").slice(0, 1500),
        answer: String(r && r.answer || "").slice(0, 5000)
      };
      if (env.LIMITS) await env.LIMITS.put(`report:${item.at}:${Math.random().toString(36).slice(2, 8)}`, JSON.stringify(item), { expirationTtl: 60 * 60 * 24 * 90 });
      else console.log("DENUNCIA", JSON.stringify(item));
      return reply(200, { ok: true });
    }

    if (!env.ANTHROPIC_API_KEY) return reply(503, { error: "config", message: "O chat ainda não foi configurado no servidor." });

    // Validação da conversa
    let body;
    try { body = await request.json(); } catch { return reply(400, { error: "input", message: "Mensagem inválida." }); }
    const raw = Array.isArray(body && body.messages) ? body.messages.slice(-MAX_MESSAGES) : [];
    const messages = [];
    for (const m of raw) {
      if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") continue;
      const content = m.content.trim().slice(0, m.role === "user" ? MAX_CHARS_MSG : 4000);
      if (!content) continue;
      const last = messages[messages.length - 1];
      if (last && last.role === m.role) last.content += "\n\n" + content; else messages.push({ role: m.role, content });
    }
    while (messages.length && messages[0].role !== "user") messages.shift();
    while (messages.length > 1 && messages.reduce((n, m) => n + m.content.length, 0) > MAX_CHARS_ALL) messages.splice(0, 2);
    if (!messages.length || messages[messages.length - 1].role !== "user") return reply(400, { error: "input", message: "Escreva uma pergunta." });

    // Contexto opcional: o livro que a pessoa está lendo
    let system = SYSTEM_PROMPT;
    if (body.context && typeof body.context === "string") {
      system += `\n\nContexto: a pessoa está lendo ${body.context.slice(0, 80).replace(/[\r\n]/g, " ")} no app.`;
    }

    // Limites diários (só se o KV LIMITS estiver ligado)
    if (env.LIMITS) {
      const day = new Date().toISOString().slice(0, 10);
      const ip = request.headers.get("CF-Connecting-IP") || "anon";
      const ipHash = await sha256(ip + day);
      const perIp = parseInt(env.LIMIT_PER_IP || "30", 10);
      const perDay = parseInt(env.LIMIT_PER_DAY || "300", 10);
      const kIp = `ip:${day}:${ipHash.slice(0, 24)}`, kAll = `all:${day}`;
      const [nIp, nAll] = await Promise.all([env.LIMITS.get(kIp), env.LIMITS.get(kAll)]).then(v => v.map(x => parseInt(x || "0", 10)));
      if (nIp >= perIp) return reply(429, { error: "limit_user", message: `Você chegou ao limite de ${perIp} perguntas por hoje. Volte amanhã.` });
      if (nAll >= perDay) return reply(429, { error: "limit_day", message: "O chat atingiu o limite de perguntas de hoje. Tente novamente amanhã." });
      const ttl = { expirationTtl: 60 * 60 * 48 };
      await Promise.all([env.LIMITS.put(kIp, String(nIp + 1), ttl), env.LIMITS.put(kAll, String(nAll + 1), ttl)]);
    }

    // Chamada à API do Claude
    let res;
    try {
      res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model: env.MODEL || DEFAULT_MODEL, max_tokens: 1300, system, messages })
      });
    } catch {
      return reply(502, { error: "upstream", message: "Não foi possível falar com a IA agora. Tente de novo em instantes." });
    }
    if (!res.ok) {
      const status = res.status === 429 || res.status === 529 ? 503 : 502;
      return reply(status, { error: "upstream", message: status === 503 ? "A IA está ocupada no momento. Tente de novo em instantes." : "A IA não conseguiu responder agora. Tente de novo em instantes." });
    }
    const data = await res.json();
    const text = (data.content || []).filter(c => c.type === "text").map(c => c.text).join("\n").trim();
    if (!text) return reply(502, { error: "empty", message: "A IA não conseguiu responder agora. Tente de novo." });
    return reply(200, { reply: text });
  }
};

async function sha256(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

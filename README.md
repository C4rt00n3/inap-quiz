# Prepara App Test

Aplicacao web de testes educacionais com Next.js (App Router) e CSS puro.

## Visao geral

- A home (`/`) lista automaticamente todos os testes da pasta `data/`.
- Cada arquivo `*.json` em `data/` representa um teste disponivel.
- Ao clicar em **Iniciar Teste**, o usuario vai para `/teste/[slug]`.
- O resultado exibe acertos, porcentagem, barra de progresso e mensagem de desempenho.

## Como rodar

```bash
npm install
npm run dev
```

Acesse: `http://localhost:3000`

## Como criar um novo teste

1. Crie um novo arquivo JSON dentro de `data/`.
2. O nome do arquivo vira o slug da rota.
3. Exemplo: `data/geometria-aula-02.json` vira `/teste/geometria-aula-02`.

### Estrutura obrigatoria do JSON

```json
{
  "title": "Nome do Teste",
  "subject": "Materia",
  "lesson": "Aula 01",
  "questions": [
    {
      "id": "q1",
      "statement": "Enunciado da pergunta",
      "difficulty": "Facil",
      "options": [
        { "id": "a", "text": "Alternativa A" },
        { "id": "b", "text": "Alternativa B" },
        { "id": "c", "text": "Alternativa C" },
        { "id": "d", "text": "Alternativa D" }
      ],
      "correctOptionId": "b"
    }
  ]
}
```

### Regras importantes

- `questions` deve conter uma lista de perguntas.
- Cada pergunta deve ter exatamente 4 alternativas (padrao esperado da aplicacao).
- `difficulty` deve ser: `Facil`, `Medio` ou `Dificil`.
- `correctOptionId` deve apontar para um `id` existente em `options`.
- Recomendado: manter `id` de pergunta unico dentro do mesmo teste.

## Organizacao de pastas

- `app/page.tsx`: home com selecao de testes.
- `app/teste/[slug]/page.tsx`: pagina do teste escolhido.
- `components/`: componentes reutilizaveis da interface.
- `lib/tests.ts`: leitura de arquivos JSON em `data/`.
- `types/test.ts`: tipagens centrais da aplicacao.
- `app/styles/`: CSS Modules.

## Documentacao de funcoes

As funcoes principais foram documentadas com JSDoc `/** */`, incluindo:

- Leitura e validacao dos testes em `lib/tests.ts`.
- Fluxo de execucao do quiz em `components/quiz-client.tsx`.
- Componentes de interface e funcoes auxiliares em `components/`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
```

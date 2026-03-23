# Supabase Studio — Multi-Project Self-Hosted

Fork do Supabase Studio com suporte a múltiplos projetos em self-hosted.

## Como funciona

Adiciona a variável `PROJECTS_CONFIG` com um JSON array de projetos. O Studio mostra todos os projetos na sidebar, com Auth e banco separados por projeto.

## Configuração

No `docker-compose.yml` do Studio:

```yaml
studio:
  image: ghcr.io/SEU_USUARIO/supabase-studio-multi:latest
  environment:
    PROJECTS_CONFIG: |
      [
        {
          "ref": "rikus-money",
          "name": "Rikus Money",
          "db": "rikus_money",
          "auth_url": "http://auth-rikus-money:9999",
          "anon_key": "eyJ...",
          "service_key": "eyJ...",
          "jwt_secret": "..."
        },
        {
          "ref": "rikus",
          "name": "Rikus",
          "db": "rikus",
          "auth_url": "http://auth-rikus:9999",
          "anon_key": "eyJ...",
          "service_key": "eyJ...",
          "jwt_secret": "..."
        }
      ]
    # Outras env vars do Studio...
    STUDIO_PG_META_URL: http://meta:8080
    POSTGRES_HOST: db
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    PG_META_CRYPTO_KEY: ${PG_META_CRYPTO_KEY}
    SUPABASE_URL: http://kong:8000
    SUPABASE_PUBLIC_URL: https://studio.ama.dev.br
    SUPABASE_ANON_KEY: ${ANON_KEY}
    SUPABASE_SERVICE_KEY: ${SERVICE_ROLE_KEY}
    AUTH_JWT_SECRET: ${JWT_SECRET}
```

## Arquivos modificados

- `lib/api/self-hosted/project-config.ts` — helper de lookup por ref
- `pages/api/platform/projects/index.ts` — retorna todos os projetos
- `pages/api/platform/pg-meta/[ref]/tables.ts` — injeta connection string por projeto
- `pages/api/platform/auth/[ref]/users/index.ts` — list/create users por projeto
- `pages/api/platform/auth/[ref]/users/[id].ts` — get/update/delete user por projeto
- `pages/api/platform/auth/[ref]/invite.ts` — invite por projeto

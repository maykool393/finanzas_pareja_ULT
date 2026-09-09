# features/

Una carpeta por dominio (`accounts`, `debts`, `investments`, `transactions`).
Cada una agrupa lo suyo y no importa desde otra feature:

```
accounts/
  api.ts        consultas a Supabase (solo esta capa toca `lib/supabase`)
  useAccounts.ts  hook de datos que consume la UI
  AccountRow.tsx  componentes propios de la feature
```

Lo compartido sube a `components/ui`, `hooks` o `lib`.

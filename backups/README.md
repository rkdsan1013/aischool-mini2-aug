## DB 백업

```bash
docker compose exec db pg_dump -U postgres -F p mydb > ./backups/mydb.sql
```

## DB 복원

```bash
docker compose exec -T db psql -U postgres -d mydb < ./backups/mydb.sql
```

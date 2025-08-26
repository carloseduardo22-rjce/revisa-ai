# Docker para Desenvolvimento Local

Este setup do Docker foi configurado especificamente para desenvolvimento local, não para produção.

## Características

### Frontend (Angular)

- Roda em modo desenvolvimento
- Hot reload ativado
- Porta: 4200
- Volume montado para live reload

### Backend (Node.js)

- Roda em modo desenvolvimento
- Porta: 3000
- Volume montado para live reload
- Banco de dados SQLite persistido

## Como usar

### Iniciar os serviços

```bash
docker-compose up --build
```

### Acessar as aplicações

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000

### Parar os serviços

```bash
docker-compose down
```

### Logs em tempo real

```bash
# Todos os serviços
docker-compose logs -f

# Apenas frontend
docker-compose logs -f frontend

# Apenas backend
docker-compose logs -f backend
```

### Rebuild após mudanças no package.json

```bash
docker-compose up --build
```

## Vantagens desta configuração

1. **Live Reload**: Mudanças no código são refletidas automaticamente
2. **Persistência**: Banco de dados SQLite é mantido entre restarts
3. **Isolamento**: Ambiente consistente independente da máquina local

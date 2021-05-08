# simplebot
Simples bot do whatsapp com arquivamento de chats antigos usando o https://wppconnect-team.github.io/.

Ao iniciar o cliente um cronjob é agendado para arquivar as mensagens com mais de 30 dias sem interação. 

Para evitar ban, colcoamos o limite de 100 chats arquivados por dia, com pausa de 5 segundos a cada arquivamento e 30 segundos a cada 10 arquivamentos!

## Getting Started

1- Instale as dependencias ba raiz do projeto com um dos comandos abaixo:
```bash
> npm i  
```
ou
```bash
> yarn 
```

2- rode o projeto com um dos comandos abaixo:
```bash
> npm start 
```
ou
```bash
> yarn start
```

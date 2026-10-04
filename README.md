# Secreto V3

Aplicativo pessoal desenvolvido para organizar informações de forma simples e local.

## Recursos

- 📝 Notas
- 🎯 Metas
- ✅ Tarefas
- 👕 Roupas Sítio
- ⏱️ Cronômetro
- 📊 Progresso
- ⚙️ Configurações
- 🗑️ Lixeira
- 🔒 Proteção por senha
- 👁️ Modo Visualizador
- 🌙 Tema escuro e claro
- 🕐 Formato de horário 12h ou 24h
- 📤 Compartilhamento
- 📱 Interface adaptada para celular
- 📅 Data e hora de criação dos registros
- 📡 Funcionamento offline

## Armazenamento

Os dados são armazenados localmente no navegador usando `localStorage`.

O projeto não utiliza banco de dados externo.

## Offline

O aplicativo utiliza um Service Worker para armazenar os arquivos principais em cache e permitir o funcionamento offline depois que o aplicativo tiver sido carregado.

## Tecnologias

- HTML
- CSS
- JavaScript
- localStorage
- Service Worker
- Cache API
- Web Share API

## Estrutura

```text
index.html
style.css
script.js
sw.js
README.md

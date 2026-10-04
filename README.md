# 🎯 Meu Espaço — Projeto #016

Projeto #016 do laboratório de testes e desenvolvimento com GitHub Pages.

O **Meu Espaço** é uma aplicação pessoal feita com HTML, CSS e JavaScript, funcionando diretamente no navegador e sem banco de dados.

---

## 🚀 Funcionalidades

### 🔐 Tela de acesso

- Senha inicial: `Hg99`
- Tela inicial limpa, mostrando apenas o acesso.
- Possibilidade de alterar a senha posteriormente.
- Botão para bloquear e voltar para a tela de senha.

---

## 🏠 Dashboard

Depois do acesso, o usuário encontra:

- Data atual
- Hora atual
- 🎯 Metas
- 📋 Tarefas
- 📝 Notas
- ⏱️ Cronômetro
- 📊 Progresso
- ⚙️ Configurações

---

## 🎯 Metas

Cada meta possui:

- Título
- Descrição
- Data e hora de criação
- Marcação de concluída
- Edição
- Exclusão
- Fixação
- Pesquisa pelo título
- Compartilhamento

As metas são exibidas inicialmente apenas pelo título.

Ao tocar em uma meta, uma tela separada mostra o conteúdo completo.

---

## 📋 Tarefas

Cada tarefa possui:

- Título
- Descrição
- Data e hora de criação
- Marcação de concluída
- Edição
- Exclusão
- Fixação
- Pesquisa pelo título
- Compartilhamento

Assim como nas metas, a lista mostra somente o título e informações pequenas de apoio.

---

## 📝 Notas

As notas possuem:

- Título
- Conteúdo
- Data e hora de criação
- Edição
- Exclusão
- Fixação
- Pesquisa pelo título
- Compartilhamento

Ao tocar no título, o conteúdo completo é aberto em uma tela separada.

---

## ⏱️ Cronômetro

Cronômetro independente com:

- Iniciar
- Pausar
- Zerar
- Contagem em horas, minutos e segundos

O tempo também pode fazer parte do compartilhamento geral.

---

## 📊 Progresso

A tela de progresso apresenta:

- Total de metas
- Metas concluídas
- Metas em andamento
- Percentual de conclusão
- Gráfico de metas concluídas
- Gráfico de metas em andamento
- Compartilhamento do progresso

Os números e gráficos são atualizados automaticamente conforme as metas são alteradas.

---

## ⚙️ Configurações

O projeto possui:

### 🔒 Voltar para tela de senha

Bloqueia novamente o aplicativo.

### 🗑️ Apagar geral

Apaga:

- Metas
- Tarefas
- Notas
- Cronômetro
- Configurações salvas

A função possui uma senha de confirmação separada:

`Hg88`

Depois da confirmação, a senha de acesso volta para:

`Hg99`

### 👁️ Modo Visualizador

Permite apenas visualizar as informações.

No modo visualizador, ficam bloqueadas ações como:

- Criar
- Editar
- Excluir
- Fixar
- Concluir

A pesquisa e a visualização continuam disponíveis.

### 🎨 Tema

Alternância entre:

- Preto e vermelho
- Branco e vermelho

### 🔑 Alterar senha

Permite trocar a senha utilizada para entrar no aplicativo.

### 🕐 Formato da hora

Permite escolher entre:

- 24 horas
- 12 horas

### ℹ️ Sobre o projeto

Exibe informações sobre o projeto.

### 📤 Compartilhar geral

Compartilha:

- Metas
- Tarefas
- Notas
- Progresso
- Cronômetro

---

## 📤 Compartilhamento

O projeto utiliza a API de compartilhamento do navegador:

`Web Share API`

Em dispositivos compatíveis, o botão abre o menu nativo de compartilhamento do sistema.

Caso o navegador não ofereça essa função, o projeto apresenta uma alternativa para copiar o conteúdo.

---

## 💾 Armazenamento

O projeto utiliza:

- `localStorage`

As informações ficam armazenadas localmente no navegador.

Não existe banco de dados externo.

Isso significa que os dados não são sincronizados automaticamente entre aparelhos.

---

## 📡 Funcionamento offline

O projeto utiliza:

- Service Worker
- Cache API

Depois que o site é carregado pelo menos uma vez enquanto estiver online, os arquivos principais podem continuar disponíveis offline.

O Service Worker utiliza uma estratégia de:

**Rede primeiro → cache como fallback**

Assim, quando houver internet, o navegador tenta obter a versão mais atualizada do GitHub.

Quando não houver internet, utiliza a versão armazenada no cache.

---

## 🔐 Sobre segurança

As senhas utilizadas neste projeto são armazenadas e verificadas no próprio navegador.

Portanto, este projeto é uma aplicação pessoal e experimental.

Ele não deve ser considerado um sistema profissional de segurança.

---

## 🧪 Projeto de laboratório

Este projeto faz parte dos testes de tecnologias que podem ser reutilizadas em futuros projetos com GitHub Pages.

Tecnologias utilizadas ou relacionadas:

- HTML
- CSS
- JavaScript
- LocalStorage
- Service Worker
- Cache API
- Web Share API
- GitHub Pages

---

## 🆓 Hospedagem

O projeto foi desenvolvido para funcionar utilizando:

**GitHub Pages**

Sem:

- Banco de dados
- Servidor próprio
- Hospedagem paga
- Serviços externos obrigatórios

---

## 📌 Projeto

**Projeto:** #016  
**Nome:** Meu Espaço  
**Versão:** V3.0  
**Plataforma:** GitHub Pages  
**Tipo:** Aplicação web pessoal

---

## 👨‍💻 Desenvolvimento

Projeto desenvolvido como parte de uma sequência de experimentos e descobertas sobre o que é possível fazer utilizando tecnologias web diretamente no navegador.

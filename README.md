# 🎯 Minhas Metas — V3.0

Sistema pessoal para organizar metas, tarefas, tempo e progresso.

## 📱 Sobre

O Minhas Metas é um projeto pessoal desenvolvido para organizar objetivos e tarefas diretamente pelo navegador.

O projeto funciona no GitHub Pages e não utiliza banco de dados externo.

---

## 🔐 Acesso

O sistema possui uma senha de acesso.

Senha inicial:

`Hg99`

A senha pode ser alterada posteriormente pelas Configurações.

Existe também uma senha separada para a função de **Apagar geral**:

`Hg88`

A proteção é local e não deve ser considerada uma solução de segurança forte.

---

## 🎯 Metas

É possível:

- Criar metas
- Editar metas
- Excluir metas
- Marcar metas como concluídas
- Visualizar metas
- Pesquisar pelo título
- Compartilhar metas
- Registrar data e hora de criação

A lista mostra somente o título da meta.

Ao tocar no título, o sistema abre uma página própria com o conteúdo completo.

---

## 📋 Tarefas

É possível:

- Criar tarefas
- Editar tarefas
- Excluir tarefas
- Marcar tarefas como concluídas
- Visualizar tarefas
- Pesquisar pelo título
- Compartilhar tarefas
- Registrar data e hora de criação

---

## ⏱️ Cronômetro

Cronômetro independente com:

- Iniciar
- Pausar
- Zerar

O tempo atual também pode ser incluído no compartilhamento geral.

---

## 📊 Progresso

O sistema calcula automaticamente:

- Metas totais
- Metas concluídas
- Metas em andamento

Também existe um gráfico que representa visualmente a proporção entre metas concluídas e metas em andamento.

Os dados são atualizados automaticamente quando uma meta é criada, excluída ou concluída.

---

## ⚙️ Configurações

As configurações incluem:

- Voltar para a tela de senha
- Apagar geral
- Modo Visualizador
- Tema
- Alterar senha de acesso
- Formato da hora
- Sobre o projeto
- Compartilhar geral

---

## 👁️ Modo Visualizador

O Modo Visualizador permite consultar o conteúdo sem permitir alterações.

Quando ativado:

- Não é possível criar metas
- Não é possível criar tarefas
- Não é possível editar
- Não é possível excluir
- Não é possível alterar o status

A visualização e a pesquisa continuam disponíveis.

---

## 🌓 Temas

O sistema possui dois temas:

- Preto + vermelho
- Branco + vermelho

A escolha fica armazenada no navegador.

---

## ⏰ Formato da hora

É possível utilizar:

- Formato de 24 horas
- Formato de 12 horas

---

## 📤 Compartilhamento

O sistema utiliza a capacidade de compartilhamento do navegador.

Existem opções para compartilhar:

- Metas
- Tarefas
- Progresso
- Uma meta ou tarefa específica
- Todas as informações através do Compartilhar geral

Quando o navegador não oferece o compartilhamento nativo, o sistema tenta copiar o conteúdo para a área de transferência.

---

## 💾 Armazenamento

Os dados utilizam:

`localStorage`

Portanto, as informações permanecem no navegador e dispositivo utilizados.

Não existe sincronização automática entre dispositivos.

---

## 📶 Funcionamento offline

O projeto utiliza:

- Service Worker
- Cache API

Os principais arquivos são armazenados no cache para permitir funcionamento offline após o primeiro carregamento.

O sistema também utiliza atualização automática do Service Worker para reduzir problemas com versões antigas armazenadas no cache.

---

## 🌐 Tecnologias

- HTML5
- CSS3
- JavaScript
- LocalStorage
- Service Worker
- Cache API
- Web Share API
- GitHub Pages

---

## 🗂️ Estrutura

```text
Secreto-02/
│
├── index.html
├── style.css
├── script.js
├── sw.js
└── README.md

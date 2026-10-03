# 🎯 Minhas Metas — Projeto #016

Sistema pessoal para organizar metas, tarefas e acompanhar o progresso.

## 📱 Sobre o projeto

O **Minhas Metas** é um site pessoal desenvolvido para organizar objetivos, tarefas e acompanhar o progresso.

O projeto foi desenvolvido para funcionar no **GitHub Pages**, sem banco de dados e sem servidor próprio.

---

## 🔐 Acesso

O site possui uma tela inicial de senha.

Senha atual:

`Hg99`

> A senha está armazenada no código do projeto. Portanto, essa proteção é apenas uma barreira prática de acesso e não deve ser considerada uma segurança forte.

---

## 🎯 Metas

A área de metas permite:

- Adicionar metas
- Editar metas
- Excluir metas
- Marcar metas como concluídas
- Visualizar metas em andamento
- Registrar a data de criação

---

## 📋 Tarefas

A área de tarefas permite:

- Adicionar tarefas
- Editar tarefas
- Excluir tarefas
- Marcar tarefas como concluídas
- Registrar a data de criação

---

## ⏱️ Cronômetro

O sistema possui um cronômetro independente com:

- Iniciar
- Pausar
- Zerar

O cronômetro funciona diretamente no navegador.

---

## 📊 Progresso

A área de progresso apresenta automaticamente:

- Metas totais
- Metas concluídas
- Metas em andamento
- Gráficos atualizados automaticamente

Os números e gráficos são calculados diretamente a partir das metas cadastradas.

---

## 💾 Armazenamento

Os dados são armazenados utilizando:

`localStorage`

Isso significa que os dados ficam armazenados localmente no navegador e no dispositivo utilizado.

Não existe banco de dados externo.

### Importante

Os dados não são sincronizados automaticamente entre dispositivos.

Se o site for aberto em outro celular ou computador, ele terá seu próprio armazenamento local.

---

## 📤 Backup

O projeto possui uma função de exportação dos dados.

É possível gerar um arquivo:

`JSON`

Esse arquivo contém:

- Metas
- Tarefas
- Informações necessárias para restaurar os dados

---

## 📥 Restauração

Um backup JSON pode ser importado novamente pelo próprio site.

A importação substitui os dados atuais pelos dados presentes no backup.

---

## 📶 Funcionamento offline

O projeto utiliza:

`Service Worker`

e

`Cache API`

Os principais arquivos do site são armazenados no cache do navegador.

Depois que o site tiver sido carregado pelo menos uma vez com internet e o Service Worker estiver instalado, ele poderá continuar funcionando sem conexão.

Arquivos principais armazenados no cache:

- `index.html`
- `style.css`
- `script.js`
- `sw.js`

---

## 🌐 Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- LocalStorage
- Service Worker
- Cache API
- GitHub Pages

---

## 🗂️ Estrutura do projeto

```text
metas-016/
│
├── index.html
├── style.css
├── script.js
├── sw.js
└── README.md

# 🔐 Secreto V3

Projeto #016 desenvolvido para testes e utilização de recursos modernos da web através do GitHub Pages.

O projeto funciona diretamente no navegador, sem banco de dados e sem servidor próprio.

---

## 🏠 Estrutura principal

Depois da senha, o aplicativo apresenta:

- 📝 Notas
- 🎯 Metas
- 📋 Tarefas
- 👕 Roupas Sítio
- ⏱️ Cronômetro
- 📊 Progresso
- ⚙️ Configurações

---

## 🔐 Acesso

Senha inicial:

`Hg99`

A senha pode ser alterada dentro das configurações.

O título da página é:

`Secreto V3`

---

# 📝 Notas

As notas possuem:

- Título
- Conteúdo
- Data e hora de criação
- Pesquisa pelo título
- Fixar
- Editar
- Excluir
- Compartilhar

A lista apresenta o título da nota.

Ao tocar no título, o conteúdo completo é exibido.

---

# 🎯 Metas

As metas possuem:

- Título
- Descrição
- Data e hora
- Concluir
- Fixar
- Editar
- Excluir
- Pesquisa
- Compartilhar

As metas concluídas alimentam automaticamente a tela de progresso.

---

# 📋 Tarefas

As tarefas possuem:

- Título
- Descrição
- Data e hora
- Concluir
- Fixar
- Editar
- Excluir
- Pesquisa
- Compartilhar

---

# 👕 Roupas Sítio

A seção permite criar listas de roupas para o sítio.

Ao adicionar uma lista, os campos aparecem exatamente nesta ordem:

1. Título
2. Touca
3. Camiseta
4. Blusa
5. Calça
6. Adicionar extras

Exemplo:

Título:

`Final de semana`

Touca:

`1`

Camiseta:

`2`

Blusa:

`1`

Calça:

`2`

Adicionar extras:

`meias, chinelo, toalha`

Cada lista possui:

- Fixar
- Editar
- Excluir

---

# ⏱️ Cronômetro

Possui:

- Iniciar
- Pausar
- Zerar

O tempo utiliza:

`HH:MM:SS`

O valor também pode ser incluído no compartilhamento geral.

---

# 📊 Progresso

A tela mostra:

- Metas totais
- Metas concluídas
- Metas em andamento
- Percentual de conclusão
- Gráfico de concluídas
- Gráfico de andamento

Os valores são atualizados automaticamente.

---

# ⚙️ Configurações

As configurações possuem:

- Voltar para tela de senha
- Lixeira
- Apagar geral
- Modo Visualizador
- Tema
- Alterar senha
- Formato da hora
- Sobre o projeto
- Compartilhar geral

---

# 🔒 Bloqueio

O bloqueio do aplicativo fica somente dentro de:

`Configurações`

Ao selecionar:

`Voltar para tela de senha`

o aplicativo retorna para a tela de acesso.

Não existe botão de bloqueio no dashboard.

---

# 🗑️ Lixeira

A lixeira fica somente em:

`Configurações → Lixeira`

Ela recebe os itens excluídos de:

- Metas
- Tarefas
- Notas

Os itens permanecem na lixeira durante:

`50 dias`

Depois desse período são excluídos automaticamente.

A lixeira permite:

- Restaurar
- Apagar definitivamente

As roupas do sítio não utilizam a lixeira.

---

# 👁️ Modo Visualizador

O Modo Visualizador permite consultar os dados sem alterar os registros.

Enquanto ativo, ficam bloqueados:

- Adicionar
- Editar
- Excluir
- Fixar
- Concluir

A visualização e a pesquisa continuam disponíveis.

---

# 🎨 Temas

O projeto possui dois temas:

### Tema escuro

Fundo preto com elementos vermelhos.

### Tema claro

Fundo branco com elementos vermelhos.

---

# 🕐 Formato da hora

Disponível em:

- 24 horas
- 12 horas

A configuração é salva localmente.

---

# 📤 Compartilhamento

O projeto utiliza a Web Share API quando disponível.

Existem compartilhamentos para:

- Metas
- Tarefas
- Notas
- Progresso
- Compartilhamento geral

O compartilhamento geral reúne:

- Metas
- Tarefas
- Notas
- Roupas Sítio
- Cronômetro
- Progresso

---

# 💾 Armazenamento

Os dados são armazenados utilizando:

`localStorage`

Não existe banco de dados externo.

Os dados ficam vinculados ao navegador/dispositivo.

---

# 📡 Funcionamento offline

O projeto utiliza:

- Service Worker
- Cache API

Depois de carregado pelo menos uma vez online, o aplicativo pode continuar funcionando offline.

A estratégia utilizada é:

`Rede primeiro`

e:

`Cache como fallback`

Isso permite receber atualizações quando houver internet e continuar utilizando a versão armazenada quando estiver offline.

---

# 🗑️ Apagar geral

A função Apagar geral utiliza uma senha separada:

`Hg88`

Ela apaga todos os dados do aplicativo e restaura as configurações padrão.

Depois disso:

Senha de acesso:

`Hg99`

---

# 🧪 Tecnologias

- HTML
- CSS
- JavaScript
- LocalStorage
- Service Worker
- Cache API
- Web Share API
- GitHub Pages

---

# 🆓 Hospedagem

O projeto foi desenvolvido para funcionar gratuitamente através do GitHub Pages.

Não utiliza:

- Banco de dados
- Servidor próprio
- Hospedagem paga
- Serviço externo obrigatório

---

# 📌 Projeto

Projeto: #016

Nome: Secreto V3

Versão: V3

Plataforma: GitHub Pages

Tipo: Aplicação web pessoal

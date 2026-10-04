# Secreto V3

Projeto pessoal #016 desenvolvido como uma aplicação web estática para GitHub Pages.

## Sobre

O Secreto V3 é um espaço pessoal para organizar:

1. Notas
2. Metas
3. Tarefas
4. Roupas Sítio
5. Cronômetro
6. Progresso
7. Configurações

A aplicação funciona diretamente no navegador e não utiliza banco de dados ou servidor próprio.

---

## Acesso

A senha inicial é:

`Hg99`

A senha pode ser alterada dentro de:

**Configurações → Alterar senha de acesso**

A senha usada para confirmar o recurso "Apagar geral" é:

`Hg88`

Essa senha é fixa.

> A autenticação é apenas uma barreira do lado do navegador. Como o projeto é estático e o código fica disponível no GitHub Pages, isso não deve ser considerado um sistema de segurança real.

---

## Notas

As notas possuem:

- Título
- Conteúdo
- Data e hora de criação
- Fixar
- Editar
- Excluir
- Pesquisa pelo título
- Compartilhamento

A lista mostra somente o título.

Ao tocar no título, uma tela separada mostra:

- Título
- Conteúdo
- Data e hora de criação

---

## Metas

As metas possuem:

- Título
- Conteúdo
- Data e hora de criação
- Conclusão
- Fixar
- Editar
- Excluir
- Pesquisa pelo título
- Compartilhamento

Os itens excluídos são enviados para a Lixeira.

---

## Tarefas

As tarefas possuem:

- Título
- Conteúdo
- Data e hora de criação
- Conclusão
- Fixar
- Editar
- Excluir
- Pesquisa pelo título
- Compartilhamento

Os itens excluídos são enviados para a Lixeira.

---

## Roupas Sítio

A seção Roupas Sítio permite criar conjuntos de roupas.

Cada conjunto possui:

- Título
- Touca
- Camiseta
- Blusa
- Calça
- Extras
- Data e hora de criação

Exemplo:

**Roupas 1**

Camiseta:

`2 camisetas`

Extras:

`meias, luvas`

A lista principal mostra somente o título.

Ao tocar no título, uma tela separada apresenta todos os dados da roupa.

As roupas podem ser:

- Fixadas
- Editadas
- Excluídas

As roupas não utilizam a Lixeira.

---

## Lixeira

A Lixeira fica disponível somente em:

**Configurações → Lixeira**

Ela recebe somente:

- Metas
- Tarefas
- Notas

Os itens permanecem na Lixeira por até 50 dias.

Depois desse período, são apagados automaticamente.

Também é possível:

- Restaurar
- Excluir definitivamente

---

## Cronômetro

O cronômetro possui:

- Iniciar
- Pausar
- Zerar

O tempo fica salvo localmente.

---

## Progresso

A seção Progresso apresenta:

- Total de metas
- Metas concluídas
- Metas em andamento
- Percentual de conclusão
- Barra de progresso

O progresso é atualizado automaticamente conforme as metas são concluídas.

Também é possível compartilhar o progresso.

---

## Configurações

As configurações possuem:

- Voltar para tela de senha
- Apagar geral
- Modo Visualizador
- Tema
- Alterar senha
- Formato da hora
- Lixeira
- Compartilhar geral
- Sobre o projeto

O botão de bloqueio não fica no dashboard.

Ele existe somente dentro das Configurações.

---

## Recarregamento

O estado de login fica salvo no navegador.

Por isso, ao recarregar a página:

- o usuário permanece conectado;
- a aplicação continua aberta;
- a tela em que estava aberta pode ser restaurada.

Para voltar à tela de senha é necessário utilizar:

**Configurações → Voltar para tela de senha**

---

## Modo Visualizador

O Modo Visualizador permite visualizar os dados sem permitir alterações.

Quando ativado, recursos como:

- adicionar;
- editar;
- excluir;
- fixar;
- concluir;

ficam bloqueados.

A navegação, pesquisa e compartilhamento continuam disponíveis.

---

## Temas

Existem dois temas:

### Tema escuro

- Fundo preto
- Elementos escuros
- Destaques vermelhos

### Tema claro

- Fundo branco
- Elementos claros
- Destaques vermelhos

---

## Formato da hora

O projeto permite escolher entre:

- 24 horas
- 12 horas

---

## Armazenamento

Os dados são armazenados utilizando:

`localStorage`

Isso significa que os dados ficam no navegador e no dispositivo em que foram criados.

Não existe sincronização automática entre aparelhos.

---

## Funcionamento offline

O projeto utiliza:

- Service Worker
- Cache API

O Service Worker utiliza uma estratégia de rede primeiro e cache como alternativa.

Assim, quando os arquivos já estiverem armazenados no cache, o projeto pode continuar funcionando sem conexão.

---

## Compartilhamento

O projeto utiliza a Web Share API quando disponível.

O compartilhamento existe em:

- Metas
- Tarefas
- Notas
- Progresso
- Compartilhar geral

O dashboard não possui botão de compartilhamento.

---

## Tecnologias

- HTML
- CSS
- JavaScript
- localStorage
- Service Worker
- Cache API
- Web Share API
- GitHub Pages

---

## Banco de dados

Não utiliza banco de dados.

---

## Servidor próprio

Não utiliza servidor próprio.

---

## Projeto

**Projeto #016 — Secreto V3**

Desenvolvido como laboratório pessoal de tecnologias web utilizando GitHub Pages.

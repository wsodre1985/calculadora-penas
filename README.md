# 📋 Calculadora de Penas V2.1 (LEP)

Calculadora web moderna para cálculo de penas com suporte a frações, dias-multa, remição, dosimetria (Pena-Base), múltiplos períodos de prisão e geração automática de redação para peças processuais. 

## 🎯 Novidades da Versão 2.1
- **Design Moderno e Abas**: Nova interface com menu lateral (Painel LEP) para navegação ágil.
- **Aba Pena-Base (1ª Fase)**: Cálculo automático de 1/8 do intervalo entre pena mínima e máxima (Art. 59 do CP) e multiplicação por circunstâncias desfavoráveis.
- **Múltiplos Períodos de Prisão**: Agora é possível adicionar vários períodos (Data Inicial → Data Final) e somar todo o tempo de cárcere acumulado.
- **Modo Escuro / Claro**: Suporte nativo a *Dark Mode* para maior conforto visual.
- **Teclado Virtual e Acumulador**: Teclado embutido na interface e funções avançadas de acúmulo (+, −, AC, =) diretamente na aba principal.
- **Separação de Código**: Organização aprimorada em arquivos separados (`index.html`, `style.css`, `app.js`).

## 📋 Funcionalidades Detalhadas

### 🧮 Calculadora de Execução (Principal)
- **Inserção de Penas & Teclado**: Teclado rápido para Anos, Meses e Dias.
- **Acumulador (AC)**: Some e subtraia penas de múltiplos processos facilmente antes de aplicar as frações.
- **Frações Legais**: 1/6, 1/5, 1/4, 1/3, 1/2, 2/3 (com suas respectivas porcentagens da LEP).
- **Frações Customizáveis**: Botão **+** permite adicionar botões fixos de fração/percentual.
- **Dias-Multa Base**: Cálculo proporcional em cima das frações.

### ⚖️ Pena-Base (1ª Fase)
- **Parâmetros do Delito**: Inserção de pena mínima, máxima e dias-multa.
- **Circunstâncias Judiciais (Art. 59)**: Escolha de 0 a 8 circunstâncias desfavoráveis.
- **Cálculo Automático**: Descobre o intervalo, divide por 8 e multiplica pelas circunstâncias.
- **Integração**: Envia o resultado com 1 clique direto para a Calculadora Principal.

### 📅 Períodos e Execução
- **Soma de Períodos de Prisão**: Crie listas dinâmicas de intervalos (preso → solto).
- **Data de Início da Prisão**: Define o marco zero da execução.
- **Dias Remidos**: Deduz dias trabalhados ou estudados (antes ou depois da fração aplicada).
- **Interrupção**: Campos diretos para deduzir Anos, Meses e Dias.

### 📝 Resultados e Redação
- **Resultados de Término & Progressão**:
  - Término Previsto (Data exata e Tempo Restante).
  - Data de Atingimento da Fração Escolhida (Atingido ✔, HOJE, ou Pendente).
- **Redação por Extenso Automática**:
  - Ex: *01 (um) ano, 11 (onze) meses e 10 (dez) dias de reclusão e 15 (quinze) dias-multa*.
  - Basta um clique para copiar e colar diretamente nas peças processuais.

---

## 🚀 Como Usar

### Acesso
- Abra o arquivo `index.html` em qualquer navegador moderno.
- O sistema é **offline-first** (não requer conexão com a internet) e todo cálculo ocorre na sua máquina.

### Operações Básicas
1. Selecione a aba desejada no **Painel LEP** à esquerda.
2. Na **Calculadora**, digite a pena pelo teclado na tela.
3. Clique em **+** ou **−** para ir acumulando condenações.
4. Escolha uma **Fração** da barra lateral para aplicar a progressão de regime.
5. Em **Períodos**, some o tempo que o réu já passou preso e exporte para os parâmetros de execução.

### Personalização
- **Tema Escuro**: Clique em "Tema Claro/Escuro" no rodapé da barra lateral.
- **Frações Novas**: Clique no botão **+** na seção de frações e insira o percentual específico.

---

## 🖥️ Compatibilidade
- **Navegadores**: Chrome, Firefox, Safari, Edge (versões recentes).
- **Dispositivos**: Desktop, Notebook, Tablet. (Layout responsivo com grades inteligentes).
- **Sistemas**: Windows, macOS, Linux.

## 📐 Convenção Penal
O sistema utiliza os critérios pacificamente consolidados pelos Tribunais Superiores:
- **1 ano = 360 dias**
- **1 mês = 30 dias**

Isso garante cálculos exatos entre conversões (Anos/Meses/Dias ↔ Dias Totais).

---

## 🔧 Estrutura Técnica

### Stack
- **Frontend**: HTML5, CSS3 Moderno (CSS Variables, Flexbox, CSS Grid), Vanilla JavaScript.
- **Zero Dependências**: Sem React, Vue ou bibliotecas externas. Totalmente nativo.
- **Responsividade**: Media queries adaptam a exibição (escondendo a barra lateral em telas minúsculas e rearranjando os cartões de grid).

### Organização dos Arquivos
```text
Calculadora/
├── index.html   (Estrutura e layout, UI semântica, ícones SVG inline)
├── style.css    (Design System, tipografia, esquema de cores Claro/Escuro)
└── app.js       (Lógica da calculadora, manipulação de datas e DOM)
```

## 🎨 Design
A interface utiliza tons sofisticados baseados no tema *Slate/Navy*:
- **Azul (Brand/Accent)**: Ações primárias e destaques (`#2563eb` a `#1d4ed8`).
- **Verde/Vermelho**: Feedback visual em botões de operações matemáticas.
- **Ambar/Laranja**: Atenção em circunstâncias desfavoráveis e multas.
- **Superfícies (Dark Mode)**: Baseada em tons noturnos profundos (`#0f172a`, `#1e293b`).

## 📝 Notas Jurídicas
- O sistema obedece estritamente às diretrizes de contagem da **Lei de Execução Penal (LEP)** e ao Código Penal Brasileiro.
- O cálculo da pena base considera as circunstâncias inominadas e estabelece o peso usual de **1/8 do intervalo sancionatório**.

---

📄 **Licença**  
MIT License - Livre para usar, modificar e distribuir.

👤 **Autor**  
**Wesley Sodré** - Calculadora de Penas V2.1. Desenvolvida e refinada como ferramenta de apoio à atividade jurídica e de execução penal.

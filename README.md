📋 Calculadora de Penas v2026
Calculadora web moderna para cálculo de penas penais com suporte a frações, dias-multa, remição e geração automática de redação para peças processuais.
🎯 Funcionalidades

✅ Cálculo de Pena Base — Anos, meses e dias
✅ Dias-Multa Integrado — Cálculo automático com a pena
✅ Frações e Progressões — 1/6, 1/5, 1/4, 1/3, 1/2, 2/3 e customizáveis
✅ Critérios Vedados — Identifica progressões com restrição a livramento condicional
✅ Remição — Cálculo com opção de antes/depois da fração
✅ Interrupção — Anos, meses e dias de interrupção
✅ Período entre Datas — Calcula dias, meses e anos entre datas
✅ Início e Término — Define data de início e calcula automaticamente o término
✅ Redação Automática — Gera texto formatado para peças (01 ano, 11 meses e 10 dias...)
✅ Grade de Resultados — Mostra todas as frações com datas
✅ Cálculo com Datas — Indica se fração foi atingida, é hoje ou está pendente
✅ UI Responsiva — Funciona em desktop, tablet e celular
✅ Design Moderno — Interface limpa com cores intuitivas

📋 Funcionalidades Detalhadas
Pena Base
Entrada de pena inicial em anos, meses e dias. Sistema permite operações de soma (adição de agravantes) e subtração (atenuantes).
Dias-Multa
Campo separado para entrada de dias-multa base. O sistema calcula automaticamente a multa final proporcionalmente às operações realizadas.
Progressões e Frações

Frações Clássicas: 1/6, 1/5, 1/4, 1/3, 1/2, 2/3
Percentuais Legais: 16%, 20%, 25%, 30%, 33%, 40%, 50%, 55%, 60%, 67%, 70%, 75%, 80%, 85%
Customizáveis: Botão ⚙ permite adicionar qualquer fração ou percentual
Vedados: Alguns critérios são marcados com ⛔ (vedado livramento condicional)

Remição
Entrada de dias remidos com opção de:

Antes: Retira remidos antes de calcular a fração
Depois: Retira remidos depois de calcular a fração

Interrupção
Campos para anos, meses e dias de interrupção da pena. Afeta o cálculo de efetividade.
Período entre Datas

Calcula dias, meses e anos entre duas datas
Botões para copiar resultado para pena base ou interrupção
Distinção entre dias corridos e dias no sistema penal

Grade de Resultados
Exibe todas as 6 frações clássicas com:

Tempo em formato AMD (anos, meses, dias)
Data de atingimento (se data inicial informada)
Status (Atingido ✔, HOJE, Pendente)
Identificação de critérios vedados ⛔

Redação Automática
Gera texto formatado para inserção em peças processuais:
01 (um) ano, 11 (onze) meses e 10 (dez) dias de reclusão e 15 (quinze) dias-multa
🚀 Como Usar
Acesso

Abra calculadora_penas.html em qualquer navegador moderno
Não requer instalação ou conexão com internet (offline-first)
Todos os cálculos ocorrem no navegador local

Entrada de Pena Base

Clique no campo de Anos, Meses ou Dias
Use o teclado virtual ou digite diretamente
Navegue entre campos clicando neles

Operações de Acumulação

Digite pena → Clique + (soma) ou − (subtração)
Digite próxima pena ou clique em uma fração
Clique = para confirmar
Resultado aparece automaticamente

Usar Frações

Digite pena base
Clique em + ou −
Clique diretamente em uma fração (1/6, 1/5, etc)
Resultado recalcula automaticamente

Adicionar Fração Customizada

Clique em ⚙ (engrenagem)
Informe percentual (ex: 33,33) OU fração (ex: 1/3)
Opcionalmente defina rótulo
Clique OK
Novo botão aparecerá na grade

Calcular Período entre Datas

Informe "Data inicial" e "Data final"
Clique Calcular
Resultado mostra dias, meses, anos
Clique para copiar para pena ou interrupção

Usar Remição

Informe "Remidos (dias)"
Escolha opção (antes/depois)
Resultados recalculam automaticamente

Usar Interrupção

Informe anos, meses, dias de interrupção
Resultados ajustam automaticamente

Gerar Redação

Configure pena, dias-multa e datas
Redação aparece automaticamente
Clique para copiar para clipboard
Cole na peça processual

🖥️ Compatibilidade

Navegadores: Chrome, Firefox, Safari, Edge (versões recentes)
Dispositivos: Desktop, Tablet, Celular
Sistemas: Windows, macOS, Linux, iOS, Android
Offline: Funciona completamente offline (sem internet)

📐 Convenção Penal
O sistema usa a convenção padrão brasileira:

1 ano = 360 dias
1 mês = 30 dias

Isso é relevante para conversões entre formatos.
🔧 Estrutura Técnica
Stack

Frontend: HTML5 + CSS3 + Vanilla JavaScript
Dependências: Nenhuma (zero dependências externas)
Tamanho: Arquivo único (~35 KB)
Performance: Cálculos instantâneos

Características de Código

Sem frameworks (puro JavaScript)
Sem bibliotecas externas
Fonts importados do Google Fonts (carregamento opcional)
Interface reativa (atualiza em tempo real)
Código bem comentado e estruturado

🎨 Design
Paleta de Cores

Azul (Accent): #1a56db — Ações principais
Verde: #166534 — Soma, aprovação
Vermelho: #991b1b — Subtração, atenção
Laranja: #92400e — Dias-multa, destacado
Cinzento: Fundo, texto muted

Responsividade

Breakpoint principal: 640px
Layout 2 colunas (desktop) → 1 coluna (mobile)
Touch-friendly (botões de 48-52px)
Sem scroll horizontal desnecessário

📝 Notas Jurídicas

Sistema segue Lei de Execução Penal (LEP)
Cálculos baseados em jurisprudência consolidada
Vedações conforme entendimento STJ/STF
Redação em português jurídico formal

⚙️ Desenvolvimento
Estrutura do Arquivo
calculadora_penas.html
├── <style>     (CSS inline ~350 linhas)
├── <body>      (HTML estrutura)
└── <script>    (JavaScript lógica ~430 linhas)
Principais Funções

toDias() / toAMD() — Conversão entre formatos
recalc() — Recalcula todos os resultados
opAcum() / opIgual() — Operações de acumulação
calcPeriodo() — Período entre datas
copiarRedacao() — Cópia para clipboard
fmtRedacao() — Formatação de texto

📄 Licença
MIT License - Livre para usar, modificar e distribuir.
👤 Autor
Calculadora de Penas - Desenvolvida para juízes e profissionais de Direito Penal.

Versão: 2026
Última atualização: Abril 2026
Status: Estável

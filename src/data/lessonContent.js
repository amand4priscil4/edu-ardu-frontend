export const lessonContent = {
    // Lição 1: Pensamento Computacional
    1: [
      {
        type: 'intro',
        stepLabel: 'Introdução',
        title: 'Pensamento Computacional',
        subtitle: 'Aprenda a pensar como um programador',
        description: 'O pensamento computacional é uma habilidade fundamental que nos ensina a resolver problemas de forma estruturada e lógica, usando conceitos da ciência da computação.'
      },
      {
        type: 'content',
        stepLabel: 'Conceitos',
        title: 'Os 4 Pilares do Pensamento Computacional',
        sections: [
          {
            subtitle: '1. Decomposição',
            content: [
              'A decomposição é o processo de quebrar um problema complexo em partes menores e mais gerenciáveis.',
              'Em vez de tentar resolver tudo de uma vez, dividimos o problema em subproblemas que são mais fáceis de entender e resolver.',
              'Por exemplo, se queremos fazer um robô andar, podemos decompor em: ligar motores, definir direção, controlar velocidade, parar motores.'
            ],
            examples: [
              'Fazer um sanduíche: pegar pão, escolher recheio, montar, cortar',
              'Organizar uma festa: definir data, fazer lista de convidados, escolher local, comprar comida',
              'Programar um robô: definir sensores, programar movimentos, testar funcionamento'
            ]
          },
          {
            subtitle: '2. Reconhecimento de Padrões',
            content: [
              'Padrões são características, regularidades ou repetições que podemos identificar em problemas ou dados.',
              'Reconhecer padrões nos ajuda a prever comportamentos e criar soluções mais eficientes.',
              'Na robótica, identificamos padrões nos movimentos, nos dados dos sensores e nas respostas do ambiente.'
            ],
            examples: [
              'Semáforos seguem padrões: verde, amarelo, vermelho',
              'Dias da semana se repetem em sequência',
              'Robôs seguem padrões de movimento: frente, direita, frente, direita'
            ]
          }
        ]
      },
      {
        type: 'content',
        stepLabel: 'Mais Conceitos',
        title: 'Abstração e Algoritmos',
        sections: [
          {
            subtitle: '3. Abstração',
            content: [
              'Abstração é o processo de focar apenas nos aspectos mais importantes de um problema, ignorando detalhes desnecessários.',
              'Nos permite criar modelos simplificados que são mais fáceis de entender e trabalhar.',
              'É como usar um mapa: ele não mostra todos os detalhes de uma cidade, apenas o que é importante para navegação.'
            ],
            examples: [
              'Mapa do metrô: mostra apenas estações e conexões',
              'Ícones no celular: representam apps complexos de forma simples',
              'Comandos para robô: "mover para frente" abstrai controle de motores'
            ]
          },
          {
            subtitle: '4. Algoritmos',
            content: [
              'Um algoritmo é uma sequência de passos bem definidos para resolver um problema.',
              'Deve ser claro, preciso e ter um início e fim definidos.',
              'É como uma receita de culinária ou manual de instruções, mas para computadores.'
            ],
            examples: [
              'Receita de bolo: ingredientes, misturar, assar, resfriar',
              'Escovação de dentes: pasta, escovar, enxaguar',
              'Algoritmo para robô evitar obstáculos: ler sensor, se obstáculo, virar, senão, seguir'
            ]
          }
        ]
      },
      {
        type: 'interactive',
        stepLabel: 'Prática',
        title: 'Aplicando o Pensamento Computacional',
        description: 'Vamos praticar os conceitos aprendidos com exercícios interativos. Clique em cada atividade para explorar:',
        activities: [
          {
            title: 'Decomposição: Robô Limpeza',
            description: 'Decomponha a tarefa de um robô aspirador limpar uma sala em etapas menores.'
          },
          {
            title: 'Padrões: Semáforo Inteligente',
            description: 'Identifique padrões no comportamento de um semáforo inteligente.'
          },
          {
            title: 'Abstração: Controle Robô',
            description: 'Crie uma interface abstrata para controlar um robô complexo.'
          },
          {
            title: 'Algoritmo: Labirinto',
            description: 'Desenvolva um algoritmo para um robô sair de um labirinto.'
          }
        ]
      },
      {
        type: 'quiz',
        stepLabel: 'Avaliação',
        title: 'Quiz: Pensamento Computacional',
        description: 'Teste seus conhecimentos sobre os conceitos fundamentais do pensamento computacional:',
        questions: [
          {
            id: 1,
            question: 'Qual pilar do pensamento computacional envolve quebrar um problema em partes menores?',
            options: ['Abstração', 'Decomposição', 'Padrões', 'Algoritmos'],
            correctAnswer: 'Decomposição',
            explanation: 'A decomposição é exatamente o processo de dividir problemas complexos em subproblemas menores e mais gerenciáveis.'
          },
          {
            id: 2,
            question: 'O que é um algoritmo?',
            options: [
              'Um tipo de robô',
              'Uma sequência de passos para resolver um problema',
              'Um padrão repetitivo',
              'Um processo de simplificação'
            ],
            correctAnswer: 'Uma sequência de passos para resolver um problema',
            explanation: 'Um algoritmo é uma série de instruções bem definidas que, quando seguidas, resolvem um problema específico.'
          },
          {
            id: 3,
            question: 'Quando criamos um mapa do metrô que mostra apenas estações e conexões, estamos usando qual conceito?',
            options: ['Decomposição', 'Padrões', 'Abstração', 'Algoritmos'],
            correctAnswer: 'Abstração',
            explanation: 'A abstração nos permite focar apenas nos aspectos essenciais, removendo detalhes desnecessários como no mapa do metrô.'
          }
        ]
      }
    ],
  
    // Lição 2: Robótica Básica
    2: [
      {
        type: 'intro',
        stepLabel: 'Introdução',
        title: 'Robótica Básica',
        subtitle: 'Fundamentos da robótica educacional',
        description: 'Explore o fascinante mundo da robótica! Aprenda sobre os diferentes tipos de robôs, como eles funcionam e como sensores e atuadores trabalham juntos.'
      },
      {
        type: 'content',
        stepLabel: 'O que são Robôs',
        title: 'Introdução à Robótica',
        sections: [
          {
            subtitle: 'O que é um Robô?',
            content: [
              'Um robô é uma máquina programável capaz de executar tarefas automaticamente.',
              'Robôs podem sensar o ambiente, processar informações e agir no mundo físico.',
              'Eles combinam hardware (partes físicas) e software (programação) para funcionar.',
              'A robótica une várias áreas: engenharia, programação, matemática e física.'
            ],
            examples: [
              'Robô aspirador que limpa a casa sozinho',
              'Braço robótico em fábricas de carros',
              'Robôs exploradores em Marte',
              'Chatbots que respondem perguntas'
            ]
          },
          {
            subtitle: 'História da Robótica',
            content: [
              'A palavra "robô" vem da palavra tcheca "robota" que significa trabalho forçado.',
              'Os primeiros robôs industriais surgiram na década de 1960.',
              'Hoje temos robôs em hospitais, casas, espaço e até no fundo do oceano.',
              'A robótica educacional ajuda estudantes a aprender programação e engenharia.'
            ]
          }
        ]
      },
      {
        type: 'content',
        stepLabel: 'Tipos de Robôs',
        title: 'Classificação dos Robôs',
        sections: [
          {
            subtitle: 'Por Aplicação',
            content: [
              'Robôs Industriais: usados em fábricas para montagem, soldagem e pintura.',
              'Robôs de Serviço: ajudam pessoas em casa, hospitais e escritórios.',
              'Robôs Militares: usados para reconhecimento e operações perigosas.',
              'Robôs Educacionais: feitos para ensinar programação e robótica.'
            ],
            examples: [
              'Industrial: Braços robóticos da Tesla',
              'Serviço: Roomba, robôs cirurgiões',
              'Militar: Drones de reconhecimento',
              'Educacional: LEGO Mindstorms, Arduino'
            ]
          },
          {
            subtitle: 'Por Mobilidade',
            content: [
              'Robôs Estacionários: ficam fixos em um local, como braços robóticos.',
              'Robôs Móveis: podem se deslocar pelo ambiente.',
              'Robôs com Rodas: se movem usando rodas, são simples e eficientes.',
              'Robôs com Pernas: podem andar em terrenos irregulares.',
              'Robôs Voadores: drones e robôs que usam hélices ou asas.'
            ]
          }
        ]
      },
      {
        type: 'content',
        stepLabel: 'Sensores e Atuadores',
        title: 'Componentes Fundamentais',
        sections: [
          {
            subtitle: 'Sensores - Os "Sentidos" do Robô',
            content: [
              'Sensores permitem que robôs percebam o ambiente ao redor.',
              'Eles convertem fenômenos físicos (luz, som, movimento) em sinais elétricos.',
              'São como os nossos sentidos: visão, audição, tato.',
              'Diferentes sensores captam diferentes tipos de informação.'
            ],
            examples: [
              'Sensor ultrassônico: mede distância (como morcegos)',
              'Sensor de luz: detecta claridade e escuridão',
              'Sensor de toque: detecta quando algo encosta',
              'Câmera: captura imagens do ambiente'
            ]
          },
          {
            subtitle: 'Atuadores - Os "Músculos" do Robô',
            content: [
              'Atuadores são componentes que fazem o robô se mover ou agir.',
              'Eles convertem energia elétrica em movimento físico.',
              'São como nossos músculos que nos permitem nos mover.',
              'Trabalham junto com sensores para criar comportamentos inteligentes.'
            ],
            examples: [
              'Motores: fazem rodas girarem para movimento',
              'Servomotores: posicionamento preciso de braços',
              'LEDs: produzem luz para sinalização',
              'Alto-falantes: produzem sons e alertas'
            ]
          }
        ]
      },
      {
        type: 'interactive',
        stepLabel: 'Exploração',
        title: 'Explorando Robôs na Prática',
        description: 'Descubra como diferentes robôs usam sensores e atuadores para realizar suas tarefas:',
        activities: [
          {
            title: 'Robô Seguidor de Linha',
            description: 'Veja como sensores de cor detectam linhas e motores ajustam direção.'
          },
          {
            title: 'Robô Evita Obstáculos',
            description: 'Explore como sensores ultrassônicos detectam objetos e robô desvia.'
          },
          {
            title: 'Robô Pet',
            description: 'Descubra como sensores de toque e som criam interações divertidas.'
          },
          {
            title: 'Braço Robótico',
            description: 'Aprenda como servomotores permitem movimentos precisos.'
          }
        ]
      },
      {
        type: 'quiz',
        stepLabel: 'Avaliação',
        title: 'Quiz: Robótica Básica',
        description: 'Teste seu conhecimento sobre robótica, sensores e atuadores:',
        questions: [
          {
            id: 1,
            question: 'O que são sensores em um robô?',
            options: [
              'Componentes que fazem o robô se mover',
              'Partes que permitem ao robô perceber o ambiente',
              'O cérebro do robô',
              'A fonte de energia do robô'
            ],
            correctAnswer: 'Partes que permitem ao robô perceber o ambiente',
            explanation: 'Sensores são como os "sentidos" do robô, permitindo que ele detecte luz, som, distância, toque e outras informações do ambiente.'
          },
          {
            id: 2,
            question: 'Qual a principal função dos atuadores?',
            options: [
              'Detectar obstáculos',
              'Processar informações',
              'Converter energia elétrica em movimento',
              'Armazenar dados'
            ],
            correctAnswer: 'Converter energia elétrica em movimento',
            explanation: 'Atuadores são os "músculos" do robô, convertendo sinais elétricos em movimentos físicos como girar rodas ou mover braços.'
          },
          {
            id: 3,
            question: 'Um robô aspirador que limpa casa sozinho é exemplo de qual tipo?',
            options: [
              'Robô Industrial',
              'Robô Militar',
              'Robô de Serviço',
              'Robô Espacial'
            ],
            correctAnswer: 'Robô de Serviço',
            explanation: 'Robôs de serviço são projetados para ajudar pessoas em tarefas domésticas, escritórios e outros ambientes do dia a dia.'
          }
        ]
      }
    ],
  
    // Lição 3: Introdução ao Arduino
    3: [
      {
        type: 'intro',
        stepLabel: 'Introdução',
        title: 'Introdução ao Arduino',
        subtitle: 'Primeiros passos com Arduino',
        description: 'Descubra o Arduino, uma plataforma que torna a eletrônica e programação acessíveis para todos. Aprenda sobre a placa, programação e seus primeiros projetos!'
      },
      {
        type: 'content',
        stepLabel: 'O que é Arduino',
        title: 'Conhecendo o Arduino',
        sections: [
          {
            subtitle: 'O que é Arduino?',
            content: [
              'Arduino é uma plataforma de prototipagem eletrônica open-source.',
              'Consiste em uma placa programável e um ambiente de desenvolvimento (IDE).',
              'Foi criado para tornar a eletrônica acessível para artistas, designers e hobbyistas.',
              'É amplamente usado em projetos de robótica, IoT e automação.'
            ],
            examples: [
              'Projetos de casa inteligente',
              'Robôs educacionais',
              'Estações meteorológicas',
              'Sistemas de irrigação automática'
            ]
          },
          {
            subtitle: 'Por que Arduino é Popular?',
            content: [
              'Fácil de aprender: linguagem de programação simplificada.',
              'Baixo custo: placas acessíveis para estudantes.',
              'Comunidade grande: muitos tutoriais e projetos compartilhados.',
              'Flexível: pode ser usado em diversos tipos de projetos.',
              'Open Source: hardware e software são abertos e gratuitos.'
            ]
          }
        ]
      },
      {
        type: 'content',
        stepLabel: 'Componentes',
        title: 'Anatomia da Placa Arduino',
        sections: [
          {
            subtitle: 'Principais Componentes',
            content: [
              'Microcontrolador: o "cérebro" que executa o programa.',
              'Pinos Digitais: enviam sinais ON/OFF (5V ou 0V).',
              'Pinos Analógicos: leem valores variáveis (0 a 5V).',
              'Pinos PWM: simulam sinais analógicos usando pulsos.',
              'Alimentação: conectores para bateria ou fonte externa.',
              'Conector USB: para programação e alimentação.'
            ],
            examples: [
              'Microcontrolador ATmega328P no Arduino Uno',
              'Pinos digitais 0-13 para LEDs e botões',
              'Pinos analógicos A0-A5 para sensores',
              'Pinos PWM (~) para controle de motores'
            ]
          },
          {
            subtitle: 'Tipos de Arduino',
            content: [
              'Arduino Uno: versão mais popular, ideal para iniciantes.',
              'Arduino Nano: versão compacta do Uno.',
              'Arduino Mega: mais pinos para projetos complexos.',
              'Arduino Micro: muito pequeno, para projetos portáteis.',
              'ESP32: inclui WiFi e Bluetooth para IoT.'
            ]
          }
        ]
      },
      {
        type: 'content',
        stepLabel: 'Programação',
        title: 'Programando o Arduino',
        sections: [
          {
            subtitle: 'Arduino IDE',
            content: [
              'IDE (Integrated Development Environment) é onde escrevemos o código.',
              'Interface simples com editor de texto e botões de upload.',
              'Linguagem baseada em C/C++ mas simplificada.',
              'Bibliotecas prontas facilitam o uso de sensores e componentes.',
              'Monitor Serial permite ver dados e depurar programas.'
            ]
          },
          {
            subtitle: 'Estrutura Básica do Código',
            content: [
              'setup(): executado uma vez quando Arduino liga.',
              'loop(): executado repetidamente enquanto Arduino estiver ligado.',
              'Variáveis: armazenam valores como números e textos.',
              'Funções: blocos de código que fazem tarefas específicas.',
              'Comentários: explicações no código que ajudam a entender.'
            ],
            examples: [
              'setup() - configurar pinos como entrada ou saída',
              'loop() - ler sensores, controlar LEDs, mover motores',
              'int led = 13; - variável para guardar número do pino',
              'digitalWrite(led, HIGH); - ligar LED'
            ]
          }
        ]
      },
      {
        type: 'interactive',
        stepLabel: 'Projetos',
        title: 'Seus Primeiros Projetos Arduino',
        description: 'Explore projetos básicos que você pode fazer com Arduino:',
        activities: [
          {
            title: 'LED Piscante',
            description: 'O "Hello World" do Arduino - fazer um LED piscar.'
          },
          {
            title: 'Sensor de Luz',
            description: 'LED que acende automaticamente no escuro.'
          },
          {
            title: 'Botão Interativo',
            description: 'LED que liga e desliga com botão.'
          },
          {
            title: 'Robô Básico',
            description: 'Robô que se move e evita obstáculos.'
          }
        ]
      },
      {
        type: 'quiz',
        stepLabel: 'Avaliação',
        title: 'Quiz: Arduino',
        description: 'Teste seus conhecimentos sobre Arduino e programação:',
        questions: [
          {
            id: 1,
            question: 'Qual função é executada repetidamente no Arduino?',
            options: ['setup()', 'loop()', 'main()', 'start()'],
            correctAnswer: 'loop()',
            explanation: 'A função loop() é executada continuamente após a função setup(), criando o comportamento repetitivo do Arduino.'
          },
          {
            id: 2,
            question: 'O que significa "open source" no contexto do Arduino?',
            options: [
              'É muito caro',
              'Hardware e software são livres e abertos',
              'Só funciona com internet',
              'É difícil de usar'
            ],
            correctAnswer: 'Hardware e software são livres e abertos',
            explanation: 'Open source significa que tanto o design da placa quanto o software são livres, permitindo que qualquer pessoa use, modifique e compartilhe.'
          },
          {
            id: 3,
            question: 'Para que servem os pinos PWM no Arduino?',
            options: [
              'Apenas para LEDs',
              'Simular sinais analógicos usando pulsos',
              'Conectar à internet',
              'Armazenar dados'
            ],
            correctAnswer: 'Simular sinais analógicos usando pulsos',
            explanation: 'PWM (Pulse Width Modulation) permite simular sinais analógicos variáveis usando pulsos digitais, útil para controlar velocidade de motores ou brilho de LEDs.'
          }
        ]
      }
    ]
  };
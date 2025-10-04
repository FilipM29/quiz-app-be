import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create a demo user for quiz authorship
  const demoUser = await prisma.user.upsert({
    where: { firebaseId: 'demo-quiz-author' },
    update: {},
    create: {
      email: 'demo@quizapp.com',
      firstName: 'Quiz',
      lastName: 'Master',
      firebaseId: 'demo-quiz-author'
    }
  });

  console.log('👤 Demo user created/updated');

  // Quiz data for all 16 categories
  const quizData = [
    {
      category: 'SPORT',
      title: 'Ultimate Sports Challenge',
      description: 'Test your knowledge of various sports including football, basketball, and the Olympics.',
      quizType: 'SLIDES',
      rounds: [
        {
          title: 'Football Fundamentals',
          order: 1,
          questions: [
            {
              type: 'OPTIONS',
              value: 10,
              text: 'Which country won the 2022 FIFA World Cup?',
              answer: 'Argentina',
              acceptableAnswers: ['Argentina'],
              options: ['Brazil', 'Argentina', 'France', 'Spain']
            },
            {
              type: 'EXACT',
              value: 10,
              text: 'How many players are on a football team on the field at one time?',
              answer: '11',
              acceptableAnswers: ['11', 'eleven']
            },
            {
              type: 'INTERVAL',
              value: 15,
              text: 'In what year was the first FIFA World Cup held? (±2 years)',
              answer: '1930',
              acceptableAnswers: ['1930'],
              range: 2
            }
          ]
        },
        {
          title: 'Basketball & Olympics',
          order: 2,
          questions: [
            {
              type: 'OPTIONS',
              value: 15,
              text: 'Which basketball player is known as "The King"?',
              answer: 'LeBron James',
              acceptableAnswers: ['LeBron James'],
              options: ['Michael Jordan', 'LeBron James', 'Kobe Bryant', 'Stephen Curry']
            },
            {
              type: 'EXACT',
              value: 20,
              text: 'How often are the Summer Olympics held?',
              answer: 'Every 4 years',
              acceptableAnswers: ['Every 4 years', '4 years', 'every four years']
            }
          ]
        }
      ]
    },
    {
      category: 'GEOGRAPHY',
      title: 'World Explorer Quiz',
      description: 'Journey around the globe with questions about countries, capitals, and famous landmarks.',
      quizType: 'JEOPARDY',
      rounds: [
        {
          title: 'Capitals & Countries',
          order: 1,
          questions: [
            {
              type: 'OPTIONS',
              value: 10,
              text: 'What is the capital of Australia?',
              answer: 'Canberra',
              acceptableAnswers: ['Canberra'],
              options: ['Sydney', 'Melbourne', 'Canberra', 'Perth']
            },
            {
              type: 'EXACT',
              value: 10,
              text: 'Which country has the most time zones?',
              answer: 'France',
              acceptableAnswers: ['France']
            },
            {
              type: 'OPTIONS',
              value: 15,
              text: 'Which river is the longest in the world?',
              answer: 'Nile River',
              acceptableAnswers: ['Nile River', 'Nile'],
              options: ['Amazon River', 'Nile River', 'Mississippi River', 'Yangtze River']
            }
          ]
        },
        {
          title: 'Landmarks & Natural Wonders',
          order: 2,
          questions: [
            {
              type: 'EXACT',
              value: 15,
              text: 'In which country would you find Machu Picchu?',
              answer: 'Peru',
              acceptableAnswers: ['Peru']
            },
            {
              type: 'INTERVAL',
              value: 20,
              text: 'How many countries are there in Africa? (±3)',
              answer: '54',
              acceptableAnswers: ['54'],
              range: 3
            }
          ]
        }
      ]
    },
    {
      category: 'SCIENCE',
      title: 'Science Fundamentals',
      description: 'Explore the wonders of physics, chemistry, and biology in this comprehensive science quiz.',
      quizType: 'SLIDES',
      rounds: [
        {
          title: 'Physics & Chemistry',
          order: 1,
          questions: [
            {
              type: 'EXACT',
              value: 10,
              text: 'What is the chemical symbol for gold?',
              answer: 'Au',
              acceptableAnswers: ['Au']
            },
            {
              type: 'OPTIONS',
              value: 10,
              text: 'What is the speed of light in a vacuum?',
              answer: '299,792,458 m/s',
              acceptableAnswers: ['299,792,458 m/s'],
              options: ['299,792,458 m/s', '300,000,000 m/s', '186,282 m/s', '150,000,000 m/s']
            },
            {
              type: 'EXACT',
              value: 15,
              text: 'What gas makes up approximately 78% of Earth\'s atmosphere?',
              answer: 'Nitrogen',
              acceptableAnswers: ['Nitrogen', 'N2']
            }
          ]
        },
        {
          title: 'Biology & Nature',
          order: 2,
          questions: [
            {
              type: 'OPTIONS',
              value: 15,
              text: 'What is the powerhouse of the cell?',
              answer: 'Mitochondria',
              acceptableAnswers: ['Mitochondria'],
              options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Endoplasmic Reticulum']
            },
            {
              type: 'INTERVAL',
              value: 20,
              text: 'How many bones are in an adult human body? (±5)',
              answer: '206',
              acceptableAnswers: ['206'],
              range: 5
            }
          ]
        }
      ]
    },
    {
      category: 'HISTORY',
      title: 'Historical Milestones',
      description: 'Travel through time exploring ancient civilizations, world wars, and pivotal historical moments.',
      quizType: 'JEOPARDY',
      rounds: [
        {
          title: 'Ancient Civilizations',
          order: 1,
          questions: [
            {
              type: 'OPTIONS',
              value: 10,
              text: 'Which ancient wonder of the world was located in Alexandria?',
              answer: 'Lighthouse of Alexandria',
              acceptableAnswers: ['Lighthouse of Alexandria', 'Pharos of Alexandria'],
              options: ['Hanging Gardens', 'Lighthouse of Alexandria', 'Colossus of Rhodes', 'Statue of Zeus']
            },
            {
              type: 'EXACT',
              value: 10,
              text: 'Who was the first emperor of Rome?',
              answer: 'Augustus',
              acceptableAnswers: ['Augustus', 'Augustus Caesar', 'Octavian']
            }
          ]
        },
        {
          title: 'Modern History',
          order: 2,
          questions: [
            {
              type: 'INTERVAL',
              value: 15,
              text: 'In what year did World War II end? (±1 year)',
              answer: '1945',
              acceptableAnswers: ['1945'],
              range: 1
            },
            {
              type: 'OPTIONS',
              value: 20,
              text: 'Which country was the first to grant women the right to vote?',
              answer: 'New Zealand',
              acceptableAnswers: ['New Zealand'],
              options: ['United States', 'United Kingdom', 'New Zealand', 'Australia']
            }
          ]
        }
      ]
    },
    {
      category: 'POP_CULTURE',
      title: 'Pop Culture Trivia',
      description: 'Stay current with the latest in movies, music, celebrities, and viral trends.',
      quizType: 'SLIDES',
      rounds: [
        {
          title: 'Movies & TV',
          order: 1,
          questions: [
            {
              type: 'OPTIONS',
              value: 10,
              text: 'Which movie won the Academy Award for Best Picture in 2023?',
              answer: 'Everything Everywhere All at Once',
              acceptableAnswers: ['Everything Everywhere All at Once'],
              options: ['Top Gun: Maverick', 'Everything Everywhere All at Once', 'The Banshees of Inisherin', 'Avatar: The Way of Water']
            },
            {
              type: 'EXACT',
              value: 10,
              text: 'Who played the character of Tony Stark in the Marvel Cinematic Universe?',
              answer: 'Robert Downey Jr.',
              acceptableAnswers: ['Robert Downey Jr.', 'Robert Downey Junior']
            }
          ]
        },
        {
          title: 'Music & Celebrities',
          order: 2,
          questions: [
            {
              type: 'OPTIONS',
              value: 15,
              text: 'Which artist released the album "Midnights" in 2022?',
              answer: 'Taylor Swift',
              acceptableAnswers: ['Taylor Swift'],
              options: ['Ariana Grande', 'Taylor Swift', 'Billie Eilish', 'Dua Lipa']
            },
            {
              type: 'EXACT',
              value: 20,
              text: 'What social media platform did Elon Musk acquire in 2022?',
              answer: 'Twitter',
              acceptableAnswers: ['Twitter']
            }
          ]
        }
      ]
    },
    {
      category: 'ENTERTAINMENT',
      title: 'Entertainment Tonight',
      description: 'Dive into the world of television, awards, gaming, and entertainment industry.',
      quizType: 'JEOPARDY',
      rounds: [
        {
          title: 'Television & Streaming',
          order: 1,
          questions: [
            {
              type: 'OPTIONS',
              value: 10,
              text: 'Which streaming service produced "Stranger Things"?',
              answer: 'Netflix',
              acceptableAnswers: ['Netflix'],
              options: ['HBO Max', 'Netflix', 'Disney+', 'Amazon Prime']
            },
            {
              type: 'EXACT',
              value: 15,
              text: 'What is the highest-grossing TV series finale of all time?',
              answer: 'M*A*S*H',
              acceptableAnswers: ['M*A*S*H', 'MASH']
            }
          ]
        },
        {
          title: 'Gaming & Awards',
          order: 2,
          questions: [
            {
              type: 'OPTIONS',
              value: 15,
              text: 'Which video game franchise features the character Master Chief?',
              answer: 'Halo',
              acceptableAnswers: ['Halo'],
              options: ['Call of Duty', 'Halo', 'Destiny', 'Gears of War']
            },
            {
              type: 'INTERVAL',
              value: 20,
              text: 'In what year were the first Emmy Awards held? (±2 years)',
              answer: '1949',
              acceptableAnswers: ['1949'],
              range: 2
            }
          ]
        }
      ]
    },
    {
      category: 'TECHNOLOGY',
      title: 'Tech Innovation Quiz',
      description: 'Explore the cutting-edge world of programming, hardware, internet, and technological breakthroughs.',
      quizType: 'SLIDES',
      rounds: [
        {
          title: 'Programming & Software',
          order: 1,
          questions: [
            {
              type: 'OPTIONS',
              value: 10,
              text: 'Which programming language is known as the "language of the web"?',
              answer: 'JavaScript',
              acceptableAnswers: ['JavaScript'],
              options: ['Python', 'JavaScript', 'Java', 'C++']
            },
            {
              type: 'EXACT',
              value: 10,
              text: 'What does "AI" stand for in technology?',
              answer: 'Artificial Intelligence',
              acceptableAnswers: ['Artificial Intelligence']
            }
          ]
        },
        {
          title: 'Hardware & Internet',
          order: 2,
          questions: [
            {
              type: 'OPTIONS',
              value: 15,
              text: 'Which company developed the iPhone?',
              answer: 'Apple',
              acceptableAnswers: ['Apple'],
              options: ['Samsung', 'Apple', 'Google', 'Microsoft']
            },
            {
              type: 'INTERVAL',
              value: 20,
              text: 'In what year was the World Wide Web invented? (±2 years)',
              answer: '1989',
              acceptableAnswers: ['1989'],
              range: 2
            }
          ]
        }
      ]
    },
    {
      category: 'LITERATURE',
      title: 'Literary Classics',
      description: 'Journey through the world of famous authors, timeless books, and beautiful poetry.',
      quizType: 'JEOPARDY',
      rounds: [
        {
          title: 'Classic Authors',
          order: 1,
          questions: [
            {
              type: 'OPTIONS',
              value: 10,
              text: 'Who wrote "Pride and Prejudice"?',
              answer: 'Jane Austen',
              acceptableAnswers: ['Jane Austen'],
              options: ['Charlotte Brontë', 'Jane Austen', 'Emily Dickinson', 'George Eliot']
            },
            {
              type: 'EXACT',
              value: 10,
              text: 'Which Shakespeare play features the characters Romeo and Juliet?',
              answer: 'Romeo and Juliet',
              acceptableAnswers: ['Romeo and Juliet']
            }
          ]
        },
        {
          title: 'Modern Literature',
          order: 2,
          questions: [
            {
              type: 'OPTIONS',
              value: 15,
              text: 'Which book begins with "It was the best of times, it was the worst of times"?',
              answer: 'A Tale of Two Cities',
              acceptableAnswers: ['A Tale of Two Cities'],
              options: ['Great Expectations', 'A Tale of Two Cities', 'Oliver Twist', 'David Copperfield']
            },
            {
              type: 'EXACT',
              value: 20,
              text: 'Who wrote the Harry Potter series?',
              answer: 'J.K. Rowling',
              acceptableAnswers: ['J.K. Rowling', 'JK Rowling', 'Joanne Rowling']
            }
          ]
        }
      ]
    },
    {
      category: 'FOOD',
      title: 'Culinary World Tour',
      description: 'Savor the flavors of global cuisines, ingredients, and cooking techniques.',
      quizType: 'SLIDES',
      rounds: [
        {
          title: 'International Cuisines',
          order: 1,
          questions: [
            {
              type: 'OPTIONS',
              value: 10,
              text: 'Which country is the origin of sushi?',
              answer: 'Japan',
              acceptableAnswers: ['Japan'],
              options: ['China', 'Japan', 'Korea', 'Thailand']
            },
            {
              type: 'EXACT',
              value: 10,
              text: 'What is the main ingredient in guacamole?',
              answer: 'Avocado',
              acceptableAnswers: ['Avocado', 'Avocados']
            }
          ]
        },
        {
          title: 'Cooking & Ingredients',
          order: 2,
          questions: [
            {
              type: 'OPTIONS',
              value: 15,
              text: 'Which spice is derived from the Crocus flower?',
              answer: 'Saffron',
              acceptableAnswers: ['Saffron'],
              options: ['Turmeric', 'Saffron', 'Paprika', 'Cardamom']
            },
            {
              type: 'INTERVAL',
              value: 20,
              text: 'At what temperature does water boil at sea level in Celsius? (±2°C)',
              answer: '100',
              acceptableAnswers: ['100'],
              range: 2
            }
          ]
        }
      ]
    },
    {
      category: 'BUSINESS',
      title: 'Business & Economics',
      description: 'Navigate the world of companies, finance, markets, and entrepreneurship.',
      quizType: 'JEOPARDY',
      rounds: [
        {
          title: 'Major Companies',
          order: 1,
          questions: [
            {
              type: 'OPTIONS',
              value: 10,
              text: 'Which company is the largest by market capitalization as of 2023?',
              answer: 'Apple',
              acceptableAnswers: ['Apple'],
              options: ['Microsoft', 'Apple', 'Amazon', 'Google']
            },
            {
              type: 'EXACT',
              value: 10,
              text: 'Who is the founder of Amazon?',
              answer: 'Jeff Bezos',
              acceptableAnswers: ['Jeff Bezos', 'Jeffrey Bezos']
            }
          ]
        },
        {
          title: 'Finance & Markets',
          order: 2,
          questions: [
            {
              type: 'OPTIONS',
              value: 15,
              text: 'What does "IPO" stand for in business?',
              answer: 'Initial Public Offering',
              acceptableAnswers: ['Initial Public Offering'],
              options: ['Initial Public Offering', 'International Purchase Order', 'Investment Portfolio Option', 'Internal Process Optimization']
            },
            {
              type: 'EXACT',
              value: 20,
              text: 'Which stock exchange is located on Wall Street?',
              answer: 'NYSE',
              acceptableAnswers: ['NYSE', 'New York Stock Exchange']
            }
          ]
        }
      ]
    },
    {
      category: 'HEALTH',
      title: 'Health & Wellness',
      description: 'Discover essential knowledge about nutrition, exercise, and medical facts for a healthy lifestyle.',
      quizType: 'SLIDES',
      rounds: [
        {
          title: 'Nutrition & Diet',
          order: 1,
          questions: [
            {
              type: 'OPTIONS',
              value: 10,
              text: 'Which vitamin is produced when skin is exposed to sunlight?',
              answer: 'Vitamin D',
              acceptableAnswers: ['Vitamin D'],
              options: ['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D']
            },
            {
              type: 'EXACT',
              value: 10,
              text: 'How many calories are in one gram of fat?',
              answer: '9',
              acceptableAnswers: ['9', 'nine']
            }
          ]
        },
        {
          title: 'Exercise & Medicine',
          order: 2,
          questions: [
            {
              type: 'INTERVAL',
              value: 15,
              text: 'How many minutes of moderate exercise per week does WHO recommend for adults? (±30 minutes)',
              answer: '150',
              acceptableAnswers: ['150'],
              range: 30
            },
            {
              type: 'OPTIONS',
              value: 20,
              text: 'What is the largest organ in the human body?',
              answer: 'Skin',
              acceptableAnswers: ['Skin'],
              options: ['Liver', 'Skin', 'Brain', 'Lungs']
            }
          ]
        }
      ]
    },
    {
      category: 'NATURE',
      title: 'Natural World',
      description: 'Explore the fascinating realm of animals, plants, and environmental wonders.',
      quizType: 'JEOPARDY',
      rounds: [
        {
          title: 'Animal Kingdom',
          order: 1,
          questions: [
            {
              type: 'OPTIONS',
              value: 10,
              text: 'What is the largest mammal in the world?',
              answer: 'Blue Whale',
              acceptableAnswers: ['Blue Whale'],
              options: ['African Elephant', 'Blue Whale', 'Giraffe', 'Polar Bear']
            },
            {
              type: 'EXACT',
              value: 10,
              text: 'How many hearts does an octopus have?',
              answer: '3',
              acceptableAnswers: ['3', 'three']
            }
          ]
        },
        {
          title: 'Plants & Environment',
          order: 2,
          questions: [
            {
              type: 'OPTIONS',
              value: 15,
              text: 'Which gas do plants absorb from the atmosphere during photosynthesis?',
              answer: 'Carbon Dioxide',
              acceptableAnswers: ['Carbon Dioxide', 'CO2'],
              options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen']
            },
            {
              type: 'INTERVAL',
              value: 20,
              text: 'What percentage of Earth\'s surface is covered by water? (±3%)',
              answer: '71',
              acceptableAnswers: ['71'],
              range: 3
            }
          ]
        }
      ]
    },
    {
      category: 'MATHEMATICS',
      title: 'Math Mastery',
      description: 'Challenge your mathematical skills with algebra, geometry, statistics, and number theory.',
      quizType: 'SLIDES',
      rounds: [
        {
          title: 'Basic Mathematics',
          order: 1,
          questions: [
            {
              type: 'EXACT',
              value: 10,
              text: 'What is the value of π (pi) to two decimal places?',
              answer: '3.14',
              acceptableAnswers: ['3.14']
            },
            {
              type: 'OPTIONS',
              value: 10,
              text: 'What is the square root of 144?',
              answer: '12',
              acceptableAnswers: ['12'],
              options: ['10', '11', '12', '13']
            }
          ]
        },
        {
          title: 'Advanced Concepts',
          order: 2,
          questions: [
            {
              type: 'EXACT',
              value: 15,
              text: 'In a right triangle, what is the relationship between the sides called?',
              answer: 'Pythagorean Theorem',
              acceptableAnswers: ['Pythagorean Theorem', 'Pythagorean theorem']
            },
            {
              type: 'INTERVAL',
              value: 20,
              text: 'What is 15 factorial (15!)? Give your answer in millions (±50 million)',
              answer: '1307',
              acceptableAnswers: ['1307'],
              range: 50
            }
          ]
        }
      ]
    },
    {
      category: 'LANGUAGES',
      title: 'World Languages',
      description: 'Explore grammar, vocabulary, and cultural aspects of languages from around the globe.',
      quizType: 'JEOPARDY',
      rounds: [
        {
          title: 'Popular Languages',
          order: 1,
          questions: [
            {
              type: 'OPTIONS',
              value: 10,
              text: 'Which language has the most native speakers worldwide?',
              answer: 'Mandarin Chinese',
              acceptableAnswers: ['Mandarin Chinese', 'Mandarin', 'Chinese'],
              options: ['English', 'Mandarin Chinese', 'Spanish', 'Hindi']
            },
            {
              type: 'EXACT',
              value: 10,
              text: 'What does "Bonjour" mean in English?',
              answer: 'Hello',
              acceptableAnswers: ['Hello', 'Good morning', 'Good day']
            }
          ]
        },
        {
          title: 'Language Facts',
          order: 2,
          questions: [
            {
              type: 'OPTIONS',
              value: 15,
              text: 'Which language uses three different writing systems: Hiragana, Katakana, and Kanji?',
              answer: 'Japanese',
              acceptableAnswers: ['Japanese'],
              options: ['Korean', 'Japanese', 'Thai', 'Vietnamese']
            },
            {
              type: 'INTERVAL',
              value: 20,
              text: 'Approximately how many languages are spoken in the world today? (±500)',
              answer: '7000',
              acceptableAnswers: ['7000'],
              range: 500
            }
          ]
        }
      ]
    },
    {
      category: 'CURRENT_EVENTS',
      title: 'News & Current Affairs',
      description: 'Stay informed about recent events, politics, social issues, and global developments.',
      quizType: 'SLIDES',
      rounds: [
        {
          title: 'Global Politics',
          order: 1,
          questions: [
            {
              type: 'OPTIONS',
              value: 10,
              text: 'Who is the current Secretary-General of the United Nations (as of 2024)?',
              answer: 'António Guterres',
              acceptableAnswers: ['António Guterres', 'Antonio Guterres'],
              options: ['Ban Ki-moon', 'António Guterres', 'Kofi Annan', 'Boutros Boutros-Ghali']
            },
            {
              type: 'EXACT',
              value: 15,
              text: 'Which country hosted the 2024 Summer Olympics?',
              answer: 'France',
              acceptableAnswers: ['France', 'Paris']
            }
          ]
        },
        {
          title: 'Social Issues',
          order: 2,
          questions: [
            {
              type: 'OPTIONS',
              value: 15,
              text: 'What does "ESG" stand for in sustainable investing?',
              answer: 'Environmental, Social, and Governance',
              acceptableAnswers: ['Environmental, Social, and Governance'],
              options: ['Economic, Social, and Global', 'Environmental, Social, and Governance', 'Ethical, Sustainable, and Green', 'European, Social, and Government']
            },
            {
              type: 'INTERVAL',
              value: 20,
              text: 'In what year did the COVID-19 pandemic officially begin according to WHO? (±1 year)',
              answer: '2020',
              acceptableAnswers: ['2020'],
              range: 1
            }
          ]
        }
      ]
    },
    {
      category: 'OTHER',
      title: 'General Knowledge',
      description: 'A diverse mix of fascinating facts, trivia, and knowledge from various fields and topics.',
      quizType: 'JEOPARDY',
      rounds: [
        {
          title: 'Random Facts',
          order: 1,
          questions: [
            {
              type: 'OPTIONS',
              value: 10,
              text: 'What is the most abundant gas in Earth\'s atmosphere?',
              answer: 'Nitrogen',
              acceptableAnswers: ['Nitrogen'],
              options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Argon']
            },
            {
              type: 'EXACT',
              value: 10,
              text: 'How many sides does a hexagon have?',
              answer: '6',
              acceptableAnswers: ['6', 'six']
            }
          ]
        },
        {
          title: 'Mixed Trivia',
          order: 2,
          questions: [
            {
              type: 'OPTIONS',
              value: 15,
              text: 'Which planet is known as the "Red Planet"?',
              answer: 'Mars',
              acceptableAnswers: ['Mars'],
              options: ['Venus', 'Mars', 'Jupiter', 'Saturn']
            },
            {
              type: 'INTERVAL',
              value: 20,
              text: 'How many minutes are there in a full day? (±30 minutes)',
              answer: '1440',
              acceptableAnswers: ['1440'],
              range: 30
            }
          ]
        }
      ]
    }
  ];

  console.log('📚 Creating quizzes for all categories...');

  const difficulties = ['EASY', 'MEDIUM', 'HARD'];

  for (let i = 0; i < quizData.length; i++) {
    const quizInfo = quizData[i]!;
    // Create the quiz
    const quiz = await prisma.quiz.create({
      data: {
        title: quizInfo.title,
        description: quizInfo.description,
        category: quizInfo.category as any,
        quizType: quizInfo.quizType as any,
        quizStatus: 'PUBLISHED',
        quizVisibility: 'PUBLIC',
        difficulty: difficulties[i % 3] as any, // Rotate through EASY, MEDIUM, HARD
        numOfRounds: quizInfo.rounds.length,
        numOfPlays: Math.floor(Math.random() * 100) + 10, // Random plays between 10-110
        rating: Math.floor(Math.random() * 3) + 3, // Random rating between 3-5
        authorId: demoUser.id
      }
    });

    console.log(`  ✅ Created quiz: ${quiz.title} (${quizInfo.category})`);

    // Create rounds for the quiz
    for (const roundInfo of quizInfo.rounds) {
      const round = await prisma.quizRound.create({
        data: {
          title: roundInfo.title,
          order: roundInfo.order,
          quizId: quiz.id
        }
      });

      console.log(`    📝 Created round: ${round.title}`);

      // Create questions for the round
      for (const questionInfo of roundInfo.questions) {
        const question = await prisma.question.create({
          data: {
            type: questionInfo.type as any,
            value: questionInfo.value,
            text: questionInfo.text,
            answer: questionInfo.answer,
            acceptableAnswers: questionInfo.acceptableAnswers,
            range: questionInfo.range,
            roundId: round.id
          }
        });

        console.log(`      ❓ Created question: ${questionInfo.text.substring(0, 50)}...`);

        // Create answer options for OPTIONS type questions
        if (questionInfo.type === 'OPTIONS' && questionInfo.options) {
          for (const option of questionInfo.options) {
            await prisma.answerOption.create({
              data: {
                text: option,
                questionId: question.id
              }
            });
          }
          console.log(`        🔤 Created ${questionInfo.options.length} answer options`);
        }
      }
    }

    // Add some ratings for the quiz
    const numRatings = Math.floor(Math.random() * 5) + 2; // 2-6 ratings
    for (let i = 0; i < numRatings; i++) {
      await prisma.rating.create({
        data: {
          value: Math.floor(Math.random() * 3) + 3, // Rating between 3-5
          comment: `Great ${quizInfo.category.toLowerCase()} quiz! Really enjoyed it.`,
          authorId: demoUser.id,
          quizId: quiz.id
        }
      });
    }
    console.log(`    ⭐ Added ${numRatings} ratings`);
  }

  console.log('🎉 Database seeding completed successfully!');
  console.log(`📊 Created ${quizData.length} quizzes across all ${quizData.length} categories`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
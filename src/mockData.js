export const mockQuiz = {
    id: 'quiz-123',
    title: 'The History of Rome',
    questions: [
        {
            id: 1,
            text: 'Who was the first emperor of Rome?',
            options: [
                { id: 'A', text: 'Julius Caesar' },
                { id: 'B', text: 'Augustus' },
                { id: 'C', text: 'Nero' },
                { id: 'D', text: 'Trajan' },
            ],
            correctAnswer: 'B',
        },
        {
            id: 2,
            text: 'Which year did the Western Roman Empire fall?',
            options: [
                { id: 'A', text: '476 AD' },
                { id: 'B', text: '1453 AD' },
                { id: 'C', text: '312 AD' },
                { id: 'D', text: '753 BC' },
            ],
            correctAnswer: 'A',
        },
        {
            id: 3,
            text: 'What was the language spoken by the Romans?',
            options: [
                { id: 'A', text: 'Greek' },
                { id: 'B', text: 'Latin' },
                { id: 'C', text: 'Italian' },
                { id: 'D', text: 'French' },
            ],
            correctAnswer: 'B',
        },
        {
            id: 4,
            text: 'Who famously crossed the Alps with elephants?',
            options: [
                { id: 'A', text: 'Hannibal' },
                { id: 'B', text: 'Scipio Africanus' },
                { id: 'C', text: 'Attila the Hun' },
                { id: 'D', text: 'Spartacus' },
            ],
            correctAnswer: 'A',
        },
        {
            id: 5,
            text: 'Which Roman god is equivalent to the Greek god Zeus?',
            options: [
                { id: 'A', text: 'Mars' },
                { id: 'B', text: 'Apollo' },
                { id: 'C', text: 'Jupiter' },
                { id: 'D', text: 'Neptune' },
            ],
            correctAnswer: 'C',
        },
    ],
};

export const mockPlayers = [
    { id: 'p1', name: 'Alice', score: 1200 },
    { id: 'p2', name: 'Bob', score: 1150 },
    { id: 'p3', name: 'Charlie', score: 1100 },
    { id: 'p4', name: 'Dave', score: 950 },
    { id: 'p5', name: 'Eve', score: 900 },
];

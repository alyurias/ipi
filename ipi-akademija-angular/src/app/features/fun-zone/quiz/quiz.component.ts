import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  questions: QuizQuestion[] = [
    {
      id: 1,
      question: 'Šta je HTML?',
      options: [
        'Programski jezik za web stranice',
        'Označni jezik za strukturiranje web stranica',
        'Baza podataka',
        'Grafički editor'
      ],
      correctAnswer: 1,
      explanation: 'HTML (HyperText Markup Language) je označni jezik koji se koristi za strukturiranje i prikaz sadržaja na web stranicama.',
      category: 'HTML Osnove'
    },
    {
      id: 2,
      question: 'Koji HTML tag se koristi za stvaranje linka?',
      options: [
        '<link>',
        '<a>',
        '<href>',
        '<url>'
      ],
      correctAnswer: 1,
      explanation: '<a> tag se koristi za stvaranje hyperlinkova (linkova). Npr: <a href="https://example.com">Primjer</a>',
      category: 'HTML Tagovi'
    },
    {
      id: 3,
      question: 'Kako se označava komentar u CSS-u?',
      options: [
        '// Ovo je komentar',
        '<!-- Ovo je komentar -->',
        '/* Ovo je komentar */',
        '# Ovo je komentar'
      ],
      correctAnswer: 2,
      explanation: 'U CSS-u se komentari označavaju sa /* komentar */',
      category: 'CSS Sintaksa'
    },
    {
      id: 4,
      question: 'Koja CSS svojstva se koriste za postavljanje pozadinske boje?',
      options: [
        'background-color',
        'color',
        'bg-color',
        'background'
      ],
      correctAnswer: 0,
      explanation: 'background-color se koristi za postavljanje pozadinske boje elementa.',
      category: 'CSS Svojstva'
    },
    {
      id: 5,
      question: 'Što je div element u HTML-u?',
      options: [
        'Division - kontejnerski element',
        'Digitalni video',
        'Direktiva',
        'Divergentni element'
      ],
      correctAnswer: 0,
      explanation: 'div (division) je kontejnerski HTML element koji se koristi za grupiranje drugih elemenata.',
      category: 'HTML Elementi'
    },
    {
      id: 6,
      question: 'Kako se centrira tekst horizontalno u CSS-u?',
      options: [
        'text-align: center;',
        'align: center;',
        'center: true;',
        'text-center: yes;'
      ],
      correctAnswer: 0,
      explanation: 'text-align: center; centrira tekst unutar elementa.',
      category: 'CSS Pozicioniranje'
    },
    {
      id: 7,
      question: 'Koji HTML tag se koristi za najveći naslov?',
      options: [
        '<h6>',
        '<h1>',
        '<head>',
        '<header>'
      ],
      correctAnswer: 1,
      explanation: '<h1> se koristi za glavni naslov i ima najveću veličinu (h1 do h6, gdje je h1 najveći).',
      category: 'HTML Tagovi'
    },
    {
      id: 8,
      question: 'Što je CSS?',
      options: [
        'Computer Style Sheets',
        'Cascading Style Sheets',
        'Creative Style System',
        'Colorful Style Sheets'
      ],
      correctAnswer: 1,
      explanation: 'CSS (Cascading Style Sheets) je jezik koji se koristi za opis izgleda i formatiranja HTML dokumenta.',
      category: 'CSS Osnove'
    },
    {
      id: 9,
      question: 'Kako se označava unordered list (neuređena lista) u HTML-u?',
      options: [
        '<ol>',
        '<ul>',
        '<li>',
        '<list>'
      ],
      correctAnswer: 1,
      explanation: '<ul> se koristi za neuređenu listu (sa bullet točkama), dok se <ol> koristi za uređenu listu (sa brojevima).',
      category: 'HTML Liste'
    },
    {
      id: 10,
      question: 'Koja CSS jedinica se odnosi na veličinu fonta roditeljskog elementa?',
      options: [
        'px',
        'em',
        'rem',
        '%'
      ],
      correctAnswer: 1,
      explanation: 'em je relativna jedinica koja se bazira na veličinu fonta roditeljskog elementa.',
      category: 'CSS Jedinice'
    },
    {
      id: 11,
      question: 'Koji HTML tag se koristi za unos teksta u formi?',
      options: [
        '<input type="text">',
        '<textfield>',
        '<text>',
        '<textarea>'
      ],
      correctAnswer: 0,
      explanation: '<input type="text"> se koristi za unos teksta u formi.',
      category: 'HTML Forme'
    },
    {
      id: 12,
      question: 'Što označava CSS selektor .class?',
      options: [
        'Selektira elemente po ID-u',
        'Selektira elemente po klasi',
        'Selektira sve elemente',
        'Selektira samo paragrafe'
      ],
      correctAnswer: 1,
      explanation: '.class selektira sve elemente koji imaju navedenu klasu.',
      category: 'CSS Selektori'
    },
    {
      id: 13,
      question: 'Kako se označava paragraf u HTML-u?',
      options: [
        '<para>',
        '<p>',
        '<paragraph>',
        '<text>'
      ],
      correctAnswer: 1,
      explanation: '<p> tag se koristi za paragraf teksta.',
      category: 'HTML Tagovi'
    },
    {
      id: 14,
      question: 'Koja CSS svojstva se koriste za postavljanje margine?',
      options: [
        'margin',
        'padding',
        'border',
        'spacing'
      ],
      correctAnswer: 0,
      explanation: 'margin se koristi za stvaranje prostora izvan elementa.',
      category: 'CSS Box Model'
    },
    {
      id: 15,
      question: 'Koji HTML atribut se koristi za dodavanje CSS klase elementu?',
      options: [
        'style',
        'class',
        'css',
        'id'
      ],
      correctAnswer: 1,
      explanation: 'class atribut se koristi za dodavanje CSS klase HTML elementu.',
      category: 'HTML Atributi'
    }
  ];

  currentQuestionIndex = 0;
  selectedAnswer: number | null = null;
  score = 0;
  quizCompleted = false;
  showExplanation = false;
  userAnswers: number[] = [];
  timeRemaining = 600; 
  timer: any;
  quizStarted = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.shuffleQuestions();
    this.userAnswers = new Array(this.questions.length).fill(-1);
  }

  shuffleQuestions(): void {
    this.questions = [...this.questions].sort(() => Math.random() - 0.5);
  }

  startQuiz(): void {
    this.quizStarted = true;
    this.startTimer();
  }

  startTimer(): void {
    this.timer = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        this.finishQuiz();
      }
    }, 1000);
  }

  selectAnswer(index: number): void {
    if (this.selectedAnswer !== null || this.quizCompleted) return;
    
    this.selectedAnswer = index;
    this.userAnswers[this.currentQuestionIndex] = index;
    this.showExplanation = true;
  }

  nextQuestion(): void {
    if (this.selectedAnswer !== null) {
      if (this.selectedAnswer === this.currentQuestion.correctAnswer) {
        this.score++;
      }
    }

    this.selectedAnswer = null;
    this.showExplanation = false;

    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.finishQuiz();
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.selectedAnswer = this.userAnswers[this.currentQuestionIndex];
      this.showExplanation = this.selectedAnswer !== -1;
    }
  }

  skipQuestion(): void {
    this.userAnswers[this.currentQuestionIndex] = -1;
    this.selectedAnswer = null;
    this.showExplanation = false;
    
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.finishQuiz();
    }
  }

  finishQuiz(): void {
    clearInterval(this.timer);
    this.quizCompleted = true;
    this.calculateFinalScore();
  }

  calculateFinalScore(): void {
    this.score = 0;
    for (let i = 0; i < this.questions.length; i++) {
      if (this.userAnswers[i] === this.questions[i].correctAnswer) {
        this.score++;
      }
    }
  }

  restartQuiz(): void {
    this.currentQuestionIndex = 0;
    this.selectedAnswer = null;
    this.score = 0;
    this.quizCompleted = false;
    this.showExplanation = false;
    this.quizStarted = false;
    this.timeRemaining = 600;
    this.userAnswers = new Array(this.questions.length).fill(-1);
    this.shuffleQuestions();
    clearInterval(this.timer);
  }

  goBack(): void {
    clearInterval(this.timer);
    this.router.navigate(['/fun-zone']);
  }

  get currentQuestion(): QuizQuestion {
    return this.questions[this.currentQuestionIndex];
  }

  get progressPercentage(): number {
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  getAnswerClass(index: number): string {
    if (!this.showExplanation) return '';
    
    if (index === this.currentQuestion.correctAnswer) {
      return 'correct';
    } else if (this.selectedAnswer === index && index !== this.currentQuestion.correctAnswer) {
      return 'wrong';
    }
    return '';
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); 
  }
}
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { StatisticsService, StatisticsData } from '../../core/services/statistics.service';
import { Subject, takeUntil } from 'rxjs';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface QuickQuestion {
  id: string;
  text: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private statisticsService = inject(StatisticsService);
  private destroy$ = new Subject<void>();

  isOpen = false;
  isMinimized = false;
  messages: Message[] = [];
  userInput = '';
  isTyping = false;

  private statsData: StatisticsData | null = null;

  quickQuestions: QuickQuestion[] = [
    { id: 'analyze', text: 'Kako mi ide danas?' },
    { id: 'sleep', text: 'Pricaj mi o spavanju' },
    { id: 'water', text: 'Trebam li vise vode?' },
    { id: 'study', text: 'Sta sa ucenjem?' },
    { id: 'mood', text: 'Kako se osjecam?' },
    { id: 'motivation', text: 'Motiviraj me!' },
    { id: 'tips', text: 'Daj mi savjet' }
  ];

  ngOnInit(): void {
    // Subscribe to statistics data
    this.statisticsService.statistics$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.statsData = data;
        console.log('Chatbot loaded stats:', data);
        
        // Show greeting only on first load
        if (this.messages.length === 0) {
          this.addBotMessage(this.getFriendlyGreeting());
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleChat(): void {
    if (this.isMinimized) {
      this.isMinimized = false;
    } else {
      this.isOpen = !this.isOpen;
    }
  }

  minimizeChat(): void {
    this.isMinimized = true;
  }

  maximizeChat(): void {
    this.isMinimized = false;
  }

  closeChat(): void {
    this.isOpen = false;
    this.isMinimized = false;
  }

  handleQuickQuestion(questionId: string): void {
    const question = this.quickQuestions.find(q => q.id === questionId);
    if (question) {
      this.addUserMessage(question.text);
      this.simulateTyping(() => {
        const response = this.getFriendlyResponse(questionId);
        this.addBotMessage(response);
      });
    }
  }

  sendMessage(): void {
    const message = this.userInput.trim();
    if (!message) return;

    this.addUserMessage(message);
    this.userInput = '';

    this.simulateTyping(() => {
      const response = this.analyzeMessage(message);
      this.addBotMessage(response);
    });
  }

  private getFriendlyGreeting(): string {
    if (!this.statsData) {
      return 'Cao! Ja sam Vas virtuelni asistent - mozete me zvati kako hocete, samo nemojte kasno navecer. Kako Vam mogu pomoci danas?';
    }

    const today = new Date().toISOString().split('T')[0];
    const userId = this.authService.currentUser()?.uid;
    
    // Check today's data
    const todaySleep = this.statsData.sleep.find(s => s.date === today);
    const todayStudy = this.statsData.study.filter(s => s.date === today);
    const todayMood = this.statsData.mood.find(m => m.date === today);

    // Check water
    let todayWater = null;
    if (userId) {
      try {
        const stored = localStorage.getItem(`water_${userId}`);
        if (stored) {
          const entries = JSON.parse(stored);
          todayWater = entries.find((e: any) => e.date === today);
        }
      } catch (e) {}
    }

    const issues: string[] = [];
    const good: string[] = [];

    if (!todaySleep) {
      issues.push('niste mi rekli koliko ste spavali');
    } else if (todaySleep.hours < 7) {
      issues.push('malo ste spavali, jelda');
    } else if (todaySleep.hours >= 7 && todaySleep.hours <= 9) {
      good.push('super ste spavali');
    }

    if (!todayWater || todayWater.glasses < 3) {
      issues.push('trebate popiti vise vode');
    }

    if (todayStudy.length === 0 && this.isWeekday()) {
      issues.push('jos niste poceli da ucite');
    }

    if (todayMood && todayMood.rating >= 4) {
      good.push('raspolozenje Vam je odlicno');
    } else if (todayMood && todayMood.rating < 3) {
      issues.push('raspolozenje nije bas najbolje');
    }

    let greeting = 'Cao! ';

    if (good.length > 0) {
      greeting += `Vidim da ${good[0]}! `;
    }

    if (issues.length > 0) {
      if (good.length > 0) {
        greeting += `Ali... ${issues[0]}. `;
      } else {
        greeting += `E pa, ${issues[0]}. `;
      }
    }

    if (good.length === 0 && issues.length === 0) {
      greeting += 'Izgleda da jos uvijek imate prazne trackere. Ajde da to popunimo! ';
    }

    greeting += 'Kako Vam mogu pomoci?';
    return greeting;
  }

  private isWeekday(): boolean {
    const day = new Date().getDay();
    return day >= 1 && day <= 5;
  }

  private getFriendlyResponse(questionId: string): string {
    if (!this.statsData) {
      return 'Hm, izgleda da jos uvijek nemate podatke u trackerima. Kako da Vam pomognem ako ne znam sta radite? Popunite neki tracker pa se vratite!';
    }

    switch (questionId) {
      case 'analyze':
        return this.getFullAnalysis();
      case 'sleep':
        return this.getSleepAdvice();
      case 'water':
        return this.getWaterAdvice();
      case 'study':
        return this.getStudyAdvice();
      case 'mood':
        return this.getMoodAdvice();
      case 'motivation':
        return this.getMotivation();
      case 'tips':
        return this.getQuickTips();
      default:
        return 'Nisam siguran sta pitate, ali pitajte me o spavanju, ucenju, raspolozenju ili bilo cemu!';
    }
  }

  private getFullAnalysis(): string {
    const today = new Date().toISOString().split('T')[0];
    const todaySleep = this.statsData!.sleep.find(s => s.date === today);
    const todayStudy = this.statsData!.study.filter(s => s.date === today);
    const todayMood = this.statsData!.mood.find(m => m.date === today);

    let analysis = 'Evo sta vidim za danas:\n\n';

    // Sleep
    if (!todaySleep) {
      analysis += 'SPAVANJE: Niste mi rekli koliko ste spavali! Zasto tajite? Popunite Sleep Tracker pa da vidimo koliko ste se naspavali.\n\n';
    } else if (todaySleep.hours < 6) {
      analysis += `SPAVANJE: ${Math.round(todaySleep.hours)} sati?! E to je malo previse malo. Vasa ocigledno voli da budete umoran. Ciljajte 7-9 sati veceras!\n\n`;
    } else if (todaySleep.hours < 7) {
      analysis += `SPAVANJE: ${Math.round(todaySleep.hours)} sati je okej, ali moglo bi biti bolje. Jos jedan sat i bili biste top!\n\n`;
    } else if (todaySleep.hours > 9) {
      analysis += `SPAVANJE: ${Math.round(todaySleep.hours)} sati? Pa Vi ste profesionalni spavac! Ili ste premoreni ili samo jako volite krevet.\n\n`;
    } else {
      analysis += `SPAVANJE: ${Math.round(todaySleep.hours)} sati - to je to! Perfektno. Nastavite ovako i bices produktivni kao pcelica.\n\n`;
    }

    // Study
    const totalStudyHours = todayStudy.reduce((sum, s) => sum + s.hours, 0);
    if (totalStudyHours === 0) {
      if (this.isWeekday()) {
        const hour = new Date().getHours();
        if (hour < 12) {
          analysis += 'UCENJE: Jutro je, jos nije kasno da pocnete! Mozak Vam je svjez kao salata.\n\n';
        } else if (hour < 18) {
          analysis += 'UCENJE: Vec je popodne i jos nista? Ajde, bar pola sata, za mene!\n\n';
        } else {
          analysis += 'UCENJE: Kasno je vec. Bolje priusti sebi odmor, sutra je novi dan!\n\n';
        }
      } else {
        analysis += 'UCENJE: Vikend je, zasluzujete odmor. Ali ako imate nesto hitno, znate sta treba!\n\n';
      }
    } else if (totalStudyHours < 2) {
      analysis += `UCENJE: ${totalStudyHours.toFixed(1)}h - dobar pocetak! Mozete jos malo ako imate energije.\n\n`;
    } else if (totalStudyHours < 5) {
      analysis += `UCENJE: ${totalStudyHours.toFixed(1)}h - odlicno! Samo ne zaboravite da pravite pauze, Vi niste robot.\n\n`;
    } else {
      analysis += `UCENJE: ${totalStudyHours.toFixed(1)}h?! Ozbiljno? Pa Vi ste heroj! Ali stvarno, napravite pauzu. Mozak ima limite, znate.\n\n`;
    }

    // Mood
    if (!todayMood) {
      analysis += 'RASPOLOZENJE: Niste mi rekli kako se osjecate. Dajte, nije tesko - kliknite broj od 1 do 5!';
    } else if (todayMood.rating === 1) {
      analysis += `RASPOLOZENJE: ${todayMood.rating}/5... Oh ne. Izgleda da nije dobar dan. Zelite li da pricamo o tome? Mozda malo muzike ili setnje?`;
    } else if (todayMood.rating === 2) {
      analysis += `RASPOLOZENJE: ${todayMood.rating}/5 - moglo bi biti bolje. Sta Vam obicno pomaze? Mozda cas cokolade?`;
    } else if (todayMood.rating === 3) {
      analysis += `RASPOLOZENJE: ${todayMood.rating}/5 - srednje. Ni lose ni dobro. Mozete bolje!`;
    } else if (todayMood.rating === 4) {
      analysis += `RASPOLOZENJE: ${todayMood.rating}/5 - super! Sta je bio razlog? Nastavite tako!`;
    } else {
      analysis += `RASPOLOZENJE: ${todayMood.rating}/5 - PERFEKTNO! Divno je vidjeti Vas sretne! Uzivajte u danu!`;
    }

    return analysis;
  }

  private getSleepAdvice(): string {
    const today = new Date().toISOString().split('T')[0];
    const todaySleep = this.statsData!.sleep.find(s => s.date === today);

    if (!todaySleep) {
      return 'Pa kako da Vam pricam o spavanju ako mi niste rekli koliko ste spavali? Idite u Sleep Tracker i popunite, pa se vratite!';
    }

    const hours = Math.round(todaySleep.hours);

    if (hours < 6) {
      return `${hours} sati sna? E to je... kako da kazem... malo previse malo. Vasi neuroni protestuju! Za optimalan rad mozga trebate 7-9 sati. Veceras ranije u krevet!`;
    } else if (hours < 7) {
      return `${hours} sati je okej, ali ne i odlicno. Studenti koji spavaju 7-9 sati imaju bolje ocene - nauka je to dokazala! Dodajte jos jedan sat i bices nepobjedivi.`;
    } else if (hours > 9) {
      return `${hours} sati? Pa Vi ste profesionalni spavac! Ili ste bas umoran ili jednostavno jako volite svoj krevet. Nista lose u tome, ali mozda je vrijeme da vidite zasto trebate toliko sna.`;
    } else {
      return `${hours} sati - to je pravi broj! Bas ste u optimalnom rangu 7-9 sati. Nastavite ovako i Vas mozak ce Vam biti zahvalan!`;
    }
  }

  private getWaterAdvice(): string {
    // Read water data directly from localStorage since it's not in StatisticsService
    const userId = this.authService.currentUser()?.uid;
    if (!userId) {
      return 'Trebate biti prijavljeni da bih mogao pratiti Vasu hidrataciju!';
    }

    try {
      const stored = localStorage.getItem(`water_${userId}`);
      if (!stored) {
        return 'Jos niste poceli da pratite unos vode! Idite u Water Intake tracker i zapocnite. Preporuka: 8 casa dnevno. Vasi neuroni ce Vam biti zahvalni!';
      }

      const entries = JSON.parse(stored);
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = entries.find((e: any) => e.date === today);

      const goalStored = localStorage.getItem(`water_goal_${userId}`);
      const goal = goalStored ? parseInt(goalStored) : 8;

      if (!todayEntry || todayEntry.glasses === 0) {
        return `Niste popili ni jednu casu vode danas! Dehidracija je neprijatelj broj jedan produktivnosti. Idite popiti bar jednu casu ODMAH, pa se vratite!`;
      }

      const glasses = todayEntry.glasses;
      const percentage = Math.round((glasses / goal) * 100);

      if (percentage < 50) {
        return `Popili ste samo ${glasses} od ${goal} casa (${percentage}%). To je... pa to je jako malo! Vase celije protestuju. Idite popiti jos nekoliko casa, necu Vas osudjivati!`;
      } else if (percentage < 100) {
        return `${glasses} od ${goal} casa (${percentage}%) - dobro napredujete! Jos malo pa ste tu. Vasi neuroni vec planiraju party!`;
      } else {
        return `${glasses} od ${goal} casa - BRAVO! Postigli ste cilj! Dobro se hidriranje. Nastavite ovako i Vas mozak ce Vam biti zahvalan!`;
      }
    } catch (error) {
      return 'Nesto je poslo po zlu sa citanjem podataka o vodi. Ali evo univerzalnog savjeta: 8 casa dnevno je idealno!';
    }
  }

  private getStudyAdvice(): string {
    const today = new Date().toISOString().split('T')[0];
    const todayStudy = this.statsData!.study.filter(s => s.date === today);
    const totalHours = todayStudy.reduce((sum, s) => sum + s.hours, 0);

    if (totalHours === 0) {
      const hour = new Date().getHours();
      if (hour < 10) {
        return 'Jutro je - najbolje vrijeme za ucenje! Mozak Vam je svjez kao jutarnja rosa. Iskoristite to dok traje!';
      } else if (hour < 14) {
        return 'Popodne je vec, ali jos nije kasno! Jedan dobar study session sada i bices na konju za ostatak dana.';
      } else if (hour < 18) {
        return 'Vece se priblizava... Ako morate uciti, okej, ali nemojte previse kasno. San je vazniji od jos jednog poglavlja, povjerujte mi!';
      } else {
        return 'Kasno je vec! Ako niste do sada nista ucili, nemojte ni pocinjati. Odmorite se, sutra je novi dan sa novim snagama!';
      }
    }

    if (totalHours < 1) {
      return `${totalHours.toFixed(1)}h - to je dobar pocetak! Nastavite jos malo ako imate energije. Ciljajte bar 2 sata za ozbiljno gradivo.`;
    } else if (totalHours < 3) {
      return `${totalHours.toFixed(1)}h - odlican tempo! Samo ne zaboravite: pravite pauze svakih sat-dva. Mozak nije stroj!`;
    } else if (totalHours < 5) {
      return `${totalHours.toFixed(1)}h je puno! Jeste li pravili pauze? Ako niste, to objasnjava zasto Vam se mozda vrti u glavi. Napravite pauzu, prošetajte, popijte vode!`;
    } else {
      return `${totalHours.toFixed(1)}h?! Pa Vi ste maraton trcac ucenja! Ozbiljno sad - napravite dugacku pauzu. Prekomjerno ucenje smanjuje efikasnost. Niste robot!`;
    }
  }

  private getMoodAdvice(): string {
    const today = new Date().toISOString().split('T')[0];
    const todayMood = this.statsData!.mood.find(m => m.date === today);

    if (!todayMood) {
      return 'Niste mi rekli kako se osjecate danas! Ajde, nije tesko - otvorite Mood Tracker i kliknite broj od 1 do 5. To mi pomaze da Vas bolje razumijem!';
    }

    if (todayMood.rating === 1) {
      return `Raspolozenje 1/5... Oh ne, to nije dobro. Zelite li da pricamo o tome? Ili mozda setnja od 15 minuta? Muzika? Razgovor sa prijateljem? Ponekad male stvari naprave veliku razliku!`;
    } else if (todayMood.rating === 2) {
      return `Raspolozenje 2/5 - moglo bi biti bolje. Sta Vam obicno pomaze kad se ovako osjecate? Mozda omiljeno jelo? Dobra pjesma? Ili jednostavno malo odmora?`;
    } else if (todayMood.rating === 3) {
      return `Raspolozenje 3/5 je kao... ni tamo ni amo. Mogu li Vam predloziti nesto? Pokusajte zapisati 3 stvari za koje ste zahvalni danas. To cesto pomaze!`;
    } else if (todayMood.rating === 4) {
      return `Raspolozenje 4/5 - to mi se svidja! Sta je bilo dobro danas? Nastavite sa time sto god da je!`;
    } else {
      return `Raspolozenje 5/5 - WOW! Vi ste danas na vrhu! Uživajte u tom osjecaju i zapamtite sta je tome doprinijelo!`;
    }
  }

  private getMotivation(): string {
    const motivations = [
      'Svaki veliki uspjeh pocinje malim korakom. Vi ste vec napravili nekoliko danas!',
      'Ne morate biti savrseni. Samo budite malo bolji nego juce. To je dovoljno!',
      'Zapamtite: Vi ste dosli ovdje jer imate ciljeve. I Vi mozete da ih postignete!',
      'Ponekad je odmor najbolja investicija. Nemojte se prekomjerno forsirati!',
      'Vi verovatno niste svjesni koliko ste vec postigli. Pogledajte unazad i vidjet cete napredak!'
    ];

    return motivations[Math.floor(Math.random() * motivations.length)];
  }

  private getQuickTips(): string {
    return `EVO BRZIH SAVJETA (iz iskustva):

1. JUTARNJA RUTINA: 2 case vode odmah po ustajanju. Mozak ce Vam biti zahvalan!

2. POMODORO TEHNIKA: 50 min ucenja, 10 min pauze. Stvarno radi!

3. PAUZE: Aktivne pauze (setnja) > pasivne (skrolovanje telefona).

4. SAN: 7-9h nije luksuz, to je nuznost. Bez kompromisa!

5. RASPOLOZENJE: Ako je lose, ne ignorišite. 15 min setnje moze promijeniti dan.

6. VODA: 8 casa dnevno. Postavite podsjetnik ako treba!

7. NE BUDITE PRESTROGI: Ponekad je pizza i film najbolji nacin da se odmorite. I to je okej!

Koja oblast Vas najvise zanima?`;
  }

  private analyzeMessage(message: string): string {
    const lower = message.toLowerCase();

    if (lower.includes('analiz') || lower.includes('kako mi ide') || lower.includes('sta radim')) {
      return this.getFullAnalysis();
    }
    if (lower.includes('spav') || lower.includes('san') || lower.includes('umor')) {
      return this.getSleepAdvice();
    }
    if (lower.includes('vod') || lower.includes('hidr') || lower.includes('piti')) {
      return this.getWaterAdvice();
    }
    if (lower.includes('uci') || lower.includes('studir') || lower.includes('pauz')) {
      return this.getStudyAdvice();
    }
    if (lower.includes('raspoloz') || lower.includes('osjecaj') || lower.includes('mood')) {
      return this.getMoodAdvice();
    }
    if (lower.includes('motivac') || lower.includes('motivis')) {
      return this.getMotivation();
    }
    if (lower.includes('tip') || lower.includes('savjet')) {
      return this.getQuickTips();
    }
    if (lower.includes('hvala') || lower.includes('fala')) {
      return 'Nema na cemu! Tu sam da pomognem. Sta jos zelite da znate?';
    }
    if (lower.includes('cao') || lower.includes('zdravo') || lower.includes('bok')) {
      return 'Cao! Dobro dosli nazad! Kako Vam mogu pomoci?';
    }

    return 'Nisam siguran sta pitate, ali mogu Vam pomoci sa: spavanjem, ucenjem, raspolozenjem, motivacijom ili brzim savjetima. Sta Vas zanima?';
  }

  private addUserMessage(text: string): void {
    this.messages.push({
      text,
      isUser: true,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  private addBotMessage(text: string): void {
    this.messages.push({
      text,
      isUser: false,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  private simulateTyping(callback: () => void): void {
    this.isTyping = true;
    setTimeout(() => {
      this.isTyping = false;
      callback();
    }, 800 + Math.random() * 700);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const messagesContainer = document.querySelector('.chat-messages');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }
}
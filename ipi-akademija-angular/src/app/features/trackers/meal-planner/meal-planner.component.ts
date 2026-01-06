import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

interface MealEntry {
  id: string;
  date: string;
  mealType: string;
  mealName: string;
  ingredients: string;
  calories: number;
  note: string;
  aiGenerated: boolean;
  createdAt: Date;
}

interface AIRecipe {
  name: string;
  ingredients: string;
  calories: number;
}

@Component({
  selector: 'app-meal-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meal-planner.component.html',
  styleUrl: './meal-planner.component.css'
})
export class MealPlannerComponent implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  
  private GEMINI_API_KEY = 'AIzaSyBUj9vduv1lbOzqzorSIQg31Nix5PpFeV0';
  private GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';


  showModal: boolean = false;
  showAIModal: boolean = false;

 
  mealType: string = 'breakfast';
  mealName: string = '';
  ingredients: string = '';
  calories: number = 0;
  note: string = '';

 
  aiPrompt: string = '';
  aiLoading: boolean = false;
  aiError: string = '';
  aiRecipes: AIRecipe[] = [];
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 2000; // 2 seconds between requests

  
  entries: MealEntry[] = [];
  todayEntries: MealEntry[] = [];


  totalMealsToday: number = 0;
  totalCaloriesToday: number = 0;
  averageCaloriesPerDay: number = 0;
  totalMealsWeek: number = 0;
  mostCommonMeal: string = '';

  mealTypes = [
    { value: 'breakfast', label: 'Doručak' },
    { value: 'lunch', label: 'Ručak' },
    { value: 'dinner', label: 'Večera' },
    { value: 'snack', label: 'Užina' }
  ];

  ngOnInit(): void {
    this.loadEntries();
    this.checkTodayEntries();
    this.calculateStats();
  }

  loadEntries(): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;

    const stored = localStorage.getItem(`meals_${userId}`);
    if (stored) {
      this.entries = JSON.parse(stored);
      this.entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }

  checkTodayEntries(): void {
    const today = new Date().toISOString().split('T')[0];
    this.todayEntries = this.entries.filter(e => e.date === today);
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.clearForm();
  }

  openAIModal(): void {
    this.showAIModal = true;
    this.aiPrompt = '';
    this.aiRecipes = [];
    this.aiError = '';
  }

  closeAIModal(): void {
    this.showAIModal = false;
    this.aiPrompt = '';
    this.aiRecipes = [];
    this.aiError = '';
  }

  async generateAIRecipes(): Promise<void> {
    if (!this.aiPrompt.trim()) {
      this.aiError = 'Molimo unesite šta želite jesti!';
      return;
    }

    if (this.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      this.aiError = 'Molimo dodajte vaš Google Gemini API ključ na liniji 36!';
      return;
    }

   
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = Math.ceil((this.minRequestInterval - timeSinceLastRequest) / 1000);
      this.aiError = `Molimo sačekajte ${waitTime} sekundi prije sljedećeg zahtjeva.`;
      return;
    }

    this.aiLoading = true;
    this.aiError = '';
    this.aiRecipes = [];
    this.lastRequestTime = now;

    const prompt = `Generate exactly 3 meal recipes based on: "${this.aiPrompt}"

Please respond in this EXACT format:

RECIPE 1
Name: [recipe name]
Ingredients: [list ingredients separated by commas]
Calories: [number only]

RECIPE 2
Name: [recipe name]
Ingredients: [list ingredients separated by commas]
Calories: [number only]

RECIPE 3
Name: [recipe name]
Ingredients: [list ingredients separated by commas]
Calories: [number only]

Keep it simple and follow the format exactly.`;

    try {
      
      const headers = {
        'Content-Type': 'application/json',
        'X-goog-api-key': this.GEMINI_API_KEY
      };

      console.log('Sending request to Gemini API...');

      const response = await this.http.post<any>(
        this.GEMINI_API_URL,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        },
        { headers }
      ).toPromise();

      console.log('Gemini Response:', response);

      if (response && response.candidates && response.candidates[0]) {
        const generatedText = response.candidates[0].content.parts[0].text;
        this.parseAIResponse(generatedText);
      } else {
        this.aiError = 'AI nije vratio odgovor. Pokušajte ponovo.';
      }
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      
      if (error.status === 400) {
        this.aiError = 'Nevažeći API ključ ili format zahtjeva.';
      } else if (error.status === 403) {
        this.aiError = 'API ključ nema permisije. Provjerite na Google AI Studio.';
      } else if (error.status === 429) {
        this.aiError = 'Previše zahtjeva! Sačekajte 60 sekundi i pokušajte ponovo. (Limit: 60 zahtjeva/minut)';
      } else if (error.status === 0) {
        this.aiError = 'Network greška. Provjerite internet konekciju.';
      } else {
        this.aiError = `Greška: ${error.message || 'Pokušajte ponovo'}`;
      }
    } finally {
      this.aiLoading = false;
    }
  }

  parseAIResponse(text: string): void {
    try {
      console.log('Parsing AI response:', text);
      
    
      let recipeBlocks = text.split(/RECIPE \d+/gi).filter(block => block.trim());
      
      if (recipeBlocks.length === 0) {
  
        recipeBlocks = text.split(/\n\n+/).filter(block => block.includes('Name:'));
      }
      
      this.aiRecipes = recipeBlocks.slice(0, 3).map((block, index) => {
        const nameMatch = block.match(/Name:\s*(.+?)(?:\n|Ingredients:|$)/i);
        const ingredientsMatch = block.match(/Ingredients:\s*(.+?)(?:\n|Calories:|$)/i);
        const caloriesMatch = block.match(/Calories:\s*(\d+)/i);

        const name = nameMatch ? nameMatch[1].trim() : `Recept ${index + 1}`;
        const ingredients = ingredientsMatch ? ingredientsMatch[1].trim() : 'Razni sastojci';
        const calories = caloriesMatch ? parseInt(caloriesMatch[1]) : 300 + (index * 50);

        return { name, ingredients, calories };
      }).filter(recipe => recipe.name !== '');

      console.log('Parsed recipes:', this.aiRecipes);

      if (this.aiRecipes.length === 0) {
        this.aiError = 'Nije moguće parsirati AI odgovor. Pokušajte ponovo ili pojednostavite zahtjev.';
      }
    } catch (error) {
      console.error('Parsing error:', error);
      this.aiError = 'Greška pri obradi AI odgovora.';
    }
  }

  useAIRecipe(recipe: AIRecipe): void {
    this.mealName = recipe.name;
    this.ingredients = recipe.ingredients;
    this.calories = recipe.calories;
    this.closeAIModal();
    this.openModal();
  }

  saveMeal(): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;

    if (!this.mealName.trim()) {
      alert('Molimo unesite naziv obroka!');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const newEntry: MealEntry = {
      id: Date.now().toString(),
      date: today,
      mealType: this.mealType,
      mealName: this.mealName.trim(),
      ingredients: this.ingredients.trim(),
      calories: this.calories || 0,
      note: this.note.trim(),
      aiGenerated: false,
      createdAt: new Date()
    };

    this.entries.unshift(newEntry);
    this.todayEntries.unshift(newEntry);

    this.saveToStorage();
    this.calculateStats();
    this.closeModal();
  }

  saveToStorage(): void {
    const userId = this.authService.currentUser()?.uid;
    if (!userId) return;

    localStorage.setItem(`meals_${userId}`, JSON.stringify(this.entries));
  }

  deleteEntry(id: string): void {
    if (confirm('Da li ste sigurni da želite obrisati ovaj obrok?')) {
      this.entries = this.entries.filter(e => e.id !== id);
      this.checkTodayEntries();
      this.saveToStorage();
      this.calculateStats();
    }
  }

  clearForm(): void {
    this.mealType = 'breakfast';
    this.mealName = '';
    this.ingredients = '';
    this.calories = 0;
    this.note = '';
  }

  calculateStats(): void {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const todayMeals = this.entries.filter(e => e.date === todayStr);
    this.totalMealsToday = todayMeals.length;
    this.totalCaloriesToday = todayMeals.reduce((sum, e) => sum + e.calories, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    this.totalMealsWeek = this.entries.filter(e => new Date(e.date) >= sevenDaysAgo).length;

    if (this.entries.length > 0) {
      const uniqueDates = [...new Set(this.entries.map(e => e.date))];
      const totalCalories = this.entries.reduce((sum, e) => sum + e.calories, 0);
      this.averageCaloriesPerDay = Math.round(totalCalories / uniqueDates.length);
    } else {
      this.averageCaloriesPerDay = 0;
    }

    this.mostCommonMeal = this.calculateMostCommonMeal();
  }

  calculateMostCommonMeal(): string {
    if (this.entries.length === 0) return 'N/A';

    const mealCounts: { [key: string]: number } = {};
    
    this.entries.forEach(entry => {
      mealCounts[entry.mealName] = (mealCounts[entry.mealName] || 0) + 1;
    });

    let maxCount = 0;
    let topMeal = 'N/A';

    Object.entries(mealCounts).forEach(([meal, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topMeal = meal;
      }
    });

    return topMeal;
  }

  getMealTypeLabel(type: string): string {
    const meal = this.mealTypes.find(m => m.value === type);
    return meal ? meal.label : type;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('bs-BA', options);
  }
}
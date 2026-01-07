import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface BingoCell {
  id: number;
  text: string;
  selected: boolean;
}

@Component({
  selector: 'app-bingo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bingo.component.html',
  styleUrls: ['./bingo.component.css']
})
export class BingoComponent implements OnInit {
  bingoGrid: BingoCell[][] = [];
  traits: string[] = [
    'Ne voli čokoladu',
    'Voli sir',
    'Voli crtati',
    'Voli horor filmove',
    'Ima psa',
    'Putovao u 3+ zemlje',
    'Zna svirati instrument',
    'Govori 2+ jezika',
    'Voli kuhanje',
    'Hobi je fotografija',
    'Voli planinarenje',
    'Čita knjige',
    'Igra video igrice',
    'Voli plesati',
    'Pjeva u tušu',
    'Ne pije kafu',
    'Vegetarijanac',
    'Voli plavu boju',
    'Nosio je naočale',
    'Ima mačku',
    'Voli jutarnju rutinu',
    'Noćna ptica',
    'Voli kišu',
    'Sakuplja nešto',
    'Voli čaj više od kafe'
  ];
  gameStarted = false;
  bingoWon = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
  
  }

  startGame(): void {
    this.gameStarted = true;
    this.bingoWon = false;
    this.createBingoGrid();
  }

  createBingoGrid(): void {
    this.bingoGrid = [];
    const shuffledTraits = [...this.traits].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 5; i++) {
      const row: BingoCell[] = [];
      for (let j = 0; j < 5; j++) {
        const index = i * 5 + j;
        row.push({
          id: index,
          text: shuffledTraits[index],
          selected: false
        });
      }
      this.bingoGrid.push(row);
    }
    
    this.bingoGrid[2][2].selected = true;
    this.bingoGrid[2][2].text = 'FREE';
  }

  toggleCell(rowIndex: number, colIndex: number): void {
    if (!this.gameStarted || this.bingoWon || (rowIndex === 2 && colIndex === 2)) return;
    
    this.bingoGrid[rowIndex][colIndex].selected = !this.bingoGrid[rowIndex][colIndex].selected;
    
    setTimeout(() => {
      this.checkBingo();
    }, 100);
  }

  checkBingo(): void {
    if (this.bingoWon) return;

    let hasBingo = false;

    for (let i = 0; i < 5; i++) {
      if (this.bingoGrid[i].every(cell => cell.selected)) {
        hasBingo = true;
        break;
      }
    }

    if (!hasBingo) {
      for (let j = 0; j < 5; j++) {
        if (this.bingoGrid.every(row => row[j].selected)) {
          hasBingo = true;
          break;
        }
      }
    }

    if (!hasBingo) {
      if (this.bingoGrid.every((row, index) => row[index].selected)) {
        hasBingo = true;
      }
    }

    if (!hasBingo) {
      if (this.bingoGrid.every((row, index) => row[4 - index].selected)) {
        hasBingo = true;
      }
    }

    if (hasBingo) {
      this.bingoWon = true;
      setTimeout(() => {
        if (confirm('BINGO! Pobijedili ste! Želite li igrati ponovo?')) {
          this.resetGame();
        }
      }, 300);
    }
  }

  resetGame(): void {
    this.gameStarted = false;
    this.bingoWon = false;
    this.bingoGrid = [];
  }

  goBack(): void {
    this.router.navigate(['/fun-zone']);
  }

  getSelectedCount(): number {
    return this.bingoGrid.flat().filter(cell => cell.selected).length;
  }
}
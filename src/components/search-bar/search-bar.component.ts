// src/app/components/search-bar/search-bar.component.ts

import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

const DEBOUNCE_DELAY = 300;
@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-bar">
      <div class="search-input-container">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (input)="onSearchInput()"
          [placeholder]="placeholder"
          class="search-input"
          [class.has-value]="searchQuery.length > 0" />
        <div class="search-icons">
          <svg
            *ngIf="searchQuery.length === 0"
            class="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <button
            *ngIf="searchQuery.length > 0"
            (click)="clearSearch()"
            class="clear-button"
            type="button"
            aria-label="Clear search">
            <svg class="clear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      <div *ngIf="showSuggestions && suggestions.length > 0" class="suggestions">
        <div
          tabindex="0"
          *ngFor="let suggestion of suggestions; trackBy: trackBySuggestion"
          (click)="selectSuggestion(suggestion)"
          (keyup.esc)="selectSuggestion(suggestion)"
          class="suggestion-item">
          {{ suggestion }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .search-bar {
        position: relative;
        width: 100%;
        max-width: 500px;
      }

      .search-input-container {
        position: relative;
        display: flex;
        align-items: center;
      }

      .search-input {
        width: 100%;
        padding: 12px 16px;
        padding-right: 48px;
        border: 2px solid #e1e5e9;
        border-radius: 8px;
        font-size: 16px;
        transition: all 0.2s ease;
        background: white;
      }

      .search-input:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
      }

      .search-input.has-value {
        border-color: #007bff;
      }

      .search-icons {
        position: absolute;
        right: 12px;
        display: flex;
        align-items: center;
      }

      .search-icon {
        width: 20px;
        height: 20px;
        color: #6c757d;
      }

      .clear-button {
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease;
      }

      .clear-button:hover {
        background-color: #f8f9fa;
      }

      .clear-icon {
        width: 16px;
        height: 16px;
        color: #6c757d;
      }

      .suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #e1e5e9;
        border-top: none;
        border-radius: 0 0 8px 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        max-height: 200px;
        // overflow-y: auto;
      }

      .suggestion-item {
        padding: 12px 16px;
        cursor: pointer;
        transition: background-color 0.2s ease;
        border-bottom: 1px solid #f8f9fa;
      }

      .suggestion-item:hover {
        background-color: #f8f9fa;
      }

      .suggestion-item:last-child {
        border-bottom: none;
      }

      @media (max-width: 768px) {
        .search-input {
          font-size: 16px; /* Prevents zoom on iOS */
        }
      }
    `,
  ],
})
export class SearchBarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  @Input() public placeholder = 'Search products...';
  @Input() public suggestions: string[] = [];
  @Input() public showSuggestions = false;
  @Input() public initialValue = ''; // Add this input property
  @Output() public searchQuerry = new EventEmitter<string>();
  @Output() public clear = new EventEmitter<void>();

  public searchQuery = '';

  public ngOnInit(): void {
    // Set initial value if provided
    if (this.initialValue) {
      this.searchQuery = this.initialValue;
    }

    // Debounce search input
    this.searchSubject
      .pipe(takeUntil(this.destroy$), debounceTime(DEBOUNCE_DELAY), distinctUntilChanged())
      .subscribe(query => {
        this.searchQuerry.emit(query);
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  public clearSearch(): void {
    this.searchQuery = '';
    this.searchQuerry.emit('');
    this.clear.emit();
  }

  public selectSuggestion(suggestion: string): void {
    this.searchQuery = suggestion;
    this.searchQuerry.emit(suggestion);
  }

  public trackBySuggestion(index: number, suggestion: string): string {
    return suggestion;
  }
}

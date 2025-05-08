import { Injectable } from '@angular/core';

interface TokenStore {
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  tokens = 'tokens_commerce_technik';
  setTokens(tokens: Partial<TokenStore>) {
    const listToken = { accessToken: '', refreshToken: '', ...tokens };
    localStorage.setItem(this.tokens, JSON.stringify(listToken));
  }
  getTokens(): TokenStore {
    const tokens = JSON.parse(localStorage.getItem(this.tokens) || '');
    return tokens || { accessToken: '', refreshToken: '' };
  }
}

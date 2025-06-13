import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../services/api.service';
import { JsonPipe, NgClass } from '@angular/common';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatMenuItem, MatMenuModule } from '@angular/material/menu';
import { MatButton, MatButtonModule, MatFabAnchor, MatFabButton, MatIconButton } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { MenuItemComponent } from '../../components/menu/menu-item/menu-item.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface PeriodicElement {
  price: string;
  product: number;
  quantity: number;
  total: string;
}
interface Reference {
  typeId: string;
  id: string;
}

interface CustomerReference {
  typeId: 'customer';
  id: string;
}

interface CreatedByModifiedBy {
  clientId: string;
  isPlatformClient: boolean;
  customer?: CustomerReference;
}

interface Money {
  type: 'centPrecision';
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

interface DiscountTypeCombination {
  type: 'Stacking' | 'Combination' | 'Exclusion';
}

export interface LineItem {
  id: string;
  productId: string;
  name: Record<string, string>;
  variant: {
    id: number;
    images: { url: string }[];
    sku?: string;
    key?: string;
    prices?: {
      id?: string;
      value: Money;
    }[];
    attributes?: {
      name: string;
      value: unknown;
    }[];
  };
  price: {
    id?: string;
    value: Money;
    discounted?: {
      value: Money;
      discount: Reference;
    };
  };
  quantity: number;
  discountedPricePerQuantity?: {
    quantity: number;
    discountedPrice: {
      value: Money;
      includedDiscounts: {
        discount: Reference;
        discountedAmount: Money;
      }[];
    };
  }[];
  state: {
    quantity: number;
    state: Reference;
  }[];
  taxRate?: {
    name: string;
    amount: number;
    includedInPrice: boolean;
    country: string;
    id?: string;
    subRates?: {
      name: string;
      amount: number;
    }[];
  };
  totalPrice: Money;
}

export interface Cart {
  id: string;
  version: number;
  createdAt: string;
  lastModifiedAt: string;
  lastMessageSequenceNumber: number;
  cartState: 'Active' | 'Merged' | 'Ordered' | 'Frozen';
  country: string;
  origin: 'Customer' | 'Merchant';
  createdBy?: CreatedByModifiedBy;
  lastModifiedBy?: CreatedByModifiedBy;
  customLineItems: unknown[];
  lineItems: LineItem[];
  totalPrice: Money;
  shippingMode: 'Single' | 'Multiple';
  shipping?: unknown[];
  taxMode: 'Platform' | 'External' | 'Disabled';
  taxRoundingMode: 'HalfEven' | 'HalfUp' | 'HalfDown';
  taxCalculationMode: 'LineItemLevel' | 'UnitPriceLevel';
  inventoryMode: 'None' | 'TrackOnly' | 'ReserveOnOrder';
  discountCodes: {
    discountCode: Reference;
    state:
      | 'NotActive'
      | 'DoesNotMatchCart'
      | 'MatchesCart'
      | 'MaxApplicationReached'
      | 'ApplicationStoppedByPreviousDiscount';
  }[];
  directDiscounts: unknown[];
  refusedGifts: Reference[];
  deleteDaysAfterLastModification?: number;
  itemShippingAddresses: unknown[];
  discountTypeCombination: DiscountTypeCombination;
  priceRoundingMode: 'HalfEven' | 'HalfUp' | 'HalfDown';
  versionModifiedAt: string;
  type: 'Cart';
}

interface ItemView {
  id: string;
  productId: string;
  image: string;
  title: string;
  price: string;
  quantity: number;
  total: string;
}

@Component({
  selector: 'app-cart',
  imports: [
    MatTableModule,
    JsonPipe,
    MatIcon,
    MatMenuItem,
    MatButton,
    MatIcon,
    MatButtonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatIconModule,
    RouterLink,
    MenuItemComponent,
    NgClass,
    MatIconButton,
    MatIcon,
    MatMenuModule,
    MatFabButton,
    MatFabAnchor,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  public displayedColumns: string[] = ['image', 'title', 'price', 'quantity', 'total', 'actions'];
  public dataSource: unknown[] = [];
  private _cart: Cart | null = null;
  public isApplayPromo = false;
  public codeForm: FormGroup;
  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.codeForm = this.fb.group({
      code: ['', Validators.required],
    });
  }

  public ngOnInit(): void {
    this.api.getCodeDiscount().subscribe(console.log);
    this.api.getCarts().subscribe(result => {
      const cart = result?.results?.[0];
      if (cart) {
        this.updateCartData(cart);
      } else {
        this.createCart();
      }
    });
  }

  public createCart(): void {
    this.api.createCart().subscribe(response => {
      this.updateCartData(response as Cart);
    });
  }

  private updateCartData(cart: Cart): void {
    this.cart = cart;
    this.dataSource = cart.lineItems.map(item => this.mapLineItemToTableItem(item));
  }

  private mapLineItemToTableItem(item: LineItem): ItemView {
    return {
      productId: item.productId,
      id: item.id,
      image: item.variant.images[0]?.url || 'assets/no-image.svg',
      title: Object.values(item.name)[0] || 'No name',
      price: this.formatPrice(item.price.discounted?.value || item.price.value),
      quantity: item.quantity,
      total: this.formatPrice(item.totalPrice),
    };
  }

  public formatPrice(price: Money): string {
    // eslint-disable-next-line no-magic-numbers
    const amount = price.centAmount / Math.pow(10, price.fractionDigits);
    return `${amount.toFixed(price.fractionDigits)} ${price.currencyCode}`;
  }
  public increaseQuantity(item: ItemView): void {
    if (this.cart) {
      this.api.updateCart(this.cart.id, item.productId, this.cart.version).subscribe(response => {
        this.cart = response as Cart;
      });
    }
  }

  public decreaseQuantity(item: ItemView): void {
    if (this.cart) {
      this.api
        .changeQuantity(this.cart?.id, item.id, this.cart.version, Math.max(item.quantity - 1, 0))
        .subscribe(response => {
          console.log(response);
          this.cart = response as Cart;
        });
    }
  }

  public removeItem(item: ItemView): void {
    if (this.cart) {
      this.api.removeItemCart(this.cart?.id, item.id, this.cart.version).subscribe(response => {
        console.log(response);
        this.cart = response as Cart;
      });
    }
  }
  public clearCart(): void {
    if (this.cart) {
      this.api.clearCart(this.cart.id, this.cart.lineItems, this.cart?.version).subscribe(response => {
        console.log(response);
        this.cart = response as Cart;
      });
    }
  }
  public get cart(): Cart | null {
    return this._cart;
  }
  public set cart(value: Cart | null) {
    this._cart = value;
    if (value) {
      this.dataSource = value.lineItems.map(item => this.mapLineItemToTableItem(item));
    }
  }
  public applyCode(): void {
    console.log(this.codeForm.value);
    if (this.cart) {
      if (!this.isApplayPromo) {
        this.api
          .applyCode(this.cart.id, this.codeForm.value.code || '', this.cart.version)
          .pipe(
            catchError(err => {
              this.showError('Promo code is not valid');
              return throwError(() => err);
            })
          )
          .subscribe(response => {
            console.log(response);
            this.isApplayPromo = true;
            this.cart = response as Cart;
          });
      } else {
        this.api
          .removeCode(this.cart.id, this.cart.discountCodes[0].discountCode, this.cart.version)
          .subscribe(response => {
            console.log(response);
            this.isApplayPromo = false;
            this.cart = response as Cart;
          });
      }
    }
  }
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 2000,
      panelClass: ['error-snackbar'],
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 2000,
      panelClass: ['success-snackbar'],
    });
  }
}

import { Component, Input, OnInit, signal, Signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { APP_TITLE } from '../../constants/app.title';
import { ProductService } from '../../services/product.service';
import { Attribute, Product } from '../../models/product.model';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ModalImagesComponent } from '../../components/modal-images/modal-images.component';

@Component({
  selector: 'app-product',
  imports: [MatButton],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductComponent implements OnInit {
  @Input() public id!: string;
  public product: Signal<Product> = signal({
    id: '',
    name: '',
    description: '',
    images: [],
    price: {
      original: {
        centAmount: 0,
        currencyCode: '',
        fractionDigits: 1,
        formatted: '',
      },
      hasDiscount: false,
    },
    slug: '',
    attributes: [],
  });
  public readonly attributesMap = new Map([
    ['cpu-cores', 'Number of cores'],
    ['cpu-threads', 'Number of threads'],
    ['cpu-manufacturer', 'Manufacturer'],
    ['cpu-core-clock', 'Base Clock'],
    ['cpu-core-clock-boost', 'Turbo Clock'],
    ['cpu-tdp', 'TDP'],
    ['cpu-socket', 'Socket'],
    ['cpu-graphics', 'Integrated graphics'],
  ]);

  public selectedPicture = '';
  public hasDiscount = false;
  public productSlug = '';

  constructor(
    private title: Title,
    private productService: ProductService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  public ngOnInit(): void {
    this.productService.getProductById(this.id).subscribe(product => {
      if (product) {
        this.product = signal(product);
        console.log(product);
        this.title.setTitle(`Product ${this.productName} - ${APP_TITLE}`);
        this.selectedPicture = this.product().images[0];
        this.hasDiscount = this.product().price.hasDiscount;
        this.productSlug = this.product().slug;
      }
    });
  }
  public openModal(): void {
    const dialogRef = this.dialog.open(ModalImagesComponent, {
      data: { images: this.product().images },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);
    });
  }

  public get productName(): string {
    return this.product().name;
  }

  public get productDescription(): string {
    return this.product().description;
  }

  public get productPictures(): string[] {
    return this.product().images;
  }

  public get productPrice(): string {
    return this.product().price.original.formatted;
  }

  public get productPriceDiscounted(): string {
    const discounted = this.product().price.discounted;
    return discounted ? discounted.formatted : '';
  }

  public get productAttributes(): Attribute[] {
    return this.product().attributes;
  }

  public get productManufacturer(): string {
    const manufacturer = this.product().attributes.filter(e => e.name === 'cpu-manufacturer')[0].value;
    return typeof manufacturer === 'object' ? manufacturer.label : '';
  }

  public selectPicture(index: number): void {
    this.selectedPicture = this.product().images[index];
  }
}

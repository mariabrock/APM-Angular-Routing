import { Component, inject, OnInit } from '@angular/core';

import { MessageService } from '../../messages/message.service';

import { Product, ProductResolved } from '../product';
import { ProductService } from '../product.service';
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit {
  pageTitle = 'Product Edit';
  errorMessage: string | undefined = '';

  private dataIsValid: { [key: string]: boolean | undefined } = {};

  get isDirty(): boolean {
    return JSON.stringify(this.originalProduct) !== JSON.stringify(this.currentProduct);
  }
  // for right now, a string match works because we are comparing something simple
  // for anything more complex, we'll want to walk through all properties of both products
  // and compare their values

  private currentProduct: Product | null = null;
  private originalProduct: Product | null = null;

  private productService = inject(ProductService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);

  get product(): Product | null  {
    return this.currentProduct;
  }

  set product(value: Product | null) {
    this.currentProduct = value;
    // clone the object to retain a copy
    this.originalProduct = value ? { ...value } : null;
  }

  constructor() { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      const resolvedData: ProductResolved = data['resolvedData'];
      this.errorMessage = resolvedData.error;
      this.onProductRetrieved(resolvedData.product);
    })
  }

  onProductRetrieved(product: Product | null): void {
    this.product = product;

    if (!this.product) {
      this.pageTitle = 'No product found';
    } else {
      if (this.product.id === 0) {
        this.pageTitle = 'Add Product';
      } else {
        this.pageTitle = `Edit Product: ${this.product.productName}`;
      }
    }
  }

  deleteProduct(): void {
      if (!this.product || !this.product.id) {
        // Don't delete, it was never saved.
        this.onSaveComplete(`${this.product?.productName} was deleted`);
      } else {
        if (confirm(`Really delete the product: ${this.product.productName}?`)) {
          this.productService.deleteProduct(this.product.id).subscribe({
            next: () => this.onSaveComplete(`${this.product?.productName} was deleted`),
            error: err => this.errorMessage = err
          });
        }
      }
  }

  isValid(path?: string): boolean {
    this.validate();
    if(path) {
      return <boolean>this.dataIsValid[path];
    }
    return (this.dataIsValid &&
    Object.keys(this.dataIsValid).every(d => this.dataIsValid[d] === true));
  }

  reset() {
    this.dataIsValid = {};
    this.currentProduct = null;
    this.originalProduct = null;
  }

  saveProduct(): void {
    if (this.product && this.isValid()) {
      if (this.product.id === 0) {
        this.productService.createProduct(this.product).subscribe({
          next: () => this.onSaveComplete(`The new ${this.product?.productName} was saved`),
          error: err => this.errorMessage = err
        });
      } else {
        this.productService.updateProduct(this.product).subscribe({
          next: () => this.onSaveComplete(`The updated ${this.product?.productName} was saved`),
          error: err => this.errorMessage = err
        });
      }
    } else {
      this.errorMessage = 'Please correct the validation errors.';
    }
  }

  onSaveComplete(message?: string): void {
    if (message) {
      this.messageService.addMessage(message);
    }
    this.reset();

    // Navigate back to the product list
    this.router.navigate(['/products']);
  }

  validate() {
    this.dataIsValid = {};

    //info tab
    if(this.product?.productName &&
      this.product.productName.length >= 3 &&
    this.product.productCode) {
      this.dataIsValid['info'] = true;
    } else {
      this.dataIsValid['tags'] = false;
    }

    // tags tab
    if (this.product?.category &&
    this.product.category.length >=3) {
      this.dataIsValid['tags'] = true;
    } else {
      this.dataIsValid['info'] = false;
    }
  }
}


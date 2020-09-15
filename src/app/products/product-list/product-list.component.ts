import { Component, OnInit, OnDestroy } from '@angular/core';
import { Product } from 'src/app/models/product.model';
import { ProductService } from 'src/app/models/product.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[];
  selectedProduct: Product | null;
  displayCode: boolean;
  errorMessage: string;
  sub: Subscription;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.sub = this.productService.getProducts().subscribe({
      next: (products: Product[]) => this.products = products,
      error: err => this.errorMessage = err
    });
  }

  productSelected(product: Product): void {
    this.productService.changeSelectedProduct(product);
  }

  checkChanged(): void {
    this.displayCode = !this.displayCode;
  }

  newProduct(): void {
    this.productService.changeSelectedProduct(this.productService.newProduct());
  }

  ngOnDestroy(): void {
    console.log('Destroy');
    this.sub.unsubscribe();
  }
}

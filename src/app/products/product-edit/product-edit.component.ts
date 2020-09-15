import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ProductService } from 'src/app/models/product.service';
import { Product } from 'src/app/models/product.model';
import { NumberValidators } from '../../shared/number.validator';
import { GenericValidator } from 'src/app/shared/generic-validator';

@Component({
    selector: 'app-product-edit',
    templateUrl: './product-edit.component.html',
    styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit, OnDestroy {
    sub: Subscription;
    productForm: FormGroup;

    product: Product | null;
    displayMessage: { [key: string]: string } = {};
    private validationMessages: { [key: string]: { [key: string]: string }};
    private genericValidator: GenericValidator;

    errorMessage = '';
    pageTitle = '';

    constructor(private fb: FormBuilder, private productService: ProductService) {
        this.validationMessages = {
            productName: {
                required: 'Product name is required.',
                minLength: 'Product name must be at least three characters.',
                maxLength: 'Product name can not exceed 50 characters'
            },
            productCode: {
                required: 'Product code is required.'
            },
            starRating: {
                range: 'Rate the product between 1(lowest) and 5(highest).'
            }
        };
        this.genericValidator = new GenericValidator(this.validationMessages);
    }

    ngOnInit(): void {
        this.productForm = this.fb.group({
            productName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
            productCode: ['', [Validators.required]],
            starRating: [0, NumberValidators.range(1, 5)],
            description: ''
        });
        this.sub = this.productService.selectedProductChanges$.subscribe(currentProduct => {
            console.log(currentProduct);
            this.displayProduct(currentProduct);
        });
        this.productForm.valueChanges.subscribe(() => {
            this.displayMessage = this.genericValidator.processMessages(this.productForm);
            console.log(this.displayMessage);
        });
    }

    displayProduct(product: Product): void {
        this.product = product;
        if (product) {
            if (product.id === 0) {
                this.pageTitle = 'Add Product';
            } else {
                this.pageTitle = `Edit Product: ${product.productName}`;
            }

            this.productForm.patchValue({
                productName: product.productName,
                productCode: product.productCode,
                starRating: product.starRating,
                description: product.description
            });
        }
    }

    saveProduct(originalProduct: Product): void {
        if (this.productForm.valid) {
            if (this.productForm.dirty) {
                const product = { ...originalProduct, ...this.productForm.value };
                console.log(product);
                if (product.id === 0) {
                    this.productService.createProduct(product).subscribe({
                        next: p => this.productService.changeSelectedProduct(p),
                        error: err => this.errorMessage = err
                      });
                } else {
                    this.productService.updateProduct(product).subscribe({
                        next: p => this.productService.changeSelectedProduct(p),
                        error: err => this.errorMessage = err
                    });
                }
            }
        }
    }

    blur(): void { }

    cancelEdit(product: Product): void {
        this.displayProduct(product);
    }

    deleteProduct(product: Product): void {
        if (product && product.id) {
            if (confirm(`Really delete the product: ${product.productName}?`)) {
              this.productService.deleteProduct(product.id).subscribe({
                next: () => this.productService.changeSelectedProduct(null),
                error: err => this.errorMessage = err
              });
            }
          } else {
            this.productService.changeSelectedProduct(null);
          }
    }
    ngOnDestroy(): void {
        this.sub.unsubscribe();
        console.log('on destroy');
    }
}

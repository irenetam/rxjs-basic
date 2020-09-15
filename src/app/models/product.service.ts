import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Product } from './product.model';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

@Injectable()
export class ProductService {
    private productsUrl = 'https://5f5add4b044570001674c3a7.mockapi.io/api/v1/product';
    selectedProductSource = new BehaviorSubject<Product | null>(null);
    selectedProductChanges$ = this.selectedProductSource.asObservable();
    private products: Product[];

    constructor(private http: HttpClient) { }

    changeSelectedProduct(selectedProduct: Product | null): void {
        this.selectedProductSource.next(selectedProduct);
    }

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.productsUrl)
            .pipe(
                tap(data => this.products = data),
                catchError(this.handleError)
            );
    }

    newProduct(): Product {
        return {
            id: 0,
            productName: '',
            productCode: 'New',
            description: '',
            starRating: 0
        };
    }

    createProduct(product: any): Observable<Product> {
        const headers = new HttpHeaders({ 'Content-Type': 'applications/json'});
        const newProduct = { ...product, id: null };
        return this.http.post<Product>(this.productsUrl, newProduct, { headers })
        .pipe(
            tap(data => console.log('createProduct: ' + JSON.stringify(data))),
            tap(data => {
              this.products.push(data);
            }),
            catchError(this.handleError)
          );
    }

    updateProduct(product: any): Observable<Product> {
        const headers = new HttpHeaders({ 'Content-Type': 'applications/json'});
        const url = `${this.productsUrl}/${product.id}`;
        console.log(url);
        return this.http.put<Product>(url, product, { headers })
        .pipe(
            tap(data => console.log('updateroduct: ' + product.id)),
            tap(data => {
                const foundIndex = this.products.findIndex(item => item.id === product.id);
                if (foundIndex > -1) {
                  this.products[foundIndex] = product;
                }
            }),
            map(() => product),
            catchError(this.handleError)
          );
    }

    deleteProduct(id: number): Observable<{}> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const url = `${this.productsUrl}/${id}`;
        return this.http.delete<Product>(url, { headers })
          .pipe(
            tap(data => console.log('deleteProduct: ' + id)),
            tap(data => {
              const foundIndex = this.products.findIndex(item => item.id === id);
              if (foundIndex > -1) {
                this.products.splice(foundIndex, 1);
              }
            }),
            catchError(this.handleError)
          );
      }

    private handleError(err: any): Observable<never> {
        // in a real world app, we may send the server to some remote logging infrastructure
        // instead of just logging it to the console
        let errorMessage: string;
        if (err.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            errorMessage = `An error occurred: ${err.error.message}`;
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
        }
        console.error(err);
        return throwError(errorMessage);
    }
}

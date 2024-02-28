import { inject, Injectable } from '@angular/core';
import { ProductService } from "./product.service";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { ProductResolved } from "./product";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ProductResolver implements Resolve<ProductResolved>{

  private productService = inject(ProductService);

  constructor() { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ProductResolved> {
    const id = route.paramMap.get('id');
    if(isNaN(Number(id))) {
      const message = `Product id was not a number: ${id}`;
      console.error(message);
      return of({product: null, error:message})
    }

    return this.productService.getProduct(Number(id))
      .pipe(
        map(product => ({product: product, error: ''})),
        catchError(error => {
          const message = `Retrieval error: ${error}`;
          console.error(message);
          return of({product: null, error: message});
        })
      );
  }

}

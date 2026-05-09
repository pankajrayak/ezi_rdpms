import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConstantUtil {
  
  public static readonly ERRORS = {
    NETWORK: 'NETWORK ERROR',
    SERVER: 'INTERNAL SERVER ERROR',
    GENERAL: 'SOME ERROR OCCURRED',
  } as const;

}

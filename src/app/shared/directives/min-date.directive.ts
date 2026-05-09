import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[minDate]',
  standalone: true,
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: MinDateDirective,
    multi: true
  }]
})
export class MinDateDirective implements Validator, OnChanges {
  @Input('minDate') compareTarget: any;

  private onChange?: () => void;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['compareTarget'] && this.onChange) {
      this.onChange();
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const fromDateValue = this.compareTarget?.value !== undefined 
      ? this.compareTarget.value 
      : this.compareTarget;

    const toDateValue = control.value;

    if (fromDateValue && toDateValue && new Date(toDateValue) <= new Date(fromDateValue)) {
      return { dateRangeInvalid: true };
    }
    
    return null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onChange = fn;
  }
}

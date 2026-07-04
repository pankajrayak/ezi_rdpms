import { Component, ElementRef, Pipe, PipeTransform, HostBinding, Input, Optional, Self, ContentChildren, QueryList, AfterContentInit, Directive, NgModule, signal, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Pipe({ name: 'filter', standalone: true })
export class FilterOptionPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items || !searchText) return items;
    return items.filter((item) => item.label.toLowerCase().includes(searchText.toLowerCase()));
  }
}

@Directive({
  selector: 'multi-select option',
})
export class MultiSelectOptionDirective {
  @Input() value: any;
  @Input() ngValue: any;

  constructor(public el: ElementRef<HTMLOptionElement>) {}

  get actualValue() {
    if (this.value) {
      return typeof this.value === 'object' ? String(this.value) : this.value;
    }
    if (this.ngValue) {
      return this.ngValue;
    }
    return this.label;
  }

  get label(): string {
    return this.el.nativeElement.textContent?.trim() ?? '';
  }

  get disabled(): boolean {
    return this.el.nativeElement.disabled;
  }

  get selected(): boolean {
    return this.el.nativeElement.selected;
  }
}

@Component({
  selector: 'multi-select',
  templateUrl: './multi-select-component.html',
  styleUrl: './multi-select-component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule],
  // providers: [
  //   {
  //     provide: NG_VALUE_ACCESSOR,
  //     useExisting: forwardRef(() => MultiSelectComponent),
  //     multi: true
  //   }
  // ]
})
export class MultiSelectComponent implements ControlValueAccessor, AfterContentInit, AfterViewInit {
  @ContentChildren(MultiSelectOptionDirective, { descendants: true })
  options!: QueryList<MultiSelectOptionDirective>;
  @HostBinding('class.disabled') get isDisabled() {
    return this.disabled;
  }
  @Input() placeholder = 'Select Options';
  @Input() enableSelectAll = false;
  @Input() enableSearch = false;
  @Input() showCheckbox = true;

  availableOptions: any[] = [];
  value: any[] = [];
  disabled = false;
  searchText = signal('');

  constructor(@Self() @Optional() public ngControl: NgControl, public el: ElementRef<HTMLElement>) {
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  onTouched = () => {};
  onChange = (v: any) => {};
  writeValue(v: any[]) { this.value = v || []; }
  registerOnChange(fn: any) { this.onChange = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }
  setDisabledState(d: boolean) { this.disabled = d; }

  ngAfterContentInit() {
    this.options.changes.subscribe(() => {
      this.buildOptions();
    });
  }

  ngAfterViewInit() {
    this.buildOptions();
  }

  private buildOptions() {
    this.availableOptions = this.options.map((opt) => ({
      label: opt.label,
      value: opt.actualValue,
      disabled: opt.disabled,
      selected: opt.selected,
    }));
  }

  compareWith = (a: any, b: any) => {
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    return a === b;
  };

  isSelected(val: any): boolean {
    return this.value?.some((v) => this.compareWith(v, val));
  }

  toggle(val: any) {
    if (this.isSelected(val)) {
      this.value = this.value.filter((v) => !this.compareWith(v, val));
    } else {
      this.value = [...this.value, val];
    }
    this.onChange(this.value);
    this.onTouched();
  }

  isAllSelected(): boolean {
    const enabled = this.availableOptions.filter((o) => !o.disabled);
    return enabled.length > 0 && enabled.every((o) => this.isSelected(o.value));
  }

  toggleAll(ev: any) {
    const checked = ev.target.checked;
    this.value = checked
      ? this.availableOptions.filter((o) => !o.disabled).map((o) => o.value)
      : [];

    this.onChange(this.value);
    this.onTouched();
  }

  isIndeterminate(): boolean {
    const enabled = this.availableOptions.filter((o) => !o.disabled);
    const selectedCount = enabled.filter((o) => this.isSelected(o.value)).length;

    return selectedCount > 0 && selectedCount < enabled.length;
  }

  getLabel() {
    if (!this.value?.length) {
      return this.placeholder;
    }

    if (this.value.length === 1) {
      return this.getLabelByValue(this.value[0]);
    }

    const first = this.getLabelByValue(this.value[0]);
    return `${first} + ${this.value.length - 1} more`;
  }

  getLabelByValue(val: any): string {
    const match = this.availableOptions.find((o) => this.compareWith(o.value, val));
    return match ? match.label : '';
  }

  getSortedOptions() {
    const selected = this.availableOptions.filter((o) => this.isSelected(o.value));
    const unselected = this.availableOptions.filter((o) => !this.isSelected(o.value));

    const sortedSelected = [...selected].sort((a, b) => a.label.localeCompare(b.label));
    const sortedUnselected = [...unselected].sort((a, b) => a.label.localeCompare(b.label));

    return [...sortedSelected, ...unselected];
  }

  get filteredOptions() {
    const term = this.searchText().toLowerCase();
    const options = this.getSortedOptions();

    if (!term) {
      return options;
    }
    return options.filter((o) => o.label.toLowerCase().includes(term));
  }

  onBlur() {
    this.onTouched();
  }

  onFocus() {
    this.searchText.set('');
  }
}

@NgModule({
  imports: [MultiSelectComponent, MultiSelectOptionDirective],
  exports: [MultiSelectComponent, MultiSelectOptionDirective],
})
export class MultiSelectDirectiveModule {}

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HasUnsavedChanges } from '@rdpms/core/interfaces';
import { PageHeaderComponent, MultiSelectDirectiveModule } from '@rdpms/shared/components';
import { DataService, GlobalUtility } from '@rdpms/shared/utility';

@Component({
  selector: 'home-component',
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, MultiSelectDirectiveModule],
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss',
})
export class HomeComponent implements HasUnsavedChanges {
  private fb = inject(NonNullableFormBuilder);
  private dataService = inject(DataService);
  public globalUtility = inject(GlobalUtility);
  private destroyRef = inject(DestroyRef);

  lists = {
    zones: [] as any[],
    divisions: [] as any[],
    stations: [] as any[],
  };

  searchForm: FormGroup = this.fb.group({
    zone: [{ value: '', disabled: true }, Validators.required],
    division: [{ value: '', disabled: true }, { validators: [Validators.required] }],
    station: [{ value: '', disabled: true }, Validators.compose([Validators.required])],
  });

  topCards: any = [];
  sideCards: any = [];

  constructor() {
    this.calculateLayout();
  }

  hasUnsavedChanges(): boolean {
    return false;
  }

  get form() { return this.searchForm.controls; }
  get zoneCtrl() { return this.form['zone']; }
  get divisionCtrl() { return this.form['division']; }
  get stationCtrl() { return this.form['station']; }

  calculateLayout() {
    const n: number = this.assets.length;
    if (n === 0) { return; }

    let topCount = Math.max(4, Math.floor(n / 2) + 1);
    if (topCount > n) { topCount = n; }

    let sideCount = n - topCount;

    if (sideCount === 1 && topCount > 1) {
      topCount -= 1;
      sideCount += 1;
    }
    this.topCards = this.assets.slice(0, topCount);
    this.sideCards = this.assets.slice(topCount);
  }

  ngOnInit() {
    this.dataService.getZones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: any) => {
        this.lists.zones = res; this.zoneCtrl.enable();
      });
  }

  onZoneChange(): void {
    this.lists.divisions = [];
    this.lists.stations = [];
    this.divisionCtrl?.reset({ value: '', disabled: true });
    this.stationCtrl?.reset({ value: '', disabled: true });

    if (this.zoneCtrl?.valid && this.zoneCtrl.value) {
      this.dataService.getDivisions(this.zoneCtrl.value).subscribe((res: any) => {
        this.lists.divisions = res; this.divisionCtrl?.enable();
      });
    }
  }

  onDivisionChange() {
    this.lists.stations = [];
    this.stationCtrl.reset({ value: '', disabled: true });

    if (this.divisionCtrl?.valid && this.divisionCtrl.value) {
      this.dataService.getStations(this.divisionCtrl.value).subscribe((res: any) => {
        this.lists.stations = res; this.stationCtrl?.enable();
      });
    }
  }

  onSubmit() {
    if (!this.searchForm.valid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    this.searchForm.disable();
    const payload = this.searchForm.getRawValue();
    this.dataService.searchData(payload)
      .pipe(finalize(() => this.searchForm.enable()))
      .subscribe({
        next: (res) => console.log('Search complete', res),
        error: (err) => console.error('Search failed', err),
      });
  }

  // Dummy Data for the 7 specific assets requested
  assets = [
    { name: 'DC Track Circuit', healthy: 85, predictive: 10, failure: 5 },
    { name: 'Main Signal', healthy: 92, predictive: 5, failure: 3 },
    { name: 'Axle Counter', healthy: 78, predictive: 12, failure: 10 },
    { name: 'LC Gate', healthy: 60, predictive: 25, failure: 15 },
    { name: 'Point Machine', healthy: 88, predictive: 8, failure: 4 },
    { name: 'Sensor/IOT', healthy: 98, predictive: 2, failure: 0 },
    { name: 'Total Assets', healthy: 403, predictive: 60, failure: 37 },
  ];
}

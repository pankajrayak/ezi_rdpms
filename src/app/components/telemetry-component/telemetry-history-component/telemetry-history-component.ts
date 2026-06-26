import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '@rdpms/shared/components';
import { DataService } from '@rdpms/shared/utility';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-telemetry-history-component',
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './telemetry-history-component.html',
  styleUrl: './telemetry-history-component.scss',
})
export class TelemetryHistoryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dataService = inject(DataService);

  results: any;

  lists = {
    zones: [] as any[],
    divisions: [] as any[],
    stations: [] as any[],
    assetTypes: [] as any[],
    assetNumbers: ['1', '2'] as any[],
    views: ['Table', 'Pie', 'Bar', 'Graph'] as any[],
  };

  searchForm: FormGroup = this.fb.nonNullable.group({
    zone: [{ value: '', disabled: true }, Validators.required],
    division: [{ value: '', disabled: true }, Validators.required],
    station: [{ value: '', disabled: true }, Validators.required],
    assetType: [{ value: '', disabled: true }, Validators.required],
    assetNumber: ['', Validators.required],
    view: ['Table', Validators.required],
    fromDate: ['', Validators.required],
    fromTime: ['', Validators.required],
    toDate: [''],
    toTime: [''],
  });

  get form() { return this.searchForm.controls; }
  get zoneCtrl() { return this.form['zone']; }
  get divisionCtrl() { return this.form['division']; }
  get stationCtrl() { return this.form['station']; }
  get assetTypeCtrl() { return this.form['assetType']; }
  get assetNumberCtrl() { return this.form['assetNumber']; }
  get viewCtrl() { return this.form['view']; }
  get fromDateCtrl() { return this.form['fromDate']; }
  get fromTimeCtrl() { return this.form['fromTime']; }
  get toDateCtrl() { return this.form['toDate']; }
  get toTimeCtrl() { return this.form['toTime']; }

  ngOnInit() {
    this.dataService.getZones().subscribe((res) => {
      this.lists.zones = res; this.zoneCtrl.enable();
    });

    this.dataService.getAssetTypes().subscribe((res) => {
      this.lists.assetTypes = res; this.assetTypeCtrl.enable();
    });
  }

  onZoneChange() {
    this.lists.divisions = [];
    this.lists.stations = [];
    this.divisionCtrl?.reset({ value: '', disabled: true });
    this.stationCtrl?.reset({ value: '', disabled: true });

    if (this.zoneCtrl?.valid && this.zoneCtrl.value) {
      this.dataService.getDivisions(this.zoneCtrl.value).subscribe((res) => {
        this.lists.divisions = res; this.divisionCtrl?.enable();
      });
    }
  }

  onDivisionChange() {
    this.lists.stations = [];
    this.stationCtrl?.reset({ value: '', disabled: true });

    if (this.divisionCtrl?.valid && this.divisionCtrl.value) {
      this.dataService.getStations(this.divisionCtrl.value).subscribe((res) => {
        this.lists.stations = res; this.stationCtrl?.enable();
      });
    }
  }

  onStationChange() {}

  onSubmit() {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
    this.searchForm.disable();
    this.results = {};
    this.getData();
  }

  getData() {
    const formValue = this.searchForm.getRawValue();
    this.dataService.getPagedRecord(1, 10, formValue).pipe(
      finalize(() => this.searchForm.enable())
    ).subscribe({
      next: (results) => { this.results = results || {}; },
      error: (err) => console.error('Search failed:', err),
    });
  }

  resetForm() {
    this.searchForm.reset();
  }
}

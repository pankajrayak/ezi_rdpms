import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '@rdpms/shared/components';
import { DataService } from '@rdpms/shared/utility';
import { NgxPrintDirective } from 'ngx-print';
import { finalize } from 'rxjs';

@Component({
  selector: 'alert-summary-report-component',
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, NgxPrintDirective],
  templateUrl: './alert-summary-report-component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './alert-summary-report-component.scss',
})
export class AlertSummaryReportComponent {
  private fb = inject(FormBuilder);
  private dataService = inject(DataService);

  lists = {
    zones: [] as any[],
    divisions: [] as any[],
    stations: [] as any[],
    alertTypes: [] as any[],
    assetTypes: [] as any[],
  };

  searchForm: FormGroup = this.fb.nonNullable.group({
    zone: [{ value: '', disabled: true }, Validators.required],
    division: [{ value: '', disabled: true }, Validators.required],
    station: [{ value: '', disabled: true }, Validators.required],
    alertType: [{ value: 'All', disabled: true }, Validators.required],
    assetType: [{ value: 'All', disabled: true }, Validators.required],
    assetNumber: ['All', Validators.required],
    cause: ['All', Validators.required],
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
  get alertTypeCtrl() { return this.form['alertType']; }
  get assetTypeCtrl() { return this.form['assetType']; }
  get assetNumberCtrl() { return this.form['assetNumber']; }
  get causeCtrl() { return this.form['cause']; }
  get viewCtrl() { return this.form['view']; }
  get fromDateCtrl() { return this.form['fromDate']; }
  get fromTimeCtrl() { return this.form['fromTime']; }
  get toDateCtrl() { return this.form['toDate']; }
  get toTimeCtrl() { return this.form['toTime']; }

  ngOnInit() {
    this.dataService.getZones().subscribe((data: any) => {
      this.lists.zones = data;
      this.zoneCtrl.enable();
    });

    this.dataService.getAlertTypes().subscribe((data: any) => {
      this.lists.alertTypes = data;
      this.alertTypeCtrl.enable();
    });

    this.dataService.getAssetTypes().subscribe((data: any) => {
      this.lists.assetTypes = data;
      this.assetTypeCtrl.enable();
    });
  }

  onZoneChange(): void {
    this.lists.divisions = [];
    this.lists.stations = [];
    this.divisionCtrl?.reset({ value: '', disabled: true });
    this.stationCtrl?.reset({ value: '', disabled: true });

    if (this.zoneCtrl?.valid && this.zoneCtrl.value) {
      this.dataService.getDivisions(this.zoneCtrl.value).subscribe((data: any) => {
        this.lists.divisions = data;
        this.divisionCtrl?.enable();
      });
    }
  }

  onDivisionChange() {
    this.lists.stations = [];
    this.stationCtrl?.reset({ value: '', disabled: true });

    if (this.divisionCtrl?.valid && this.divisionCtrl.value) {
      this.dataService.getStations(this.divisionCtrl.value).subscribe((data: any) => {
        this.lists.stations = data;
        this.stationCtrl?.enable();
      });
    }
  }

  onStationChange() {}

  onAlertTypeChange() {}

  onAssetTypeChange() {}

  onAssetNumberChange() {}

  onCauseChange() {}

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

  records: any[] = [];
}

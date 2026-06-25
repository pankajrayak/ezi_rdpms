import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, TemplateRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { NgxPrintDirective } from 'ngx-print';
import { NgbActiveModal, NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderComponent } from '@rdpms/shared/components';
import { DataService } from '@rdpms/shared/utility';

@Component({
  selector: 'alert-live-component',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    NgxPrintDirective,
    NgbModalModule,
  ],
  templateUrl: './alert-live-component.html',
  styleUrl: './alert-live-component.scss',
})
export class AlertLiveComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modalService = inject(NgbModal);
  private dataService = inject(DataService);

  lists = {
    zones: [] as any[],
    divisions: [] as any[],
    stations: [] as any[],
    alertTypes: [] as any[],
    assetTypes: [] as any[],
    feedbackList: [] as any[],
  };

  searchForm: FormGroup = this.fb.nonNullable.group({
    zone: ['', Validators.required],
    division: [{ value: '', disabled: true }, Validators.required],
    station: [{ value: '', disabled: true }, Validators.required],
    alertType: ['All', Validators.required],
    assetType: ['All', Validators.required],
  });

  // Summary Metrics
  summary = { predictive: 12, failure: 5, total: 17 };

  get form() {
    return this.searchForm.controls;
  }
  get zoneCtrl() {
    return this.form['zone'];
  }
  get divisionCtrl() {
    return this.form['division'];
  }
  get stationCtrl() {
    return this.form['station'];
  }
  get alertTypeCtrl() {
    return this.form['alertType'];
  }
  get assetTypeCtrl() {
    return this.form['assetType'];
  }

  ngOnInit() {
    this.dataService.getZones().subscribe((data: any) => (this.lists.zones = data));
    this.dataService.getAlertTypes().subscribe((data: any) => (this.lists.alertTypes = data));
    this.dataService.getAssetTypes().subscribe((data: any) => (this.lists.assetTypes = data));

    this.lists.feedbackList = [
      'Wrong Sensor Reading',
      'Software Bug',
      'Temporaray Bug',
      'Other Reson',
    ];
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

  onSubmit() {
    if (!this.searchForm.valid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    this.searchForm.disable();
    const payload = this.searchForm.getRawValue();
    this.dataService
      .searchData(payload)
      .pipe(finalize(() => this.searchForm.enable()))
      .subscribe({
        next: (res) => console.log('Search complete', res),
        error: (err) => console.error('Search failed', err),
      });
  }

  openFeedbackModal(templateRef: TemplateRef<any>, record: any, feedbackType: string) {
    const modalRef = this.modalService.open(templateRef, {
      keyboard: false,
      centered: true,
      scrollable: true,
      fullscreen: false,
      animation: true,
      backdrop: 'static',
      size: 'md',
      role: 'alertdialog',
    });
    modalRef.result
      .then((reason: any) => {
        console.log(reason);
      })
      .catch((reason: any) => {
        console.log(reason);
      });
  }

  feedbackSubmit(form: NgForm, activeModal: NgbActiveModal) {
    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }
    console.log(form.value, activeModal);
    activeModal.close('success');
  }

  // Dummy Table Data
  records = [
    {
      sNo: 1,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 2,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 3,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 4,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 5,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 6,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 7,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 8,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 9,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 10,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 11,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 12,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 13,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 14,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 15,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 16,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 17,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 18,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 19,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 20,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 21,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 22,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 23,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 24,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 25,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 26,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 27,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 28,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 29,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 30,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 31,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 32,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 33,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 34,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 35,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 36,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 37,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 38,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 39,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 40,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
  ];
}

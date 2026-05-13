import { CommonModule } from '@angular/common';
import { Component, Injectable, signal } from '@angular/core';

@Component({
  selector: 'station-layout-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './station-layout-component.html',
  styleUrls: ['./station-layout-component.css'],
})
export class StationLayoutComponent {
  constructor(public rail: RailwayService) {}
}

/* =========================================================
   MODELS
========================================================= */

export interface Track {
  id: string;
  y: number;
  type: 'MAIN' | 'LOOP';
}

export interface Platform {
  id: string;

  x: number;
  width: number;

  mainTrack: string;
  loopTrack: string;
}

export interface Station {
  id: string;

  startX: number;
  endX: number;

  platforms: Platform[];
}

export interface Junction {
  id: string;

  startX: number;
  endX: number;

  fromTrack: string;
  toTrack: string;
}

export interface Train {
  id: string;

  x: number;
  y: number;

  speed: number;
  baseSpeed: number;

  color: string;

  trackId: string;
  targetTrack?: string;

  status: string;

  stopAtStation?: boolean;

  halted?: boolean;

  timer?: number;

  platformId?: string;

  lastStoppedPlatform?: string;
}

export interface SignalState {
  id: string;

  x: number;

  trackId: string;

  status: 'RED' | 'GREEN';
}

/* =========================================================
   SERVICE
========================================================= */

@Injectable({
  providedIn: 'root',
})
export class RailwayService {
  /* =========================================================
     TRACKS
  ========================================================= */

  tracks = signal<Track[]>([
    { id: 'MAIN-1', y: 80, type: 'MAIN' },
    { id: 'LOOP-1', y: 140, type: 'LOOP' },

    { id: 'MAIN-2', y: 240, type: 'MAIN' },
    { id: 'LOOP-2', y: 300, type: 'LOOP' },
  ]);

  /* =========================================================
     STATION
  ========================================================= */

  stations = signal<Station[]>([
    {
      id: 'CENTRAL',

      startX: 450,
      endX: 950,

      platforms: [
        {
          id: 'PF-1',

          x: 520,
          width: 250,

          mainTrack: 'MAIN-1',
          loopTrack: 'LOOP-1',
        },

        {
          id: 'PF-2',

          x: 520,
          width: 250,

          mainTrack: 'MAIN-2',
          loopTrack: 'LOOP-2',
        },
      ],
    },
  ]);

  /* =========================================================
     JUNCTIONS
  ========================================================= */

  junctions = signal<Junction[]>([
    // PF-1 ENTRY
    {
      id: 'J1',

      startX: 250,
      endX: 420,

      fromTrack: 'MAIN-1',
      toTrack: 'LOOP-1',
    },

    // PF-1 EXIT
    {
      id: 'J2',

      startX: 950,
      endX: 1120,

      fromTrack: 'LOOP-1',
      toTrack: 'MAIN-1',
    },

    // PF-2 ENTRY
    {
      id: 'J3',

      startX: 250,
      endX: 420,

      fromTrack: 'MAIN-2',
      toTrack: 'LOOP-2',
    },

    // PF-2 EXIT
    {
      id: 'J4',

      startX: 950,
      endX: 1120,

      fromTrack: 'LOOP-2',
      toTrack: 'MAIN-2',
    },
  ]);

  /* =========================================================
     SIGNALS
  ========================================================= */

  signals = signal<Record<string, SignalState>>(
    this.generateSignals()
  );

  /* =========================================================
     TRAINS
  ========================================================= */

  trains = signal<Train[]>([
    {
      id: 'EXP-101',

      x: 0,
      y: 80,

      speed: 4,
      baseSpeed: 4,

      trackId: 'MAIN-1',

      color: '#ff0055',

      status: 'RUNNING',

      stopAtStation: false,
    },

    {
      id: 'LOC-202',

      x: -300,
      y: 80,

      speed: 2,
      baseSpeed: 2,

      trackId: 'MAIN-1',

      color: '#00e5ff',

      status: 'RUNNING',

      stopAtStation: true,
    },

    {
      id: 'LOC-303',

      x: -700,
      y: 240,

      speed: 2,
      baseSpeed: 2,

      trackId: 'MAIN-2',

      color: '#ffee00',

      status: 'RUNNING',

      stopAtStation: true,
    },
  ]);

  logs = signal<string[]>([]);

  constructor() {
    this.startSimulation();
  }

  /* =========================================================
     SIMULATION LOOP
  ========================================================= */

  private startSimulation() {
    setInterval(() => {
      this.routeTrains();

      this.updateSignals();

      this.moveTrains();
    }, 40);
  }

  /* =========================================================
     SIGNAL GENERATOR
  ========================================================= */

  private generateSignals(): Record<
    string,
    SignalState
  > {
    const result: Record<
      string,
      SignalState
    > = {};

    this.tracks().forEach((track) => {
      for (let x = 100; x <= 1700; x += 100) {
        const id = `${track.id}-${x}`;

        result[id] = {
          id,
          x,
          trackId: track.id,
          status: 'GREEN',
        };
      }
    });

    return result;
  }

  /* =========================================================
     ROUTING
  ========================================================= */

  private routeTrains() {
    this.trains.update((all) =>
      all.map((train) => {
        // LOCAL -> LOOP
        if (
          train.stopAtStation &&
          train.trackId === 'MAIN-1' &&
          train.x > 150 &&
          train.x < 350
        ) {
          return {
            ...train,
            targetTrack: 'LOOP-1',
          };
        }

        if (
          train.stopAtStation &&
          train.trackId === 'MAIN-2' &&
          train.x > 150 &&
          train.x < 350
        ) {
          return {
            ...train,
            targetTrack: 'LOOP-2',
          };
        }

        // RETURN TO MAIN
        if (
          train.trackId === 'LOOP-1' &&
          train.x > 900
        ) {
          return {
            ...train,
            targetTrack: 'MAIN-1',
          };
        }

        if (
          train.trackId === 'LOOP-2' &&
          train.x > 900
        ) {
          return {
            ...train,
            targetTrack: 'MAIN-2',
          };
        }

        return train;
      })
    );
  }

  /* =========================================================
     MOVE TRAINS
  ========================================================= */

  private moveTrains() {
    this.trains.update((all) =>
      all.map((train) => {
        /* ===============================================
           STOP IF TIMER ACTIVE
        =============================================== */

        if (train.halted) {
          return train;
        }

        /* ===============================================
           RED SIGNAL
        =============================================== */

        const redSignal = Object.values(
          this.signals()
        ).find(
          (s) =>
            s.trackId === train.trackId &&
            s.status === 'RED' &&
            s.x > train.x &&
            s.x - train.x < 60
        );

        if (redSignal) {
          return {
            ...train,

            speed: 0,

            status: 'WAITING',
          };
        }

        /* ===============================================
           COLLISION
        =============================================== */

        const blocked = this.trains().some(
          (other) => {
            if (other.id === train.id) {
              return false;
            }

            return (
              other.trackId === train.trackId &&
              other.x > train.x &&
              other.x - train.x < 130
            );
          }
        );

        if (blocked) {
          return {
            ...train,

            speed: 0,

            status: 'WAITING',
          };
        }

        let newY = train.y;
        let newTrack = train.trackId;

        /* ===============================================
           JUNCTION TRACK CHANGE
        =============================================== */

        const junction = this.junctions().find(
          (j) =>
            j.fromTrack === train.trackId &&
            j.toTrack === train.targetTrack &&
            train.x >= j.startX &&
            train.x <= j.endX
        );

        if (junction) {
          const target = this.tracks().find(
            (t) => t.id === junction.toTrack
          );

          if (target) {
            if (newY < target.y) {
              newY += 1.8;
            }

            if (newY > target.y) {
              newY -= 1.8;
            }

            if (
              Math.abs(newY - target.y) < 2
            ) {
              newY = target.y;

              newTrack = target.id;
            }
          }
        }

        /* ===============================================
           PLATFORM STOP
        =============================================== */

        const platform = this.findPlatform(
          train.trackId
        );

        if (
          train.stopAtStation &&
          platform &&
          train.x > platform.x + 30 &&
          train.x < platform.x + 40 &&
          !train.halted &&
          train.lastStoppedPlatform !== platform.id
          
        ) {
          this.startPlatformTimer(
            train.id,
            platform.id
          );

          return {
            ...train,

            speed: 0,

            halted: true,

            timer: 10,

            platformId: platform.id,
            lastStoppedPlatform: platform.id,
            status: 'STOPPED',
          };
        }

        /* ===============================================
           NORMAL MOVE
        =============================================== */
        let clearedPlatform = train.lastStoppedPlatform;

        if (
          train.lastStoppedPlatform &&
          train.x > 900
        ) {
          clearedPlatform = undefined;
        }

        return {
          ...train,
          lastStoppedPlatform: clearedPlatform,

          x:
            train.x > 1800
              ? -300
              : train.x + train.baseSpeed,

          y: newY,

          trackId: newTrack,

          speed: train.baseSpeed,

          status: 'RUNNING',
        };
      })
    );
  }

  /* =========================================================
     TIMER
  ========================================================= */

  private startPlatformTimer(
    trainId: string,
    platformId: string
  ) {
    this.addLog(
      `${trainId} arrived at ${platformId}`
    );

    const timer = setInterval(() => {
      this.trains.update((all) =>
        all.map((t) => {
          if (t.id !== trainId) {
            return t;
          }

          const next = (t.timer || 0) - 1;

          if (next <= 0) {
            clearInterval(timer);

            this.addLog(
              `${trainId} departed from ${platformId}`
            );

            return {
              ...t,

              halted: false,

              timer: 0,

              status: 'RUNNING',
            };
          }

          return {
            ...t,

            timer: next,
          };
        })
      );
    }, 1000);
  }

  /* =========================================================
     SIGNAL UPDATE
  ========================================================= */

  private updateSignals() {
    const trains = this.trains();

    this.signals.update((signals) => {
      const updated = { ...signals };

      Object.values(updated).forEach((signal) => {
        const occupied = trains.some(
          (t) =>
            t.trackId === signal.trackId &&
            t.x > signal.x &&
            t.x - signal.x < 170
        );

        signal.status = occupied
          ? 'RED'
          : 'GREEN';
      });

      return updated;
    });
  }

  /* =========================================================
     HELPERS
  ========================================================= */

  private findPlatform(
    trackId: string
  ): Platform | undefined {
    for (const station of this.stations()) {
      for (const platform of station.platforms) {
        if (
          platform.loopTrack === trackId ||
          platform.mainTrack === trackId
        ) {
          return platform;
        }
      }
    }

    return undefined;
  }

  private addLog(msg: string) {
    const time = new Date().toLocaleTimeString();

    this.logs.update((prev) =>
      [`[${time}] ${msg}`, ...prev].slice(
        0,
        12
      )
    );
  }
}
/* =========================================================
   railway.models.ts
========================================================= */

import { CommonModule } from "@angular/common";
import { Injectable, signal, Component, AfterViewInit, ViewChild, ElementRef } from "@angular/core";

export type Direction =
  | 'UP'
  | 'DOWN';

export type TrackType =
  | 'MAIN'
  | 'LOOP';

export type SignalAspect =
  | 'RED'
  | 'YELLOW'
  | 'GREEN';

export interface Track {

  id: string;

  y: number;

  type: TrackType;

  direction: Direction;

  startX: number;

  endX: number;
}

export interface Junction {

  id: string;

  fromTrack: string;

  toTrack: string;

  startX: number;

  endX: number;
}

export interface Platform {

  id: string;

  x: number;

  width: number;

  loopTrackId: string;
}

export interface Station {

  id: string;

  startX: number;

  endX: number;

  platforms: Platform[];
}

export interface Signal {

  id: string;

  x: number;

  trackId: string;

  direction: Direction;

  aspect: SignalAspect;
}

export interface Train {

  id: string;

  name: string;

  color: string;

  direction: Direction;

  x: number;

  y: number;

  length: number;

  speed: number;

  maxSpeed: number;

  acceleration: number;

  braking: number;

  trackId: string;

  route?: string;

  manualRoute?: boolean;

  halt: boolean;

  emergencyBrake: boolean;

  targetPlatform?: string;

  platformStopDone?: boolean;

  haltTimer?: number;

  returningToMain?: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class RailwayService {

  readonly canvasWidth = 2600;

  private trainCounter = 1;

  /* =====================================================
     TRACKS
  ===================================================== */

  tracks = signal<Track[]>([

    {
      id: 'UP-MAIN',

      y: 120,

      type: 'MAIN',

      direction: 'UP',

      startX: 0,

      endX: 2600
    },

    {
      id: 'UP-LOOP-1',

      y: 200,

      type: 'LOOP',

      direction: 'UP',

      startX: 350,

      endX: 1550
    },

    {
      id: 'UP-LOOP-2',

      y: 280,

      type: 'LOOP',

      direction: 'UP',

      startX: 350,

      endX: 1550
    },

    {
      id: 'UP-LOOP-3',

      y: 360,

      type: 'LOOP',

      direction: 'UP',

      startX: 350,

      endX: 1550
    },

    {
      id: 'DOWN-MAIN',

      y: 520,

      type: 'MAIN',

      direction: 'DOWN',

      startX: 0,

      endX: 2600
    },

    {
      id: 'DOWN-LOOP-1',

      y: 440,

      type: 'LOOP',

      direction: 'DOWN',

      startX: 350,

      endX: 1550
    }
  ]);

  /* =====================================================
     STATION
  ===================================================== */

  stations = signal<Station[]>([

    {
      id: 'CENTRAL',

      startX: 450,

      endX: 1450,

      platforms: [

        {
          id: 'PF-1',

          x: 650,

          width: 500,

          loopTrackId: 'UP-LOOP-1'
        },

        {
          id: 'PF-2',

          x: 650,

          width: 500,

          loopTrackId: 'UP-LOOP-2'
        },

        {
          id: 'PF-3',

          x: 650,

          width: 500,

          loopTrackId: 'UP-LOOP-3'
        }
      ]
    }
  ]);

  /* =====================================================
     JUNCTIONS
  ===================================================== */

  junctions = signal<Junction[]>([

    {
      id: 'UP-IN-1',

      fromTrack: 'UP-MAIN',

      toTrack: 'UP-LOOP-1',

      startX: 250,

      endX: 450
    },

    {
      id: 'UP-OUT-1',

      fromTrack: 'UP-LOOP-1',

      toTrack: 'UP-MAIN',

      startX: 1450,

      endX: 1650
    },

    {
      id: 'UP-IN-2',

      fromTrack: 'UP-MAIN',

      toTrack: 'UP-LOOP-2',

      startX: 250,

      endX: 450
    },

    {
      id: 'UP-OUT-2',

      fromTrack: 'UP-LOOP-2',

      toTrack: 'UP-MAIN',

      startX: 1450,

      endX: 1650
    },

    {
      id: 'UP-IN-3',

      fromTrack: 'UP-MAIN',

      toTrack: 'UP-LOOP-3',

      startX: 250,

      endX: 450
    },

    {
      id: 'UP-OUT-3',

      fromTrack: 'UP-LOOP-3',

      toTrack: 'UP-MAIN',

      startX: 1450,

      endX: 1650
    },

    {
      id: 'DOWN-IN-1',

      fromTrack: 'DOWN-MAIN',

      toTrack: 'DOWN-LOOP-1',

      startX: 1450,

      endX: 1650
    },

    {
      id: 'DOWN-OUT-1',

      fromTrack: 'DOWN-LOOP-1',

      toTrack: 'DOWN-MAIN',

      startX: 250,

      endX: 450
    }
  ]);

  /* =====================================================
     SIGNALS
  ===================================================== */

  signals = signal<Signal[]>([]);

  /* =====================================================
     TRAINS
  ===================================================== */

  trains = signal<Train[]>([]);

  /* =====================================================
     LOGS
  ===================================================== */

  logs = signal<string[]>([]);

  /* =====================================================
     PANIC
  ===================================================== */

  panicMode = signal(false);

  constructor() {

    this.generateSignals();

    this.startSpawner();

    this.startEngine();
  }

  /* =====================================================
     SIGNAL GENERATION
  ===================================================== */

  private generateSignals() {

    const all: Signal[] = [];

    this.tracks().forEach(track => {

      if (track.type === 'MAIN') {

        for (
          let x = 100;
          x <= 2600;
          x += 100
        ) {

          all.push({

            id: `${track.id}-${x}`,

            x,

            trackId: track.id,

            direction: track.direction,

            aspect: 'GREEN'
          });
        }
      }
      else {

        for (
          let x = 450;
          x <= 1450;
          x += 100
        ) {

          all.push({

            id: `${track.id}-${x}`,

            x,

            trackId: track.id,

            direction: track.direction,

            aspect: 'GREEN'
          });
        }
      }
    });

    this.signals.set(all);
  }

  /* =====================================================
     SPAWNER
  ===================================================== */

  private startSpawner() {

    setInterval(() => {

      this.spawnUpTrain();

    }, 12000);

    setInterval(() => {

      this.spawnDownTrain();

    }, 18000);
  }

  private spawnUpTrain() {

    const occupied =
      this.trains().some(t =>
        t.direction === 'UP' &&
        t.x < 500
      );

    if (occupied) {
      return;
    }

    const express =
      this.trainCounter % 2 === 0;

    const train: Train = {

      id: `UP-${this.trainCounter}`,

      name:
        express
          ? 'Rajdhani Express'
          : 'Passenger Local',

      color:
        express
          ? '#ff3355'
          : '#00e5ff',

      direction: 'UP',

      x: -300,

      y: 120,

      length:
        express
          ? 220
          : 150,

      speed: 0,

      maxSpeed:
        express
          ? 7
          : 4,

      acceleration: 0.03,

      braking: 0.08,

      trackId: 'UP-MAIN',

      halt: false,

      emergencyBrake: false
    };

    this.trainCounter++;

    this.trains.update(all => [
      ...all,
      train
    ]);

    this.addLog(
      `${train.name} entered UP MAIN`
    );
  }

  private spawnDownTrain() {

    const occupied =
      this.trains().some(t =>
        t.direction === 'DOWN' &&
        t.x > 2100
      );

    if (occupied) {
      return;
    }

    const train: Train = {

      id: `DOWN-${this.trainCounter}`,

      name: 'Down Superfast',

      color: '#ffaa00',

      direction: 'DOWN',

      x: 2900,

      y: 520,

      length: 200,

      speed: 0,

      maxSpeed: 6,

      acceleration: 0.03,

      braking: 0.08,

      trackId: 'DOWN-MAIN',

      halt: false,

      emergencyBrake: false
    };

    this.trainCounter++;

    this.trains.update(all => [
      ...all,
      train
    ]);

    this.addLog(
      `${train.name} entered DOWN MAIN`
    );
  }

  /* =====================================================
     ENGINE
  ===================================================== */

  private startEngine() {

    const frame = () => {

      if (!this.panicMode()) {

        this.autoRouting();

        this.updateSignals();

        this.moveTrains();
      }

      requestAnimationFrame(frame);
    };

    frame();
  }

  /* =====================================================
     PANIC
  ===================================================== */

  activatePanic() {

    this.panicMode.set(true);

    this.trains.update(all =>
      all.map(t => ({
        ...t,
        halt: true
      }))
    );

    this.signals.update(all =>
      all.map(s => ({
        ...s,
        aspect: 'RED'
      }))
    );

    this.addLog(
      'PANIC MODE ACTIVATED'
    );
  }

  clearPanic() {

    this.panicMode.set(false);

    this.trains.update(all =>
      all.map(t => ({
        ...t,
        halt: false
      }))
    );

    this.addLog(
      'PANIC MODE CLEARED'
    );
  }

  /* =====================================================
     MANUAL DIVERT
  ===================================================== */

  divertTrain(
    trainId: string,
    loopTrack: string
  ) {

    this.trains.update(all =>
      all.map(t => {

        if (t.id !== trainId) {
          return t;
        }

        if (
          t.direction === 'UP' &&
          t.x > 250
        ) {
          return t;
        }

        return {

          ...t,

          route: loopTrack,

          manualRoute: true
        };
      })
    );

    this.addLog(
      `${trainId} diverted to ${loopTrack}`
    );
  }

  /* =====================================================
     AUTO ROUTING
  ===================================================== */

  private autoRouting() {

    this.trains.update(all =>
      all.map(train => {

        if (train.manualRoute) {
          return train;
        }

        if (
          train.direction === 'UP' &&
          train.name.includes('Passenger')
        ) {

          return {

            ...train,

            route: 'UP-LOOP-1'
          };
        }

        return train;
      })
    );
  }

  /* =====================================================
     SIGNALS
  ===================================================== */

  private updateSignals() {

    this.signals.update(all =>
      all.map(signal => {

        const occupied =
          this.trains().some(train => {

            if (
              train.trackId !==
              signal.trackId
            ) {
              return false;
            }

            if (
              signal.direction === 'UP'
            ) {

              return (
                train.x > signal.x &&
                train.x - signal.x < 220
              );
            }

            return (
              signal.x > train.x &&
              signal.x - train.x < 220
            );
          });

        const aspect:
          SignalAspect =
          occupied
            ? 'RED'
            : 'GREEN';

        return {
          ...signal,
          aspect
        };
      })
    );
  }

  /* =====================================================
     PLATFORM STOP
  ===================================================== */

  private handlePlatformStop(
    train: Train
  ): Train {

    if (
      !train.trackId.includes('LOOP')
    ) {
      return train;
    }

    const station =
      this.stations()[0];

    const platform =
      station.platforms.find(p =>
        p.loopTrackId ===
        train.trackId
      );

    if (!platform) {
      return train;
    }

    const stopPoint =
      platform.x +
      platform.width / 2;

    const distance =
      Math.abs(
        train.x - stopPoint
      );

    if (
      !train.platformStopDone &&
      distance < 8
    ) {

      this.addLog(
        `${train.name} stopped at ${platform.id}`
      );

      return {

        ...train,

        speed: 0,

        halt: true,

        haltTimer: 300,

        targetPlatform:
          platform.id,

        platformStopDone: true
      };
    }

    if (
      train.halt &&
      train.haltTimer
    ) {

      const next =
        train.haltTimer - 1;

      if (next <= 0) {

        this.addLog(
          `${train.name} departed ${platform.id}`
        );

        return {

          ...train,

          halt: false,

          haltTimer: 0,

          returningToMain: true
        };
      }

      return {

        ...train,

        haltTimer: next
      };
    }

    return train;
  }

  /* =====================================================
     MOVEMENT
  ===================================================== */

  private moveTrains() {

    const updated =
      this.trains()
        .map(train => {

          train =
            this.handlePlatformStop(
              train
            );

          if (train.halt) {
            return train;
          }

          let speed = train.speed;

          const nextSignal =
            this.findNextSignal(
              train
            );

          if (
            nextSignal &&
            nextSignal.aspect === 'RED'
          ) {

            const distance =
              Math.abs(
                nextSignal.x -
                train.x
              );

            if (distance < 180) {

              speed -= train.braking;

              if (speed < 0) {
                speed = 0;
              }
            }
          }
          else {

            speed +=
              train.acceleration;

            if (
              speed >
              train.maxSpeed
            ) {

              speed =
                train.maxSpeed;
            }
          }

          const blocked =
            this.trains().some(other => {

              if (
                other.id === train.id
              ) {
                return false;
              }

              if (
                other.trackId !==
                train.trackId
              ) {
                return false;
              }

              if (
                train.direction ===
                'UP'
              ) {

                return (
                  other.x > train.x &&
                  other.x - train.x <
                  train.length + 80
                );
              }

              return (
                train.x > other.x &&
                train.x - other.x <
                train.length + 80
              );
            });

          if (blocked) {
            speed = 0;
          }

          let x =
            train.direction === 'UP'
              ? train.x + speed
              : train.x - speed;

          let y = train.y;

          let trackId =
            train.trackId;

          /* =========================================
             MAIN TO LOOP
          ========================================= */

          this.junctions()
            .forEach(j => {

              if (
                j.fromTrack !==
                train.trackId
              ) {
                return;
              }

              if (
                j.toTrack !==
                train.route
              ) {
                return;
              }

              if (
                x < j.startX ||
                x > j.endX
              ) {
                return;
              }

              const target =
                this.tracks()
                  .find(t =>
                    t.id ===
                    j.toTrack
                  );

              if (!target) {
                return;
              }

              if (y < target.y) {
                y += 1.4;
              }

              if (y > target.y) {
                y -= 1.4;
              }

              if (
                Math.abs(
                  y - target.y
                ) < 2
              ) {

                y = target.y;

                trackId =
                  target.id;
              }
            });

          /* =========================================
             LOOP TO MAIN
          ========================================= */

          if (
            train.returningToMain &&
            train.trackId.includes(
              'LOOP'
            )
          ) {

            const returnJunction =
              this.junctions()
                .find(j => {

                  return (
                    j.fromTrack ===
                      train.trackId &&

                    j.toTrack.includes(
                      'MAIN'
                    )
                  );
                });

            if (returnJunction) {

              if (
                x >=
                  returnJunction.startX &&
                x <=
                  returnJunction.endX
              ) {

                const target =
                  this.tracks()
                    .find(t =>
                      t.id ===
                      returnJunction.toTrack
                    );

                if (target) {

                  if (y < target.y) {
                    y += 1.6;
                  }

                  if (y > target.y) {
                    y -= 1.6;
                  }

                  if (
                    Math.abs(
                      y - target.y
                    ) < 2
                  ) {

                    y = target.y;

                    trackId =
                      target.id;

                    train.returningToMain =
                      false;

                    train.route =
                      undefined;

                    this.addLog(
                      `${train.name} returned to main line`
                    );
                  }
                }
              }
            }
          }

          if (
            train.direction === 'UP' &&
            x > 2900
          ) {
            return null;
          }

          if (
            train.direction ===
              'DOWN' &&
            x < -500
          ) {
            return null;
          }

          return {

            ...train,

            x,

            y,

            speed,

            trackId
          };
        })
        .filter(Boolean) as Train[];

    this.trains.set(updated);
  }

  /* =====================================================
     NEXT SIGNAL
  ===================================================== */

  private findNextSignal(
    train: Train
  ): Signal | undefined {

    const signals =
      this.signals()
        .filter(signal => {

          return (
            signal.trackId ===
            train.trackId
          );
        });

    if (
      train.direction === 'UP'
    ) {

      return signals.find(s =>
        s.x > train.x
      );
    }

    return [...signals]
      .reverse()
      .find(s =>
        s.x < train.x
      );
  }

  /* =====================================================
     LOGS
  ===================================================== */

  private addLog(msg: string) {

    const time =
      new Date()
        .toLocaleTimeString();

    this.logs.update(prev => [

      `[${time}] ${msg}`,

      ...prev

    ].slice(0, 20));
  }
}

@Component({
  selector: 'railway-simulation-component',

  standalone: true,

  imports: [CommonModule],

  templateUrl:
    './railway-simulation-component.html',

  styleUrls: [
    './railway-simulation-component.css'
  ]
})
export class RailwaySimulationComponent
  implements AfterViewInit {

  @ViewChild('railCanvas')
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;

  readonly canvasWidth = 3000;

  readonly canvasHeight = 1000;

  selectedTrainId = '';

  constructor(
    public rail: RailwayService
  ) {}

  /* =====================================================
     INIT
  ===================================================== */

  ngAfterViewInit(): void {

    const canvas =
      this.canvasRef.nativeElement;

    canvas.width =
      this.canvasWidth;

    canvas.height =
      this.canvasHeight;

    const context =
      canvas.getContext('2d');

    if (!context) {
      return;
    }

    this.ctx = context;

    this.startRenderer();
  }

  /* =====================================================
     RENDER LOOP
  ===================================================== */

  private startRenderer(): void {

    const render = () => {

      this.clearCanvas();

      this.drawGrid();

      this.drawTracks();

      this.drawJunctions();

      this.drawPlatforms();

      this.drawSignals();

      this.drawTrains();

      this.drawHud();

      requestAnimationFrame(render);
    };

    render();
  }

  /* =====================================================
     CLEAR
  ===================================================== */

  private clearCanvas(): void {

    this.ctx.fillStyle =
      '#0a0a0a';

    this.ctx.fillRect(
      0,
      0,
      this.canvasWidth,
      this.canvasHeight
    );
  }

  /* =====================================================
     GRID
  ===================================================== */

  private drawGrid(): void {

    this.ctx.strokeStyle =
      'rgba(255,255,255,0.05)';

    this.ctx.lineWidth = 1;

    for (
      let x = 0;
      x < this.canvasWidth;
      x += 100
    ) {

      this.ctx.beginPath();

      this.ctx.moveTo(x, 0);

      this.ctx.lineTo(
        x,
        this.canvasHeight
      );

      this.ctx.stroke();
    }

    for (
      let y = 0;
      y < this.canvasHeight;
      y += 100
    ) {

      this.ctx.beginPath();

      this.ctx.moveTo(0, y);

      this.ctx.lineTo(
        this.canvasWidth,
        y
      );

      this.ctx.stroke();
    }
  }

  /* =====================================================
     TRACKS
  ===================================================== */

  private drawTracks(): void {

    this.rail.tracks()
      .forEach(track => {

        this.ctx.beginPath();

        this.ctx.lineWidth = 5;

        this.ctx.strokeStyle =
          track.type === 'MAIN'
            ? '#bbbbbb'
            : '#777777';

        this.ctx.moveTo(
          track.startX,
          track.y
        );

        this.ctx.lineTo(
          track.endX,
          track.y
        );

        this.ctx.stroke();

        /* sleepers */

        for (
          let x = track.startX;
          x <= track.endX;
          x += 35
        ) {

          this.ctx.beginPath();

          this.ctx.strokeStyle =
            '#4b2e18';

          this.ctx.lineWidth = 2;

          this.ctx.moveTo(
            x,
            track.y - 8
          );

          this.ctx.lineTo(
            x,
            track.y + 8
          );

          this.ctx.stroke();
        }

        /* label */

        this.ctx.fillStyle =
          '#ffffff';

        this.ctx.font =
          '14px Arial';

        this.ctx.fillText(
          track.id,
          20,
          track.y - 15
        );
      });
  }

  /* =====================================================
     JUNCTIONS
  ===================================================== */

  private drawJunctions(): void {

    this.rail.junctions()
      .forEach(j => {

        const from =
          this.rail.tracks()
            .find(t =>
              t.id === j.fromTrack
            );

        const to =
          this.rail.tracks()
            .find(t =>
              t.id === j.toTrack
            );

        if (!from || !to) {
          return;
        }

        this.ctx.beginPath();

        this.ctx.lineWidth = 4;

        this.ctx.strokeStyle =
          '#00ffaa';

        this.ctx.moveTo(
          j.startX,
          from.y
        );

        this.ctx.bezierCurveTo(

          j.startX + 80,
          from.y,

          j.endX - 80,
          to.y,

          j.endX,
          to.y
        );

        this.ctx.stroke();
      });
  }

  /* =====================================================
     PLATFORMS
  ===================================================== */

  private drawPlatforms(): void {

    this.rail.stations()
      .forEach(station => {

        /* station building */

        this.ctx.fillStyle =
          'rgba(255,255,255,0.05)';

        this.ctx.fillRect(

          station.startX,

          130,

          station.endX -
          station.startX,

          280
        );

        this.ctx.fillStyle =
          '#ffffff';

        this.ctx.font =
          'bold 22px Arial';

        this.ctx.fillText(

          station.id,

          station.startX + 30,

          165
        );

        station.platforms
          .forEach(platform => {

            const track =
              this.rail.tracks()
                .find(t =>
                  t.id ===
                  platform.loopTrackId
                );

            if (!track) {
              return;
            }

            this.ctx.fillStyle =
              '#999999';

            this.ctx.fillRect(

              platform.x,

              track.y - 18,

              platform.width,

              15
            );

            this.ctx.fillStyle =
              '#ffffff';

            this.ctx.font =
              '15px Arial';

            this.ctx.fillText(

              platform.id,

              platform.x + 15,

              track.y - 25
            );
          });
      });
  }

  /* =====================================================
     SIGNALS
  ===================================================== */

  private drawSignals(): void {

    this.rail.signals()
      .forEach(signal => {

        const track =
          this.rail.tracks()
            .find(t =>
              t.id === signal.trackId
            );

        if (!track) {
          return;
        }

        /* pole */

        this.ctx.beginPath();

        this.ctx.strokeStyle =
          '#888';

        this.ctx.lineWidth = 3;

        this.ctx.moveTo(
          signal.x,
          track.y
        );

        this.ctx.lineTo(
          signal.x,
          track.y - 25
        );

        this.ctx.stroke();

        /* lamp */

        this.ctx.beginPath();

        this.ctx.fillStyle =

          signal.aspect === 'RED'
            ? '#ff0033'

            : signal.aspect ===
              'YELLOW'
            ? '#ffee00'

            : '#00ff66';

        this.ctx.arc(

          signal.x,

          track.y - 30,

          7,

          0,

          Math.PI * 2
        );

        this.ctx.fill();
      });
  }

  /* =====================================================
     TRAINS
  ===================================================== */

  private drawTrains(): void {

    this.rail.trains()
      .forEach(train => {

        /* body */

        this.ctx.fillStyle =
          train.color;

        this.ctx.fillRect(

          train.x,

          train.y - 16,

          train.length,

          32
        );

        /* outline */

        this.ctx.strokeStyle =
          '#111';

        this.ctx.lineWidth = 2;

        this.ctx.strokeRect(

          train.x,

          train.y - 16,

          train.length,

          32
        );

        /* locomotive */

        this.ctx.fillStyle =
          '#222';

        if (
          train.direction === 'UP'
        ) {

          this.ctx.fillRect(

            train.x,

            train.y - 16,

            28,

            32
          );
        }
        else {

          this.ctx.fillRect(

            train.x +
            train.length - 28,

            train.y - 16,

            28,

            32
          );
        }

        /* train name */

        this.ctx.fillStyle =
          '#ffffff';

        this.ctx.font =
          'bold 13px Arial';

        this.ctx.fillText(

          train.name,

          train.x + 12,

          train.y + 4
        );

        /* speed */

        this.ctx.fillStyle =
          '#00ff99';

        this.ctx.font =
          '12px monospace';

        this.ctx.fillText(

          `${train.speed.toFixed(1)} km/h`,

          train.x + 10,

          train.y - 22
        );

        /* halt timer */

        if (
          train.haltTimer &&
          train.haltTimer > 0
        ) {

          this.ctx.fillStyle =
            '#ffee00';

          this.ctx.font =
            'bold 14px Arial';

          this.ctx.fillText(

            `STOP ${Math.floor(
              train.haltTimer / 60
            )}s`,

            train.x + 20,

            train.y - 38
          );
        }
      });
  }

  /* =====================================================
     HUD
  ===================================================== */

  private drawHud(): void {

    this.ctx.fillStyle =
      '#ffffff';

    this.ctx.font =
      'bold 16px Arial';

    this.ctx.fillText(

      `TRAINS : ${this.rail.trains().length}`,

      20,

      40
    );

    this.ctx.fillText(

      `PANIC : ${
        this.rail.panicMode()
          ? 'ACTIVE'
          : 'NORMAL'
      }`,

      20,

      65
    );

    /* log box */

    this.ctx.fillStyle =
      'rgba(0,0,0,0.6)';

    this.ctx.fillRect(

      1900,

      20,

      650,

      320
    );

    this.ctx.fillStyle =
      '#00ff99';

    this.ctx.font =
      '13px monospace';

    this.ctx.fillText(
      'EVENT LOG',
      1920,
      45
    );

    this.rail.logs()
      .forEach((log, i) => {

        this.ctx.fillText(

          log,

          1920,

          75 + i * 18
        );
      });
  }

  /* =====================================================
     UI ACTIONS
  ===================================================== */

  panicStop(): void {

    this.rail.activatePanic();
  }

  clearPanic(): void {

    this.rail.clearPanic();
  }

  divertToPf1(): void {

    const train =
      this.rail.trains()
        .find(t =>
          t.direction === 'UP' &&
          t.trackId === 'UP-MAIN'
        );

    if (!train) {
      return;
    }

    this.rail.divertTrain(
      train.id,
      'UP-LOOP-1'
    );
  }

  divertToPf2(): void {

    const train =
      this.rail.trains()
        .find(t =>
          t.direction === 'UP' &&
          t.trackId === 'UP-MAIN'
        );

    if (!train) {
      return;
    }

    this.rail.divertTrain(
      train.id,
      'UP-LOOP-2'
    );
  }

  divertToPf3(): void {

    const train =
      this.rail.trains()
        .find(t =>
          t.direction === 'UP' &&
          t.trackId === 'UP-MAIN'
        );

    if (!train) {
      return;
    }

    this.rail.divertTrain(
      train.id,
      'UP-LOOP-3'
    );
  }
}
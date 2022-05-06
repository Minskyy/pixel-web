import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnInit,
  HostListener,
  Input,
} from "@angular/core";
import { select, Store } from "@ngrx/store";
import axios from "axios";
import {
  animationFrameScheduler,
  defer,
  interval,
  Observable,
  pipe,
  Scheduler,
} from "rxjs";
import { delay, map, take, takeWhile, tap } from "rxjs/operators";
import { ContractService } from "../contract-service.service";
import * as fromCanvas from "./store/canvas.actions";
import * as fromRoot from "../store/root.reducer";
import * as fromPixelTab from "../pixel-tab/store/pixel-tab.actions";
import { BackendServiceService } from "../backend-service.service";
import { PixelTabFacadeService } from "../pixel-tab/store/pixel-tab-facade.service";
import { randomBytes } from "crypto";

declare let window: any;

export interface Position {
  x: number;
  y: number;
}

interface PixelInfo {
  index: number;
  color: number;
}

@Component({
  selector: "app-canvas",
  templateUrl: "./canvas.component.html",
  styleUrls: ["./canvas.component.scss"],
})
export class CanvasComponent implements AfterViewInit, OnInit {
  /** Template reference to the canvas element */
  @ViewChild("fullCanvas") fullCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild("viewPort") viewPort: ElementRef<HTMLCanvasElement>;
  @ViewChild("cursor") cursor: ElementRef<HTMLCanvasElement>;

  @Input() nftIDsInWallet: number[] = [];
  @Input() drawModeEnabled: boolean = false;
  @Input() eraserMode: boolean = false;

  @HostListener("window:resize", ["$event"])
  onResize() {
    this.setCanvasXY();
  }

  @HostListener("window:scroll", ["$event"])
  onScroll() {
    this.setCanvasXY();
  }

  /**
   * We need to use this hostlistener instead of the mouse mouseup event, in order to also detect the event
   * when it happens outside of the canvas element
   */
  @HostListener("document:mouseup")
  clickedOut() {
    this.isDragging = false;
  }

  /** Canvas 2d context */
  private fullCanvasContext: CanvasRenderingContext2D;
  private viewportContext: CanvasRenderingContext2D;
  translateX: number = 0.8;
  translateY: number = 0.45;
  leftArrowPressed: number = 0;
  rightArrowPressed: number = 0;
  upArrowPressed: number = 0;
  downArrowPressed: number = 0;
  translateXSpeed: number = 0;
  translateYSpeed: number = 0;
  drawMode: boolean = false;
  FPS: number = 60;
  canvasWidth: number;
  canvasHeight: number;
  hoveredPixel: Position = {
    x: 0,
    y: 0,
  };

  prevHoveredPixel: Position = {
    x: 0,
    y: 0,
  };

  canvasPositionX: number;
  canvasPositionY: number;

  hoveredCanvasXCell: number;
  hoveredCanvasYCell: number;
  xPosToSnapTo: number;
  yPosToSnapTo: number;

  areaSize: number = 20;
  xCells: number;
  yCells: number;

  hoveredAreaIndex: number;
  clickedAreaIndex: number;

  cameraX: number = 0;
  cameraY: number = 0;
  cameraViewportWidth: number = 40;
  cameraViewportHeight: number = 20;
  cursorSize: number = 20;
  aspectRatio: number = 2;
  alphavalue: number = 255;

  posToDrawArea: Position = {
    x: 0,
    y: 0,
  };
  clickedAreaPixel: Position = {
    x: 0,
    y: 0,
  };

  imgData: ImageData;
  isDragging: boolean = false;

  chosenColor: string;
  brushSize: number;

  boardBuffer: Observable<ArrayBuffer> = this.store.select(
    (state) => state.pixelTab.boardBuffer
  );

  constructor(
    private contractService: ContractService,
    private backendService: BackendServiceService,
    private pixelTabFacade: PixelTabFacadeService,
    private store: Store<fromRoot.AppState>
  ) {}

  timeAgo = (scheduler = animationFrameScheduler) => {
    return defer(() => {
      const start = scheduler.now();
      return interval(0, scheduler).pipe(map(() => scheduler.now() - start));
    });
  };

  framesPerSecond = (frames: number) => (ms: number) => (frames * ms) / 1000;

  ngOnInit(): void {
    // this.store.select('canvas').subscribe()
    this.pixelTabFacade.getBoardBuffer();

    let frameCount = 0;

    // TODO destroy sub
    this.timeAgo()
      .pipe(map(this.framesPerSecond(this.FPS)))
      .subscribe((e) => {
        if (e > frameCount) {
          const translateXSpeed =
            this.rightArrowPressed - this.leftArrowPressed;

          const translateYSpeed = this.upArrowPressed - this.downArrowPressed;
          this.cameraX += translateXSpeed;
          this.cameraY -= translateYSpeed;

          if (this.cameraX < 0) this.cameraX = 0;
          if (this.cameraX > this.canvasWidth - this.cameraViewportWidth)
            this.cameraX = this.canvasWidth - this.cameraViewportWidth;

          if (this.cameraY < 0) this.cameraY = 0;
          if (this.cameraY > this.canvasHeight - this.cameraViewportHeight)
            this.cameraY = this.canvasHeight - this.cameraViewportHeight;

          this.draw();
          frameCount++;
        }
      });
  }

  setCanvasXY() {
    this.canvasPositionX =
      this.viewPort.nativeElement.getBoundingClientRect().x;
    this.canvasPositionY =
      this.viewPort.nativeElement.getBoundingClientRect().y;
  }

  ngAfterViewInit() {
    const fullCanvasContext = this.fullCanvas.nativeElement.getContext("2d");
    const viewportContext = this.viewPort.nativeElement.getContext("2d");
    if (
      !fullCanvasContext ||
      !(fullCanvasContext instanceof CanvasRenderingContext2D) ||
      !viewportContext ||
      !(viewportContext instanceof CanvasRenderingContext2D)
    ) {
      throw new Error("Failed to get 2D context");
    }
    this.fullCanvasContext = fullCanvasContext;
    this.viewportContext = viewportContext;
    this.canvasWidth = this.viewPort.nativeElement.width;
    this.canvasHeight = this.viewPort.nativeElement.height;

    this.xCells = this.canvasWidth / this.areaSize;
    this.yCells = this.canvasHeight / this.areaSize;

    this.aspectRatio = this.canvasWidth / this.canvasHeight;
    this.setCanvasXY();

    this.store.select("pixelTab").subscribe((state) => {
      const chosenColor = state.chosenColor;
      this.cursor.nativeElement.style.background = chosenColor;
      this.cursor.nativeElement.style.boxShadow = `0 0 20px ${chosenColor}, 0 0 60px ${chosenColor}, 0 0 100px ${chosenColor}`;
      this.brushSize = state.brushSize;
      this.chosenColor = chosenColor;
    });

    this.drawBoard();
  }

  paint(pixelCoordinates: Position) {
    const colorComponents = this.chosenColor.substring(1);

    let pixelsToCommit: { [key: number]: number } = {};

    const pixelsToModify: Position[] = [pixelCoordinates];

    if (this.brushSize >= 4) {
      pixelsToModify.push({
        x: pixelCoordinates.x + 1,
        y: pixelCoordinates.y,
      });
      pixelsToModify.push({
        x: pixelCoordinates.x,
        y: pixelCoordinates.y + 1,
      });
      pixelsToModify.push({
        x: pixelCoordinates.x + 1,
        y: pixelCoordinates.y + 1,
      });
    }

    if (this.brushSize >= 9) {
      pixelsToModify.push({
        x: pixelCoordinates.x - 1,
        y: pixelCoordinates.y,
      });
      pixelsToModify.push({
        x: pixelCoordinates.x - 1,
        y: pixelCoordinates.y + 1,
      });

      pixelsToModify.push({
        x: pixelCoordinates.x,
        y: pixelCoordinates.y - 1,
      });
      pixelsToModify.push({
        x: pixelCoordinates.x - 1,
        y: pixelCoordinates.y - 1,
      });
      pixelsToModify.push({
        x: pixelCoordinates.x + 1,
        y: pixelCoordinates.y - 1,
      });
    }

    for (const pixel of pixelsToModify) {
      if (!this.ownedNftsIncludePixel(pixel)) continue;
      pixelsToCommit = {
        ...pixelsToCommit,
        ...this.changePixelColor(pixel, colorComponents),
      };
    }

    this.store.dispatch(
      fromPixelTab.addPixelsToCommit({ pixels: pixelsToCommit })
    );

    this.fullCanvasContext.putImageData(this.imgData, 0, 0);
  }

  ownedNftsIncludePixel(pixel: Position) {
    const pixelAreaIndex = this.getAreaIndexFromCanvasCoordinates(pixel);

    return this.nftIDsInWallet.includes(pixelAreaIndex);
  }

  /**
   * Changes the color of a given pixel
   *
   * @param pixelCoordinates
   * @param color
   */
  changePixelColor(pixelCoordinates: Position, color: string) {
    const index = pixelCoordinates.y * this.canvasWidth + pixelCoordinates.x;
    const pixelsToModify: { [key: number]: number } = {};

    for (let i = 0; i < 4; i += 1) {
      let colorValue = 0;
      if (this.eraserMode) {
        colorValue = i === 3 ? 255 : Math.ceil(Math.random() * 255);
      } else {
        const colorComp = color.substring(i * 2, i * 2 + 2);
        const parsedValue = parseInt(colorComp, 16);
        colorValue = parsedValue;
      }
      this.imgData.data[i + index * 4] = colorValue;
      pixelsToModify[i + index * 4] = colorValue;
    }

    return pixelsToModify;
  }

  drawBoard = async () => {
    this.boardBuffer.pipe(take(2)).subscribe((buffer) => {
      console.log("buf", buffer);

      // Uint8ClampedArray view of boardBuffer
      const clampedArray = new Uint8ClampedArray(buffer);

      this.imgData = new ImageData(clampedArray, 1000, 500);

      // const imgData = this.buildImageData(clampedArray);

      this.fullCanvasContext.putImageData(this.imgData, 0, 0);
    });
  };

  // Input events

  pixelBelongsToArea(pixel: Position, areaIndex: number): boolean {
    const areaCoordinates = this.getCanvasCoordinatesFromAreaIndex(areaIndex);

    console.log("areaC", areaCoordinates);
    console.log("pixel", pixel);

    return (
      areaCoordinates.x < pixel.x &&
      pixel.x < areaCoordinates.x + this.areaSize &&
      areaCoordinates.y < pixel.y &&
      pixel.y < areaCoordinates.y + this.areaSize
    );
  }

  onMouseOver(event: MouseEvent) {
    const mousePos: Position = {
      x: event.x,
      y: event.y,
    };

    this.hoveredPixel = this.getViewportHoveredPixel(mousePos);

    const canvasHoveredPixel = this.getCanvasPixelFromViewportPixel(
      this.hoveredPixel
    );

    const prevAreaindex = this.hoveredAreaIndex;

    this.hoveredAreaIndex =
      this.getAreaIndexFromCanvasCoordinates(canvasHoveredPixel);

    // const posToDrawArea = this.getViewportPosToSnapTo(
    //   this.hoveredPixel.x,
    //   this.hoveredPixel.y
    // );

    const posToSnapTo = this.getCanvasPosToSnapTo(
      canvasHoveredPixel.x,
      canvasHoveredPixel.y
    );

    if (this.drawModeEnabled) {
      this.cursor.nativeElement.style.top = event.y + "px";
      this.cursor.nativeElement.style.left = event.x + "px";
      this.cursor.nativeElement.style.display = "block";
      if (this.isDragging) {
        this.paint(canvasHoveredPixel);
      }
    } else {
      // Redraw squares everytime we hover a different one
      if (this.hoveredAreaIndex !== prevAreaindex) {
        this.fullCanvasContext.putImageData(this.imgData, 0, 0);

        // Draw hovered rect
        this.drawRectAtPos(
          posToSnapTo,
          this.fullCanvasContext,
          this.areaSize,
          this.areaSize
        );

        this.drawClickedRect();
        this.drawNFTRects();
      }

      if (this.isDragging) {
        const dx = this.prevHoveredPixel.x - this.hoveredPixel.x;
        const dy = this.prevHoveredPixel.y - this.hoveredPixel.y;

        this.cameraX += dx;
        this.cameraY += dy;
      }
    }
    this.prevHoveredPixel = this.hoveredPixel;
  }

  onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "a":
        this.leftArrowPressed = 1;
        break;
      case "d":
        this.rightArrowPressed = 1;
        break;
      case "w":
        this.upArrowPressed = 1;
        break;
      case "s":
        this.downArrowPressed = 1;
        break;
      default:
    }
  }

  onKeyUp(event: KeyboardEvent) {
    switch (event.key) {
      case "a":
        this.leftArrowPressed = 0;
        break;
      case "d":
        this.rightArrowPressed = 0;
        break;
      case "w":
        this.upArrowPressed = 0;
        break;
      case "s":
        this.downArrowPressed = 0;
        break;

      default:
    }
  }

  onMouseWheel(event: WheelEvent) {
    this.cameraViewportHeight -= event.deltaY < 0 ? 1 : -1;
    this.cursorSize = this.cameraViewportWidth

    console.log('thisca', this.cameraViewportHeight);
    console.log('thisWI', this.cameraViewportWidth);
    
    let sqSize = Math.floor(this.canvasWidth / this.cameraViewportWidth);

    if(sqSize < 5) sqSize = 5;
    if(sqSize > 25) sqSize = 30;

    console.log('sqSize', sqSize);
    console.log('this.brushSize', sqSize);

    this.cursor.nativeElement.style.height = `${sqSize}px`;
    this.cursor.nativeElement.style.width = `${sqSize}px`;

    this.cameraViewportWidth = this.cameraViewportHeight * this.aspectRatio;

    if (this.cameraViewportHeight < 7) this.cameraViewportHeight = 7;
    if (this.cameraViewportWidth < 7) this.cameraViewportWidth = 7;

    if (this.cameraViewportWidth > this.canvasWidth)
      this.cameraViewportWidth = this.canvasWidth;
    if (this.cameraViewportHeight > this.canvasHeight)
      this.cameraViewportHeight = this.canvasHeight;
  }

  onMouseUp() {
    console.log("up");
  }

  onMouseDown() {
    console.log("down");
    this.isDragging = true;
  }

  onMouseClick(event: MouseEvent) {
    const viewportPixel = this.getViewportHoveredPixel({
      x: event.x,
      y: event.y,
    });

    this.clickedAreaPixel = this.getCanvasPixelFromViewportPixel(viewportPixel);

    this.clickedAreaIndex = this.hoveredAreaIndex;

    const canvasPixelClicked: Position = {
      x: this.hoveredPixel.x + this.cameraX,
      y: this.hoveredPixel.y + this.cameraY,
    };

    this.store.dispatch(
      fromCanvas.CanvasClicked({
        position: canvasPixelClicked,
        clickedAreaIndex: this.clickedAreaIndex,
      })
    );
    if (this.drawModeEnabled) {
      this.paint(canvasPixelClicked);
    } else {
      this.drawClickedRect();
    }

    this.drawNFTRects();
  }

  // HELPER FUNCTIONS

  /**
   * Retrieves the hovered pixel in the visible viewport (doesn't account for the camera translation)
   * @param mousePos
   * @returns
   */
  getViewportHoveredPixel(mousePos: Position): Position {
    return {
      x: Math.floor(
        ((mousePos.x - this.canvasPositionX) * this.cameraViewportWidth) /
          this.canvasWidth
      ),
      y: Math.floor(
        ((mousePos.y - this.canvasPositionY) * this.cameraViewportHeight) /
          this.canvasHeight
      ),
    };
  }

  /**
   * Returns the canvas pixel respective to a viewport pixel
   * @param mousePos
   * @returns
   */
  getCanvasPixelFromViewportPixel(viewportPixel: Position): Position {
    return {
      x: viewportPixel.x + this.cameraX,
      y: viewportPixel.y + this.cameraY,
    };
  }

  private getCanvasPosToSnapTo(
    hoveredPixelX: number,
    hoveredPixelY: number
  ): Position {
    const xPosToSnapTo = hoveredPixelX - (hoveredPixelX % this.areaSize);
    const yPosToSnapTo = hoveredPixelY - (hoveredPixelY % this.areaSize);

    return { x: xPosToSnapTo, y: yPosToSnapTo };
  }

  /**
   * This function retrieved the Viewport position to snap to given a pixel (usually the hovered pixel)
   * Used for snapping in the viewport dimensions
   * @param hoveredPixelX
   * @param hoveredPixelY
   * @returns
   */
  private getViewportPosToSnapTo(
    hoveredPixelX: number,
    hoveredPixelY: number
  ): Position {
    const canvasPosToSnapTo = this.getCanvasPosToSnapTo(
      hoveredPixelX,
      hoveredPixelY
    );

    // calc area index
    const xCellHovered = canvasPosToSnapTo.x / this.areaSize;
    const yCellHovered = canvasPosToSnapTo.y / this.areaSize;

    this.hoveredAreaIndex =
      (yCellHovered * this.canvasWidth) / this.areaSize + xCellHovered;

    return {
      x: (canvasPosToSnapTo.x * this.canvasWidth) / this.cameraViewportWidth,
      y: (canvasPosToSnapTo.y * this.canvasHeight) / this.cameraViewportHeight,
    };
  }

  // DRAWING

  /**
   * Draws something using the fullCanvasContext we obtained earlier on
   */
  private draw() {
    this.viewportContext.imageSmoothingEnabled = false;

    this.viewportContext.drawImage(
      this.fullCanvas.nativeElement,
      this.cameraX,
      this.cameraY,
      this.cameraViewportWidth,
      this.cameraViewportHeight,
      0,
      0,
      this.canvasWidth,
      this.canvasHeight
    );
  }

  private drawRectAtPos(
    position: Position,
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    color: string = "black"
  ) {
    context.fillStyle = color;
    context.strokeStyle = color;
    context.lineWidth = 0.5;
    // draw area rect
    context.beginPath();

    context.rect(position.x, position.y, width, height);
    context.stroke();
  }

  private drawClickedRect() {
    const clickedPosToSnapTo = this.getCanvasPosToSnapTo(
      this.clickedAreaPixel.x,
      this.clickedAreaPixel.y
    );

    this.drawRectAtPos(
      {
        x: clickedPosToSnapTo.x,
        y: clickedPosToSnapTo.y,
      },
      this.fullCanvasContext,
      this.areaSize,
      this.areaSize
    );
  }

  private getCanvasCoordinatesFromAreaIndex(index: number): Position {
    return {
      x: (index % (this.canvasWidth / this.areaSize)) * this.areaSize,
      y:
        Math.floor(index / (this.canvasHeight / this.areaSize)) * this.areaSize,
    };
  }

  private getAreaIndexFromCanvasCoordinates(position: Position): number {
    return (
      Math.floor(position.y / this.areaSize) * this.xCells +
      Math.floor(position.x / this.areaSize)
    );
  }

  private drawNFTRects() {
    this.nftIDsInWallet.forEach((index) => {
      const pos = this.getCanvasCoordinatesFromAreaIndex(index);
      this.drawRectAtPos(
        pos,
        this.fullCanvasContext,
        this.areaSize,
        this.areaSize,
        "white"
      );
    });
  }
}

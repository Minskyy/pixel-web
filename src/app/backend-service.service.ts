import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BackendServiceService {
  constructor(private http: HttpClient) {}

  commitPixels(pixelsObj: { [key: number]: number }) {
    return this.http.post(`/board/drawPixels/`, pixelsObj, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  getBoardBuffer() {
    return this.http.get('/board', {
      responseType: 'arraybuffer',
    });
    // .data
  }
}

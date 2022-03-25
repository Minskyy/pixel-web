import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BackendServiceService {
  constructor(private http: HttpClient) {}

  commitPixels(pixelsObj: { [key: number]: number }) {
    return this.http.post(`${environment.baseUrl}board/drawPixels/`, pixelsObj, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  getBoardBuffer() {
    return this.http.get(`${environment.baseUrl}/board`, {
      responseType: 'arraybuffer',
    });
    // .data
  }
}

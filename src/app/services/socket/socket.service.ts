import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  socket: Socket;

  constructor() { }

  join = (userId: string) =>
  {
    this.socket = io(environment.socketUrl, {transports: ['websocket']});
    this.socket.emit('joinUser', userId);
  };

  leave = (userId: string) => {
    //this.socket = io(environment.socketUrl, {transports: ["websocket"]});
    this.socket.emit('leaveUser', userId);
  };

  on(eventName: string): Observable<any> {
    const subject = new Subject();

    this.socket.on(eventName, (data: any) => {
      subject.next(data);
    });

    return subject.asObservable();
  }
}

import { Component } from '@angular/core';
import { MessagebarRef } from '../models/messagebarRef';

@Component({
  selector: 'app-messagebar',
  templateUrl: './messagebar.component.html',
  styleUrls: ['./messagebar.component.scss']
})
export class MessagebarComponent {
  constructor(
    public options: MessagebarRef
  ) {}
}

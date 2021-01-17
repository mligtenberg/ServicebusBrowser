import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-queue-message',
  templateUrl: './queue-message.component.html',
  styleUrls: ['./queue-message.component.scss']
})
export class QueueMessageComponent implements OnInit {
  value: string = '{"aa": "BB"}';
  editorOptions = { theme: 'vs-light', language: 'json' };

  constructor() { }

  ngOnInit(): void {
  }

}

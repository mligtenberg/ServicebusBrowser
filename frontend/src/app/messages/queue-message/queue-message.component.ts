import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-queue-message',
  templateUrl: './queue-message.component.html',
  styleUrls: ['./queue-message.component.scss']
})
export class QueueMessageComponent implements OnInit {
  value: string = 'const a = 1;';
  editorOptions = { theme: 'vs-dark', language: 'typescript' };

  constructor() { }

  ngOnInit(): void {
  }

}

import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenubarComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

import { Component, OnInit } from '@angular/core';
import {Store} from '@ngrx/store';
import {State} from '../../ngrx.module';
import {getMessageSetReferences} from '../../messages/ngrx/messages.selectors';
import {IMessageSetReference} from '../../messages/ngrx/messages.models';

@Component({
  selector: 'app-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss']
})
export class TabBarComponent implements OnInit {
  public tabs: IMessageSetReference[] = [];

  constructor(
    private store: Store<State>,
  ) { }

  ngOnInit(): void {
    this.store.select(getMessageSetReferences).subscribe(tabs => this.tabs = tabs);
  }

}

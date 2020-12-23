import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { State } from 'src/app/ngrx.module';
import { ContextmenuService } from 'src/app/ui/contextmenu.service';
import { disconnectConnection, selectConnection } from '../ngrx/connections.actions';
import { IConnection } from '../ngrx/connections.models';

@Component({
  selector: 'app-connection-plane-item',
  templateUrl: './connection-plane-item.component.html',
  styleUrls: ['./connection-plane-item.component.scss']
})
export class ConnectionPlaneItemComponent {
  public faEdit = faEdit;

  @Input()
  connection: IConnection | undefined;

  @ViewChild('contextMenu')
  contextMenuReference: TemplateRef<any>

  constructor(
    private store: Store<State>,
    private router: Router,
    private contextMenu: ContextmenuService
  ) { }

  edit(): void {
    if (this.connection === undefined) {
      return;
    }

    this.store.dispatch(selectConnection({
      id: this.connection.id as string
    }));
    this.router.navigate(['connections', 'edit'])
  }

  disconnect(): void {
    if (this.connection === undefined) {
      return;
    }

    this.store.dispatch(disconnectConnection({
      id: this.connection.id as string
    }));
  }

  openContextMenu($event: Event): void {
    this.contextMenu.openContextmenu({
      templateRef: this.contextMenuReference, 
      target: $event.target as HTMLElement,
      width: 300,
    });
  
    $event.stopPropagation();
  }
}

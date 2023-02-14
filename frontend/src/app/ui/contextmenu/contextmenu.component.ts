import { Component, OnInit, ChangeDetectionStrategy, Input, TemplateRef } from '@angular/core';

@Component({
    selector: 'app-contextmenu',
    templateUrl: './contextmenu.component.html',
    styleUrls: ['./contextmenu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextmenuComponent implements OnInit {
    constructor() {}

    @Input()
    public templateRef: TemplateRef<any>;
    @Input()
    public data: any;

    ngOnInit(): void {}
}

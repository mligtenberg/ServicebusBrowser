import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MessagesComponentStoreService } from '../messages-component-store.service';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-messages-body',
    templateUrl: './messages-body.component.html',
    styleUrls: ['./messages-body.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesBodyComponent {
    get currentMessageEditor$() {
        return this.componentStore.currentMessage$.pipe(
            map((message) => {
                if (!message) {
                    return undefined;
                }

                return {
                    body: message?.body,
                    editorOptions: {
                        theme: 'vs-light',
                        readOnly: true,
                        language: this.mapContentTypes(message?.properties.contentType),
                        minimap: {
                            enabled: false,
                        },
                    },
                };
            })
        );
    }

    constructor(private componentStore: MessagesComponentStoreService) {}

    private mapContentTypes(contentType: string): string {
        contentType = contentType.toLocaleLowerCase();
        if (contentType.indexOf('xml') >= 0) {
            return 'xml';
        }
        if (contentType.indexOf('json') >= 0) {
            return 'json';
        }
        if (contentType.indexOf('yaml') >= 0 || contentType.indexOf('yml') >= 0) {
            return 'yaml';
        }
        return 'text/plain';
    }
}

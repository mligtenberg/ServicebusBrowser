import { Component, computed, inject, input, model, signal } from '@angular/core';
import { Editor } from '@service-bus-browser/shared-components';
import { ColorThemeService } from '@service-bus-browser/services';
import { SelectButton } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { NgTemplateOutlet } from '@angular/common';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { UUID } from '@service-bus-browser/shared-contracts';
import { getMessagesRepository } from '@service-bus-browser/messages-db';

// FIRE_AND_FORGET_REPOSITORY: assigned in a microtask before NgRx effects run
let repository!: Awaited<ReturnType<typeof getMessagesRepository>>;
getMessagesRepository().then((r) => (repository = r));
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, from, startWith, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';


@Component({
  selector: 'lib-body-viewer',
  imports: [
    Editor,
    SelectButton,
    FormsModule,
    TableModule,
    NgTemplateOutlet,
    Button,
    Tooltip,
    Select,
    FloatLabel,
  ],
  templateUrl: './body-viewer.html',
  styleUrl: './body-viewer.scss',
  host: {
    '[class.popup]': 'isPopup()',
  },
})
export class BodyViewer {
  colorThemeService = inject(ColorThemeService);
  private route = inject(ActivatedRoute, { optional: true });
  private router = inject(Router);
  private location = inject(Location);

  header = input<string>('');
  pageId = input.required<UUID>();
  messageKey = input<string | undefined>(undefined);
  showPrettyBody = signal<'raw' | 'pretty'>('raw');
  csvDelimiter = signal(',');

  isPopup = computed(() => this.route?.snapshot.data?.['popup'] === true);

  canOpenInPopup = computed(() => !this.isPopup());

  openInPopup(): void {
    const messageKey = this.messageKey();
    if (!messageKey) {
      return;
    }
    const urlTree = this.router.createUrlTree([
      '/popups/messages/body-viewer',
      this.pageId(),
      messageKey,
    ]);
    const serialized = this.router.serializeUrl(urlTree);
    const external = this.location.prepareExternalUrl(serialized);
    const url = new URL(external, window.location.href).toString();
    window.open(url, '_blank', 'width=900,height=700');
  }

  private loadedMessage = toSignal(
    combineLatest([
      toObservable(this.pageId),
      toObservable(this.messageKey),
    ]).pipe(
      switchMap(([pageId, messageKey]) => {
        if (!messageKey) {
          return [undefined];
        }
        return from(repository.getMessage(pageId, messageKey)).pipe(
          startWith(undefined),
        );
      }),
    ),
  );

  body = computed(() => {
    const message = this.loadedMessage();
    if (!message?.body) {
      return undefined;
    }
    return new TextDecoder().decode(message.body);
  });

  contentType = computed(
    () => this.loadedMessage()?.contentType ?? 'text/plain',
  );

  prettyPrintOptions = [
    { label: 'Raw', value: 'raw' },
    { label: 'Pretty', value: 'pretty' },
  ];

  csvDelimiterOptions = [
    { label: ',', value: ',' },
    { label: ';', value: ';' },
    { label: '|', value: '|' },
    { label: 'Tab', value: '\t' },
  ];

  bodyLanguage = computed(() => {
    const contentType = this.contentType().toLowerCase();

    if (contentType.includes('json')) {
      return 'json';
    }

    if (contentType.includes('xml')) {
      return 'xml';
    }

    if (contentType.includes('yaml') || contentType.includes('yml')) {
      return 'yaml';
    }

    if (contentType.includes('ini')) {
      return 'ini';
    }

    if (contentType.includes('toml')) {
      return 'toml';
    }

    if (contentType.includes('csv')) {
      return 'csv';
    }

    return 'text';
  });

  shownBody = computed(() => {
    if (!this.body() || this.showPrettyBody() !== 'pretty') {
      return this.body();
    }

    return this.prettyPrint(
      this.body() ?? '',
      this.bodyLanguage(),
      this.csvDelimiter(),
    );
  });

  isCsvTableVisible = computed(
    () => this.showPrettyBody() === 'pretty' && this.bodyLanguage() === 'csv',
  );

  csvHeaders = computed(() => {
    if (!this.isCsvTableVisible()) {
      return [];
    }

    const [headers = []] = this.parseCsvRows(
      this.body() ?? '',
      this.csvDelimiter(),
    );
    return headers;
  });

  csvRows = computed(() => {
    if (!this.isCsvTableVisible()) {
      return [] as Array<Record<string, string>>;
    }

    const rows = this.parseCsvRows(this.body() ?? '', this.csvDelimiter());
    if (rows.length <= 1) {
      return [] as Array<Record<string, string>>;
    }

    const headers = rows[0];

    return rows.slice(1).map((row) => {
      const rowRecord: Record<string, string> = {};
      headers.forEach((header, index) => {
        rowRecord[header] = row[index] ?? '';
      });
      return rowRecord;
    });
  });

  editorOptions = computed(() => ({
    theme: this.colorThemeService.lightMode() ? 'vs-light' : 'vs-dark',
    readOnly: true,
    language: this.bodyLanguage(),
    automaticLayout: true,
    minimap: {
      enabled: false,
    },
  }));

  prettyPrintAvailable = computed(() => this.bodyLanguage() !== 'text');

  private prettyPrint(
    body: string,
    language: string,
    csvDelimiter = ',',
  ): string {
    const normalized = body.replace(/\r\n/g, '\n').trim();
    if (!normalized) {
      return body;
    }

    try {
      if (language === 'json') {
        return JSON.stringify(JSON.parse(normalized), null, 2);
      }

      if (language === 'xml') {
        return this.prettyPrintXml(normalized);
      }

      if (language === 'yaml') {
        return this.prettyPrintYaml(normalized);
      }

      if (language === 'ini' || language === 'toml') {
        return this.prettyPrintIniOrToml(normalized);
      }

      if (language === 'csv') {
        return this.prettyPrintCsv(normalized, csvDelimiter);
      }
    } catch {
      return body;
    }

    return body;
  }

  private prettyPrintXml(xml: string): string {
    const tokens = xml
      .replace(/>\s*</g, '><')
      .split(/(<[^>]+>)/g)
      .filter(Boolean);
    let indent = 0;
    const output: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const rawToken = tokens[i];
      const token = rawToken.trim();
      if (!token) {
        continue;
      }

      const nextToken = tokens[i + 1]?.trim();
      const nextNextToken = tokens[i + 2]?.trim();
      const tagName = this.getOpeningTagName(token);
      if (
        tagName &&
        nextToken &&
        nextNextToken &&
        !nextToken.startsWith('<') &&
        this.isMatchingClosingTag(nextNextToken, tagName)
      ) {
        output.push(
          `${'  '.repeat(indent)}${token}${nextToken}${nextNextToken}`,
        );
        i += 2;
        continue;
      }

      const isClosingTag = /^<\//.test(token);
      const isSelfClosingTag = /\/>$/.test(token);
      const isDeclarationOrComment = /^<\?/.test(token) || /^<!/.test(token);
      const isOpeningTag = /^<[^/!?][^>]*>$/.test(token);

      if (isClosingTag) {
        indent = Math.max(indent - 1, 0);
      }

      output.push(`${'  '.repeat(indent)}${token}`);

      if (isOpeningTag && !isSelfClosingTag && !isDeclarationOrComment) {
        indent += 1;
      }
    }

    return output.join('\n');
  }

  private getOpeningTagName(token: string): string | undefined {
    const match = token.match(/^<([A-Za-z_][\w:.-]*)\b[^>]*>$/);
    return match?.[1];
  }

  private isMatchingClosingTag(token: string, tagName: string): boolean {
    const match = token.match(/^<\/([A-Za-z_][\w:.-]*)\s*>$/);
    return match?.[1] === tagName;
  }

  private prettyPrintYaml(yaml: string): string {
    return yaml
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');
  }

  private prettyPrintIniOrToml(value: string): string {
    const lines = value
      .split('\n')
      .map((line) => line.trim())
      .filter((line, index, arr) => line !== '' || arr[index - 1] !== '');

    const output: string[] = [];

    for (const line of lines) {
      if (
        /^\[.*\]$/.test(line) &&
        output.length > 0 &&
        output[output.length - 1] !== ''
      ) {
        output.push('');
      }

      if (
        /^[^=]+=[^=]*$/.test(line) &&
        !line.startsWith('#') &&
        !line.startsWith(';')
      ) {
        const [key, ...rest] = line.split('=');
        output.push(`${key.trim()} = ${rest.join('=').trim()}`);
        continue;
      }

      output.push(line);
    }

    return output.join('\n');
  }

  private prettyPrintCsv(value: string, delimiter = ','): string {
    const rows = this.parseCsvRows(value, delimiter);
    if (rows.length === 0) {
      return value;
    }

    return rows
      .map((row) =>
        row.map((field) => this.toCsvField(field, delimiter)).join(delimiter),
      )
      .join('\n');
  }

  private parseCsvRows(value: string, delimiter = ','): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      const next = value[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          field += '"';
          i += 1;
          continue;
        }

        inQuotes = !inQuotes;
        continue;
      }

      if (value.startsWith(delimiter, i) && !inQuotes) {
        row.push(field.trim());
        field = '';
        i += delimiter.length - 1;
        continue;
      }

      if (char === '\n' && !inQuotes) {
        row.push(field.trim());
        rows.push(row);
        row = [];
        field = '';
        continue;
      }

      if (char !== '\r') {
        field += char;
      }
    }

    row.push(field.trim());
    rows.push(row);

    return rows.filter((currentRow) => currentRow.some((cell) => cell !== ''));
  }

  private toCsvField(field: string, delimiter = ','): string {
    const escaped = field.replace(/"/g, '""');
    if (escaped.includes(delimiter) || /[\n"]/.test(escaped)) {
      return `"${escaped}"`;
    }

    return escaped;
  }
}

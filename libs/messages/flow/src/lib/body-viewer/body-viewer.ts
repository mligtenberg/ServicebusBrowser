import { Component, computed, inject, input, model } from '@angular/core';
import { Editor } from '@service-bus-browser/shared-components';
import { ColorThemeService } from '@service-bus-browser/services';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { NgTemplateOutlet } from '@angular/common';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'lib-body-viewer',
  imports: [
    Editor,
    ToggleSwitch,
    FormsModule,
    TableModule,
    Dialog,
    NgTemplateOutlet,
    Button,
    Tooltip,
  ],
  templateUrl: './body-viewer.html',
  styleUrl: './body-viewer.scss',
})
export class BodyViewer {
  colorThemeService = inject(ColorThemeService);

  header = input<string>('');
  body = input.required<string | undefined>();
  contentType = input.required<string>();
  showPrettyBody = model(false);
  displayBodyFullscreen = model(false);

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
    if (!this.body() || !this.showPrettyBody()) {
      return this.body();
    }

    return this.prettyPrint(this.body() ?? '', this.bodyLanguage());
  });

  isCsvTableVisible = computed(
    () => this.showPrettyBody() && this.bodyLanguage() === 'csv',
  );

  csvHeaders = computed(() => {
    if (!this.isCsvTableVisible()) {
      return [];
    }

    const [headers = []] = this.parseCsvRows(this.body() ?? '');
    return headers;
  });

  csvRows = computed(() => {
    if (!this.isCsvTableVisible()) {
      return [] as Array<Record<string, string>>;
    }

    const rows = this.parseCsvRows(this.body() ?? '');
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

  private prettyPrint(body: string, language: string): string {
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
        return this.prettyPrintCsv(normalized);
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

  private prettyPrintCsv(value: string): string {
    const rows = this.parseCsvRows(value);
    if (rows.length === 0) {
      return value;
    }

    return rows
      .map((row) => row.map((field) => this.toCsvField(field)).join(','))
      .join('\n');
  }

  private parseCsvRows(value: string): string[][] {
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

      if (char === ',' && !inQuotes) {
        row.push(field.trim());
        field = '';
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

  private toCsvField(field: string): string {
    const escaped = field.replace(/"/g, '""');
    if (/[,\n"]/.test(escaped)) {
      return `"${escaped}"`;
    }

    return escaped;
  }
}

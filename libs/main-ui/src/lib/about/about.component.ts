import { Component, OnInit, signal, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { SbbDataGrid, SbbColumn } from '@service-bus-browser/shared-ui';

interface PackageInfo {
  name: string;
  version: string;
  author: string;
  license: string;
  homepage: string;
}

@Component({
  selector: 'lib-about',
  standalone: true,
  imports: [SbbDataGrid],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  http = inject(HttpClient);
  packages = signal<PackageInfo[]>([]);
  info = signal<{version:string; author:string; homepage:string}>({version:'', author:'', homepage:''});

  columns: SbbColumn<PackageInfo>[] = [
    { field: 'name', header: 'Name', width: '25%' },
    { field: 'version', header: 'Version', width: '25%' },
    { field: 'author', header: 'Author', width: '25%' },
    { field: 'license', header: 'License', width: '25%' }
  ];

  ngOnInit() {
    this.http.get<PackageInfo[]>('./assets/packages.json').subscribe(p => this.packages.set(p));
    this.http.get<{version:string; author:string; homepage:string}>('./assets/app-info.json').subscribe(i => this.info.set(i));
  }
}

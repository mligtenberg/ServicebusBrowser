import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';

interface PackageInfo {
  name: string;
  version: string;
  author: string;
  license: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  http = inject(HttpClient);
  packages = signal<PackageInfo[]>([]);
  info = signal<{version:string; author:string}>({version:'', author:''});

  ngOnInit() {
    this.http.get<PackageInfo[]>('/packages.json').subscribe(p => this.packages.set(p));
    this.http.get<{version:string; author:string}>('/app-info.json').subscribe(i => this.info.set(i));
  }
}

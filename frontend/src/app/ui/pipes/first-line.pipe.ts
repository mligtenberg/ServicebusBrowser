import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstLine'
})
export class FirstLinePipe implements PipeTransform {

  transform(value: string, ...args: string[]): string {
    var lines = value.split("\n");
    return lines.length === 1 ? lines[0] : lines[0] + "..."
  }

}

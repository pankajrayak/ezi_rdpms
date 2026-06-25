import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[noCutCopyPaste]'
})
export class NoCutCopyPasteDirective {

    @HostListener('paste', ['$event'])
    @HostListener('copy', ['$event'])
    @HostListener('cut', ['$event'])
    blockCopy(event: ClipboardEvent) {
        event.preventDefault();
    }

    @HostListener('contextmenu', ['$event'])
    blockContextMenu(event: MouseEvent) {
        event.preventDefault();
    }
}

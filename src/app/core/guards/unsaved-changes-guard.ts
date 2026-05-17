import { CanDeactivateFn } from '@angular/router';
import { HasUnsavedChanges } from '../interfaces';

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
    if(typeof component?.hasUnsavedChanges === 'function' && component.hasUnsavedChanges()) {
        return confirm('You have unsaved changes. Do you really want to leave?');
    }
    return true;
};

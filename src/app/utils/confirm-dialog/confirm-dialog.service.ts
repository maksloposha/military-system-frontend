import { Injectable, ApplicationRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  constructor(
    private appRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector
  ) {}

  open(message: string, confirmText = 'OK', cancelText = 'Cancel'): Promise<boolean> {
    return new Promise((resolve) => {
      const componentRef = this.componentFactoryResolver
        .resolveComponentFactory(ConfirmDialogComponent)
        .create(this.injector);

      componentRef.instance.message = message;
      componentRef.instance.confirmText = confirmText;
      componentRef.instance.cancelText = cancelText;

      componentRef.instance.confirm.subscribe(() => {
        resolve(true);
        this.destroy(componentRef);
      });

      componentRef.instance.cancel.subscribe(() => {
        resolve(false);
        this.destroy(componentRef);
      });

      this.appRef.attachView(componentRef.hostView);
      const domElem = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);
    });
  }

  private destroy(componentRef: any) {
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
  }
}
